'use client';

import React, { useEffect, useImperativeHandle, forwardRef } from 'react';
import dynamic from 'next/dynamic';
import { Box } from '@mui/material';

// Dynamically import the markdown editor to avoid SSR issues
const MdEditor = dynamic(
  () => import('@uiw/react-md-editor'),
  { 
    ssr: false
  }
);

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export interface MarkdownEditorRef {
  insertText: (text: string) => void;
}

const MarkdownEditor = forwardRef<MarkdownEditorRef, MarkdownEditorProps>(({ value, onChange }, ref) => {
  useImperativeHandle(ref, () => ({
    insertText: (text: string) => {
      // Try to find the textarea element
      const textarea = document.querySelector('.w-md-editor-text-textarea') as HTMLTextAreaElement;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const textBefore = value.substring(0, start);
        const textAfter = value.substring(end);
        const newValue = textBefore + text + textAfter;
        onChange(newValue);
        
        // Set cursor position after inserted text
        setTimeout(() => {
          textarea.focus();
          const newCursorPos = start + text.length;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
      } else {
        // Fallback: append to end
        onChange(value + '\n' + text);
      }
    },
  }));
  useEffect(() => {
    // Function to fix empty src images
    const fixEmptySrcImages = () => {
      const previews = document.querySelectorAll('.w-md-editor-preview');
      previews.forEach((preview) => {
        const images = preview.querySelectorAll('img');
        images.forEach((img) => {
          if (!img.src || img.src === '' || img.getAttribute('src') === '') {
            img.remove();
          }
        });
      });
    };

    // Fix images immediately
    fixEmptySrcImages();

    // Watch for new images being added
    const observer = new MutationObserver(() => {
      fixEmptySrcImages();
    });

    // Observe all preview containers
    const previews = document.querySelectorAll('.w-md-editor-preview');
    previews.forEach((preview) => {
      observer.observe(preview, {
        childList: true,
        subtree: true,
      });
    });

    // Also observe the document for dynamically added editors
    const documentObserver = new MutationObserver(() => {
      fixEmptySrcImages();
      const newPreviews = document.querySelectorAll('.w-md-editor-preview');
      newPreviews.forEach((preview) => {
        observer.observe(preview, {
          childList: true,
          subtree: true,
        });
      });
    });

    documentObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Add global styles for fullscreen mode
    const style = document.createElement('style');
    style.textContent = `
      .w-md-editor-fullscreen {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(30, 30, 30, 0.9) 100%) !important;
        z-index: 9999 !important;
      }
      .w-md-editor-fullscreen .w-md-editor {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(30, 30, 30, 0.9) 100%) !important;
      }
      .w-md-editor-fullscreen .w-md-editor-preview table,
      .w-md-editor-fullscreen .w-md-editor-preview table thead,
      .w-md-editor-fullscreen .w-md-editor-preview table tbody,
      .w-md-editor-fullscreen .w-md-editor-preview table tr,
      .w-md-editor-fullscreen .w-md-editor-preview table td,
      .w-md-editor-fullscreen .w-md-editor-preview table th {
        background: transparent !important;
        background-color: transparent !important;
      }
      .w-md-editor-fullscreen .w-md-editor-preview .wmde-markdown,
      .w-md-editor-fullscreen .w-md-editor-preview .wmde-markdown-color,
      .w-md-editor-fullscreen .w-md-editor-preview .wmde-markdown-var {
        background: transparent !important;
        background-color: transparent !important;
      }
      .w-md-editor-preview ol,
      .w-md-editor-fullscreen .w-md-editor-preview ol {
        list-style: decimal !important;
        padding-left: 1.5em !important;
      }
      .w-md-editor-preview ul,
      .w-md-editor-fullscreen .w-md-editor-preview ul {
        list-style: disc !important;
        padding-left: 1.5em !important;
      }
      .w-md-editor-preview li,
      .w-md-editor-fullscreen .w-md-editor-preview li {
        display: list-item !important;
        list-style-position: outside !important;
      }
      .w-md-editor-preview ol li,
      .w-md-editor-fullscreen .w-md-editor-preview ol li {
        list-style-type: decimal !important;
      }
      .w-md-editor-preview ul li,
      .w-md-editor-fullscreen .w-md-editor-preview ul li {
        list-style-type: disc !important;
      }
      .w-md-editor-text-textarea .token,
      .w-md-editor-text-textarea .token-string,
      .w-md-editor-text-textarea .token-punctuation,
      .w-md-editor-text-textarea .token-property,
      .w-md-editor-text-textarea .token-attr-name,
      .w-md-editor-text-textarea .token-attr-value,
      .w-md-editor-text-textarea .token-keyword,
      .w-md-editor-text-textarea .token-comment,
      .w-md-editor-text-textarea .token-operator,
      .w-md-editor-text-textarea .token-number,
      .w-md-editor-text-textarea .token-function,
      .w-md-editor-text-textarea .token-variable,
      .w-md-editor-text-textarea .token-class-name,
      .w-md-editor-text-textarea .token-tag,
      .w-md-editor-text-textarea .token-selector,
      .w-md-editor-text-textarea .token-attr,
      .w-md-editor-text-textarea span[class*="token"] {
        background: transparent !important;
        background-color: transparent !important;
        color: inherit !important;
      }
      .w-md-editor-preview img[src=""],
      .w-md-editor-fullscreen .w-md-editor-preview img[src=""] {
        display: none !important;
      }
      .w-md-editor-preview img:not([src]),
      .w-md-editor-fullscreen .w-md-editor-preview img:not([src]) {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      if (observer) observer.disconnect();
      if (documentObserver) documentObserver.disconnect();
      if (style && style.parentNode) document.head.removeChild(style);
    };
  }, []);

  return (
    <Box sx={{ 
      height: '100%', 
      overflow: 'auto',
      '&::-webkit-scrollbar': {
        width: '8px',
      },
      '&::-webkit-scrollbar-track': {
        background: 'transparent',
      },
      scrollbarWidth: 'thin',
      '& .w-md-editor': {
        backgroundColor: 'transparent !important',
        height: '100%',
      },
      '& .w-md-editor-text': {
        backgroundColor: 'transparent !important',
      },
      '& .w-md-editor-text-pre': {
        backgroundColor: 'transparent !important',
      },
      '& .w-md-editor-text-textarea': {
        backgroundColor: 'transparent !important',
        '& [class*="token"]': {
          backgroundColor: 'transparent !important',
          color: 'inherit !important',
        },
      },
      '& .w-md-editor-preview': {
        backgroundColor: 'transparent !important',
        '& .wmde-markdown': {
          backgroundColor: 'transparent !important',
        },
        '& .wmde-markdown-color': {
          backgroundColor: 'transparent !important',
        },
        '& .wmde-markdown-var': {
          backgroundColor: 'transparent !important',
        },
        // Fix table background colors
        '& table': {
          backgroundColor: 'transparent !important',
        },
        '& table thead': {
          backgroundColor: 'transparent !important',
        },
        '& table tbody': {
          backgroundColor: 'transparent !important',
        },
        '& table tr': {
          backgroundColor: 'transparent !important',
        },
        '& table td': {
          backgroundColor: 'transparent !important',
        },
        '& table th': {
          backgroundColor: 'transparent !important',
        },
        // Ensure list markers are visible
        '& ol': {
          listStyle: 'decimal !important',
          paddingLeft: '1.5em !important',
        },
        '& ul': {
          listStyle: 'disc !important',
          paddingLeft: '1.5em !important',
        },
        '& li': {
          display: 'list-item !important',
          listStylePosition: 'outside !important',
        },
        '& ol li': {
          listStyleType: 'decimal !important',
        },
        '& ul li': {
          listStyleType: 'disc !important',
        },
        // Hide images with empty src to prevent warnings
        '& img[src=""]': {
          display: 'none !important',
        },
        '& img:not([src])': {
          display: 'none !important',
        },
      },
      '& .w-md-editor-text-textarea, & .w-md-editor-text-pre': {
        background: 'transparent !important',
      },
      '& .w-md-editor-text-textarea [class*="token"]': {
        backgroundColor: 'transparent !important',
        color: 'inherit !important',
      },
      '& .w-md-editor-bottom': {
        display: 'none !important',
      },
      '& .w-md-editor-footer': {
        display: 'none !important',
      },
      '& .w-md-editor-toolbar': {
        backgroundColor: 'transparent !important',
      },
      // Fullscreen mode styling - use same background as normal mode
      '& .w-md-editor-fullscreen': {
        backgroundColor: 'transparent !important',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(30, 30, 30, 0.9) 100%) !important',
        zIndex: 9999,
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#0f0f10',
          zIndex: -1,
        },
      },
      '& .w-md-editor-fullscreen .w-md-editor': {
        backgroundColor: 'transparent !important',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(30, 30, 30, 0.9) 100%) !important',
      },
      '& .w-md-editor-fullscreen .w-md-editor-text': {
        backgroundColor: 'transparent !important',
      },
      '& .w-md-editor-fullscreen .w-md-editor-text-pre': {
        backgroundColor: 'transparent !important',
      },
      '& .w-md-editor-fullscreen .w-md-editor-text-textarea': {
        backgroundColor: 'transparent !important',
      },
      '& .w-md-editor-fullscreen .w-md-editor-preview': {
        backgroundColor: 'transparent !important',
        '& .wmde-markdown': {
          backgroundColor: 'transparent !important',
        },
        '& .wmde-markdown-color': {
          backgroundColor: 'transparent !important',
        },
        '& .wmde-markdown-var': {
          backgroundColor: 'transparent !important',
        },
        // Fix table background in fullscreen mode
        '& table': {
          backgroundColor: 'transparent !important',
          background: 'transparent !important',
        },
        '& table thead': {
          backgroundColor: 'transparent !important',
          background: 'transparent !important',
        },
        '& table tbody': {
          backgroundColor: 'transparent !important',
          background: 'transparent !important',
        },
        '& table tr': {
          backgroundColor: 'transparent !important',
          background: 'transparent !important',
        },
        '& table td': {
          backgroundColor: 'transparent !important',
          background: 'transparent !important',
        },
        '& table th': {
          backgroundColor: 'transparent !important',
          background: 'transparent !important',
        },
        // Ensure list markers are visible in fullscreen
        '& ol': {
          listStyle: 'decimal !important',
          paddingLeft: '1.5em !important',
        },
        '& ul': {
          listStyle: 'disc !important',
          paddingLeft: '1.5em !important',
        },
        '& li': {
          display: 'list-item !important',
          listStylePosition: 'outside !important',
        },
        '& ol li': {
          listStyleType: 'decimal !important',
        },
        '& ul li': {
          listStyleType: 'disc !important',
        },
        // Fix image alt text background in fullscreen
        '& img[src=""]': {
          display: 'none !important',
        },
        '& img:not([src])': {
          display: 'none !important',
        },
      },
      '& .w-md-editor-fullscreen .w-md-editor-toolbar': {
        backgroundColor: 'transparent !important',
      },
    }}>
      <MdEditor
        value={value}
        onChange={(newValue) => onChange(newValue || '')}
        height="100%"
        visibleDragbar={false}
        data-color-mode="dark"
      />
    </Box>
  );
});

MarkdownEditor.displayName = 'MarkdownEditor';

export default MarkdownEditor;