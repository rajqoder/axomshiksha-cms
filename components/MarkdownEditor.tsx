'use client';

import React, { useEffect, useImperativeHandle, forwardRef } from 'react';
import dynamic from 'next/dynamic';
import { Box } from '@mui/material';
import { parseAndRenderShortcodes } from './ShortcodeToolbar';
import remarkGfm from 'remark-gfm';

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

// Track flex depth across preview rendering so we can avoid parsing
// child shortcodes inside flex blocks.
let previewFlexDepth = 0;

// Helper to process children and render shortcodes, while skipping
// shortcode rendering when we're inside a flex block.
const processChildrenForShortcodes = (
  children: any,
  renderWithProcessed: (processed: React.ReactNode) => React.ReactElement,
  fallback: React.ReactElement
): React.ReactElement => {
  const processTextSegment = (text: string): React.ReactNode => {
    if (!text) return text;

    const hasShortcodes = /\{\{<[\s\S]*?>\}\}/.test(text);
    const hasFlexStart = /\{\{<\s*flex([^>]*?)\s*>\}\}/.test(text);
    const hasFlexEnd = /\{\{<\s*\/flex\s*>\}\}/.test(text);

    const insideFlex = previewFlexDepth > 0 || hasFlexStart;

    // Update depth after computing insideFlex for this segment
    if (hasFlexStart) previewFlexDepth += 1;
    if (hasFlexEnd) previewFlexDepth = Math.max(0, previewFlexDepth - 1);

    // If no shortcodes or we're inside a flex block, return raw text with preserved line breaks
    if (!hasShortcodes || insideFlex) {
      // Wrap in a span with pre-wrap to preserve line breaks
      return (
        <span style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.875rem' }}>
          {text}
        </span>
      );
    }

    const rendered = parseAndRenderShortcodes(text);
    return rendered || text;
  };

  if (typeof children === 'string') {
    const hasShortcodes = /\{\{<[\s\S]*?>\}\}/.test(children);
    if (!hasShortcodes) {
      return fallback;
    }

    const processed = processTextSegment(children);
    if (processed !== children) {
      return renderWithProcessed(processed);
    }
  } else if (Array.isArray(children)) {
    const hasShortcodes = children.some(
      (child) => typeof child === 'string' && /\{\{<[\s\S]*?>\}\}/.test(child)
    );

    if (hasShortcodes) {
      const processedChildren = children.map((child) =>
        typeof child === 'string' ? processTextSegment(child) : child
      );
      return renderWithProcessed(processedChildren);
    }
  }

  return fallback;
};

const MarkdownEditor = forwardRef<MarkdownEditorRef, MarkdownEditorProps>(({ value, onChange }, ref) => {
  // Reset flex depth for each render cycle of the editor preview
  previewFlexDepth = 0;
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
      
      body:has(.w-md-editor-fullscreen) #admin-layout {
        z-index: 2000 !important;
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
        color: '#e5e7eb !important',
      },
      '& .w-md-editor-toolbar': {
        backgroundColor: 'rgba(255, 255, 255, 0.05) !important',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1) !important',
        '& li > button': {
          color: '#e5e7eb !important',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1) !important',
          }
        },
        '& svg': {
          width: '18px !important',
          height: '18px !important',
        }
      },
      '& .w-md-editor-content': {
        backgroundColor: 'transparent !important',
      },
      '& .w-md-editor-text': {
        background: 'transparent !important',
        '& *': {
          background: 'transparent !important',
        }
      },
      '& .w-md-editor-text-pre': {
        background: 'transparent !important',
      },
      '& .w-md-editor-text-input': {
        color: '#e5e7eb !important',
        background: 'transparent !important',
        WebkitTextFillColor: '#e5e7eb !important',
      },
      '& .w-md-editor-text-textarea': {
        background: 'transparent !important',
      },
      '& .w-md-editor-preview': {
        background: 'transparent !important',
        boxShadow: 'none !important',
        color: '#e5e7eb !important',
        borderLeft: '1px solid rgba(255, 255, 255, 0.1) !important',
        '& .wmde-markdown': {
          background: 'transparent !important',
          color: '#e5e7eb !important',
        }
      },

      // Fullscreen Overrides
      '& .w-md-editor-fullscreen': {
        position: 'fixed !important',
        top: '0 !important',
        left: '0 !important',
        width: '100vw !important',
        height: '100vh !important',
        zIndex: '99999 !important',
        margin: '0 !important',
        backgroundColor: '#0f0f10 !important',
        background: 'linear-gradient(135deg, rgba(20, 20, 20, 1) 0%, rgba(30, 30, 30, 1) 100%) !important',
      },
      '& .w-md-editor-fullscreen .w-md-editor-toolbar': {
        position: 'sticky',
        top: 0,
        zIndex: '100000 !important',
        backgroundColor: 'rgba(20, 20, 20, 0.95) !important',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        '& li > button': {
          color: '#ffffff !important',
        }
      }
    }}>
      <MdEditor
        value={value}
        onChange={(newValue) => onChange(newValue || '')}
        height="100%"
        visibleDragbar={false}
        data-color-mode="dark"
        previewOptions={{
          components: {
            // Process shortcodes in paragraph content
            p: ({ children, ...props }: any) => {
              return processChildrenForShortcodes(children, (processed) => <p {...props}>{processed}</p>, <p {...props}>{children}</p>);
            },
            // Handle shortcodes in list items
            li: ({ children, ...props }: any) => {
              return processChildrenForShortcodes(children, (processed) => <li {...props}>{processed}</li>, <li {...props}>{children}</li>);
            },
            // Handle shortcodes in other text elements
            strong: ({ children, ...props }: any) => {
              return processChildrenForShortcodes(children, (processed) => <strong {...props}>{processed}</strong>, <strong {...props}>{children}</strong>);
            },
            em: ({ children, ...props }: any) => {
              return processChildrenForShortcodes(children, (processed) => <em {...props}>{processed}</em>, <em {...props}>{children}</em>);
            },
          },
          remarkPlugins: [remarkGfm],
        }}
      />
    </Box>
  );
});

MarkdownEditor.displayName = 'MarkdownEditor';

export default MarkdownEditor;