'use client';

import React from 'react';
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

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ value, onChange }) => {
  return (
    <Box sx={{ height: '100%', maxHeight: '80vh', overflow: 'auto' }}>
      <MdEditor
        value={value}
        onChange={(newValue) => onChange(newValue || '')}
        height="100%"
        visibleDragbar={false}
      />
    </Box>
  );
};

export default MarkdownEditor;