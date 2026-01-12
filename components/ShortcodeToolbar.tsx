'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  IconButton,
  Tooltip,
  InputAdornment,
  Divider,
  Paper,
} from '@mui/material';
import {
  Square,
  Minus,
  Layout,
  Table,
  Underline,
  Box as BoxIcon,
  X,
  Eye,
  HelpCircle,
  Maximize2,
  Minimize2,
  RotateCcw,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Helper function to parse shortcode syntax and render preview components
const parseAndRenderShortcodes = (content: string): React.ReactNode => {
  if (!content || content.trim() === '') return null;

  // Parse shortcode patterns: {{< shortcode-name params >}} or {{< shortcode-name >}}
  // Note: shortcode names can contain hyphens (e.g., content-box, empty-box, underscored-space)
  const shortcodePattern = /\{\{<\s*([\w-]+)([^>]*?)\s*>\}\}/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  const matches: RegExpExecArray[] = [];
  
  // Collect all matches first
  while ((match = shortcodePattern.exec(content)) !== null) {
    matches.push(match);
  }

  matches.forEach((match, idx) => {
    // Add text before the shortcode
    if (match.index > lastIndex) {
      const textBefore = content.substring(lastIndex, match.index);
      // Only add non-whitespace text
      const trimmed = textBefore.trim();
      if (trimmed) {
        parts.push(<span key={`text-${lastIndex}`}>{trimmed}</span>);
      }
    }

    const shortcodeName = match[1];
    const paramsString = match[2] || '';
    
    // Parse parameters
    const params: { [key: string]: string } = {};
    const paramPattern = /(\w+)="([^"]*)"/g;
    let paramMatch;
    while ((paramMatch = paramPattern.exec(paramsString)) !== null) {
      params[paramMatch[1]] = paramMatch[2];
    }

    // Render the appropriate shortcode preview
    switch (shortcodeName) {
      case 'line':
        parts.push(
          <span
            key={`shortcode-${match.index}`}
            className="inline-block border-b max-w-full"
            style={{
              borderColor: params.color || '#6b7280',
              width: params.width || '100%',
              height: params.height || '1px',
              marginTop: params.marginY && params.marginY !== '0' ? params.marginY : undefined,
              marginBottom: params.marginY && params.marginY !== '0' ? params.marginY : undefined,
              marginLeft: params.marginX && params.marginX !== '0' ? params.marginX : undefined,
              marginRight: params.marginX && params.marginX !== '0' ? params.marginX : undefined,
              flex: params.flex || undefined,
            }}
          />
        );
        break;
      
      case 'empty-box':
        parts.push(
          <div
            key={`shortcode-${match.index}`}
            className="inline-flex border rounded-sm"
            style={{
              width: params.width || '5.5rem',
              height: params.height || '2.5rem',
              borderColor: params.borderColor || '#3b82f6',
              marginTop: params.marginY && params.marginY !== '0' ? params.marginY : undefined,
              marginBottom: params.marginY && params.marginY !== '0' ? params.marginY : undefined,
              marginLeft: params.marginX && params.marginX !== '0' ? params.marginX : undefined,
              marginRight: params.marginX && params.marginX !== '0' ? params.marginX : undefined,
              flex: params.flex || undefined,
            }}
          />
        );
        break;
      
      case 'content-box':
        if (params.type === 'heading') {
          parts.push(
            <div key={`shortcode-${match.index}`} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: params.flex || undefined }}>
              <div
                style={{
                  display: 'flex',
                  paddingLeft: '1rem',
                  paddingRight: '1rem',
                  border: `1px solid ${params.borderColor || '#3b82f6'}`,
                  borderRadius: '0.375rem',
                  marginTop: params.marginY && params.marginY !== '0' ? params.marginY : undefined,
                  marginBottom: params.marginY && params.marginY !== '0' ? params.marginY : undefined,
                  marginLeft: params.marginX && params.marginX !== '0' ? params.marginX : undefined,
                  marginRight: params.marginX && params.marginX !== '0' ? params.marginX : undefined,
                  backgroundColor: params.bgColor && params.bgColor !== 'transparent' ? params.bgColor : undefined,
                  color: params.textColor || undefined,
                }}
              >
                {params.heading ? <ReactMarkdown>{params.heading}</ReactMarkdown> : (params.content ? <ReactMarkdown>{params.content}</ReactMarkdown> : 'Content')}
              </div>
            </div>
          );
        } else {
          parts.push(
            <div
              key={`shortcode-${match.index}`}
              style={{
                display: 'inline-flex',
                border: `1px solid ${params.borderColor || '#3b82f6'}`,
                paddingLeft: '1rem',
                paddingRight: '1rem',
                paddingTop: '0.5rem',
                paddingBottom: '0.5rem',
                borderRadius: '0.375rem',
                marginTop: params.marginY && params.marginY !== '0' ? params.marginY : undefined,
                marginBottom: params.marginY && params.marginY !== '0' ? params.marginY : undefined,
                marginLeft: params.marginX && params.marginX !== '0' ? params.marginX : undefined,
                marginRight: params.marginX && params.marginX !== '0' ? params.marginX : undefined,
                width: params.width && params.width !== 'auto' ? params.width : undefined,
                height: params.height && params.height !== 'auto' ? params.height : undefined,
                backgroundColor: params.bgColor && params.bgColor !== 'transparent' ? params.bgColor : undefined,
                color: params.bgColor === 'white' ? 'black' : (params.textColor || undefined),
                flex: params.flex || undefined,
              }}
            >
              {params.content ? <ReactMarkdown>{params.content}</ReactMarkdown> : 'Content'}
            </div>
          );
        }
        break;
      
      case 'underscored-space':
        const count = parseInt(params.no || '1') || 1;
        const spaces = Array.from({ length: count }).map((_, idx) => (
          <span
            key={`space-${idx}`}
            style={{
              display: 'inline-block',
              borderBottom: `1px solid ${params.color || '#6b7280'}`,
              userSelect: 'none',
              marginTop: idx > 0 ? '1rem' : undefined,
              height: '0.25rem',
              maxWidth: '100%',
              width: params.width || '6rem',
            }}
          />
        ));
        parts.push(
          <Box 
            key={`shortcode-${match.index}`}
            sx={{ 
              marginTop: params.marginY && params.marginY !== '0' ? params.marginY : undefined,
              marginBottom: params.marginY && params.marginY !== '0' ? params.marginY : undefined,
              marginLeft: params.marginX && params.marginX !== '0' ? params.marginX : undefined,
              marginRight: params.marginX && params.marginX !== '0' ? params.marginX : undefined,
            }}
          >
            {spaces}
          </Box>
        );
        break;
      
      default:
        // Unknown shortcode, show as text
        parts.push(<span key={`shortcode-${match.index}`} style={{ opacity: 0.5 }}>{match[0]}</span>);
    }

    lastIndex = match.index + match[0].length;
  });

  // Add remaining text
  if (lastIndex < content.length) {
    const remainingText = content.substring(lastIndex).trim();
    if (remainingText) {
      parts.push(<span key={`text-${lastIndex}`}>{remainingText}</span>);
    }
  }

  return parts.length > 0 ? <>{parts}</> : null;
};

// Helper function to parse and render markdown tables, handling tables without headers
const renderMarkdownTables = (markdown: string) => {
  if (!markdown || markdown.trim() === '') return null;

  const isRow = (l: string) => /^\|.*\|$/.test(l.trim());
  const isSeparator = (l: string) => /^\|[\s\-:|]+\|$/.test(l.trim());

  const isEmptyHeaderRow = (row: string) => {
    const cells = row.split('|').slice(1, -1);
    return cells.every(c => c.trim() === '');
  };

  const lines = markdown.split('\n');
  const blocks: { block: string; headingless: boolean }[] = [];

  let buffer: string[] = [];
  let inTable = false;

  const flush = () => {
    if (!buffer.length) return;

    let headingless = false;
    let result: string[] = [];

    for (let i = 0; i < buffer.length; i++) {
      // Detect empty header row followed by separator
      if (
        i < buffer.length - 1 &&
        isRow(buffer[i]) &&
        isSeparator(buffer[i + 1]) &&
        isEmptyHeaderRow(buffer[i])
      ) {
        headingless = true;
        // Keep the header row (required), but mark table as headingless
      }
      result.push(buffer[i]);
    }

    blocks.push({
      block: result.join('\n'),
      headingless,
    });

    buffer = [];
  };

  for (const line of lines) {
    if (isRow(line) || isSeparator(line)) {
      inTable = true;
      buffer.push(line);
    } else {
      if (inTable) {
        flush();
        inTable = false;
      }
    }
  }

  if (inTable) flush();

  return (
    <>
      {blocks.map((item, idx) => (
        <Box
          key={idx}
          sx={{
            width: '100%',
            alignSelf: 'flex-start',
            '& table': {
              width: '100%',
              borderCollapse: 'collapse',
            },
            '& th, & td': {
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '8px',
              textAlign: 'left',
            },
            ...(item.headingless && {
              '& thead': {
                display: 'none',
              },
            }),
          }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {item.block}
          </ReactMarkdown>
        </Box>
      ))}
    </>
  );
};



// Helper function to convert color name to hex (for backward compatibility)
const colorNameToHex = (colorName: string): string => {
  const colorMap: { [key: string]: string } = {
    'gray-500': '#6b7280',
    'main': '#3b82f6', // blue-500 as main
    'transparent': 'transparent',
  };
  return colorMap[colorName.toLowerCase()] || colorName;
};

// Helper function to convert hex to color name (for display)
const hexToColorName = (hex: string): string => {
  const colorMap: { [key: string]: string } = {
    '#6b7280': 'gray-500',
    '#3b82f6': 'main',
    'transparent': 'transparent',
  };
  return colorMap[hex.toLowerCase()] || hex;
};

// Color Picker Component
interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  allowTransparent?: boolean;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  value,
  onChange,
  placeholder,
  allowTransparent = false,
}) => {
  // Convert color name to hex for color input
  const getHexValue = (val: string): string => {
    if (val === 'transparent') return '#ffffff';
    if (val.startsWith('#')) return val;
    return colorNameToHex(val);
  };

  // Handle color input change
  const handleColorInputChange = (hex: string) => {
    onChange(hex);
  };

  // Get display value for text field
  const getDisplayValue = (): string => {
    if (value === 'transparent') return 'transparent';
    if (value.startsWith('#')) return value;
    // Convert color name to hex for display
    return colorNameToHex(value);
  };

  const displayValue = getDisplayValue();

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <TextField
        fullWidth
        size="small"
        label={label}
        value={displayValue}
        onChange={(e) => {
          const newValue = e.target.value.trim();
          if (newValue === 'transparent' && allowTransparent) {
            onChange('transparent');
          } else if (newValue.startsWith('#')) {
            // Validate hex color format
            if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
              onChange(newValue);
            } else if (newValue.length <= 7) {
              // Allow typing
              onChange(newValue);
            }
          } else if (newValue === '' && allowTransparent) {
            onChange('transparent');
          } else if (newValue === '') {
            onChange('#000000');
          }
        }}
        placeholder={placeholder || (allowTransparent ? 'transparent or #hex' : '#hex')}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <input
                type="color"
                value={getHexValue(value)}
                onChange={(e) => handleColorInputChange(e.target.value)}
                style={{
                  width: '32px',
                  height: '32px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  padding: '2px',
                  backgroundColor: value === 'transparent' ? '#ffffff' : getHexValue(value),
                }}
              />
            </InputAdornment>
          ),
        }}
      />
      {allowTransparent && (
        <Button
          size="small"
          variant={value === 'transparent' ? 'contained' : 'outlined'}
          onClick={() => onChange('transparent')}
          sx={{ minWidth: '90px' }}
        >
          Transparent
        </Button>
      )}
    </Box>
  );
};

interface ShortcodeToolbarProps {
  onInsert: (shortcode: string) => void;
}

interface ShortcodeDialogProps {
  open: boolean;
  onClose: () => void;
  onInsert: (shortcode: string) => void;
  shortcodeType: string;
}

// Preview Section Component
interface PreviewSectionProps {
  title?: string;
  children: React.ReactNode;
}

const PreviewSection: React.FC<PreviewSectionProps> = ({ children }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Prevent body scroll when fullscreen is active
  React.useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  if (isFullscreen) {
    return (
      <>
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999,
            bgcolor: 'background.default',
            display: 'flex',
            flexDirection: 'column',
            p: 2,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Live Preview - Fullscreen</Typography>
            <IconButton onClick={handleFullscreen} size="small">
              <Minimize2 size={20} />
            </IconButton>
          </Box>
          <Paper
            sx={{
              p: 2,
              bgcolor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
              flex: 1,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              overflow: 'auto',
            }}
          >
            <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
              {children}
            </Box>
          </Paper>
        </Box>
      </>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden', position: 'relative' }}>
      <Paper
        sx={{
          p: 2,
          bgcolor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 2,
          flex: 1,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          overflow: 'auto',
          minHeight: 0,
          position: 'relative',
        }}
      >
        <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}>
          <Tooltip title="Fullscreen Preview" arrow>
            <IconButton onClick={handleFullscreen} size="small" sx={{ p: 0.5, bgcolor: 'transparent', '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.1)' } }}>
              <Maximize2 size={16} />
            </IconButton>
          </Tooltip>
        </Box>
        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          {children}
        </Box>
      </Paper>
    </Box>
  );
};

// Helper component for number input with unit selector
interface NumberWithUnitInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  defaultUnit?: 'px' | 'rem';
  allowAuto?: boolean;
  allowPercent?: boolean;
}

const NumberWithUnitInput: React.FC<NumberWithUnitInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  defaultUnit = 'rem',
  allowAuto = false,
  allowPercent = false,
}) => {
  // Parse value to extract number and unit
  const parseValue = (val: string): { number: string; unit: 'px' | 'rem' | 'auto' | 'percent' } => {
    if (allowAuto && val === 'auto') {
      return { number: '', unit: 'auto' };
    }
    if (val.includes('%')) {
      // Extract the number part from percentage
      const percentMatch = val.match(/^([\d.]+)%$/);
      if (percentMatch) {
        return { number: percentMatch[1], unit: 'percent' };
      }
      return { number: val.replace('%', ''), unit: 'percent' };
    }
    // If it's a complex value like "1.125rem", try to extract
    const remMatch = val.match(/^([\d.]+)rem$/);
    if (remMatch) {
      return { number: remMatch[1], unit: 'rem' };
    }
    const pxMatch = val.match(/^([\d.]+)px$/);
    if (pxMatch) {
      return { number: pxMatch[1], unit: 'px' };
    }
    // Try simple number match
    const match = val.match(/^([\d.]+)$/);
    if (match) {
      return { number: match[1], unit: defaultUnit };
    }
    return { number: val, unit: defaultUnit };
  };

  const parsed = parseValue(value);
  const [number, setNumber] = useState(parsed.number);
  const [unit, setUnit] = useState<'px' | 'rem' | 'auto' | 'percent'>(parsed.unit);

  const handleNumberChange = (newNumber: string) => {
    setNumber(newNumber);
    if (newNumber === '' && allowAuto) {
      onChange('auto');
      setUnit('auto');
    } else if (newNumber !== '') {
      if (unit === 'auto') {
        const newUnit = defaultUnit;
        setUnit(newUnit);
        onChange(`${newNumber}${newUnit}`);
      } else if (unit === 'percent') {
        onChange(`${newNumber}%`);
      } else {
        onChange(`${newNumber}${unit}`);
      }
    }
  };

  const handleUnitChange = (newUnit: 'px' | 'rem' | 'auto' | 'percent') => {
    setUnit(newUnit);
    if (newUnit === 'auto' && allowAuto) {
      onChange('auto');
      setNumber('');
    } else if (newUnit === 'percent') {
      if (number !== '') {
        onChange(`${number}%`);
      } else {
        onChange('100%');
        setNumber('100');
      }
    } else if (number !== '') {
      onChange(`${number}${newUnit}`);
    }
  };

  // Update when external value changes
  React.useEffect(() => {
    const newParsed = parseValue(value);
    setNumber(newParsed.number);
    setUnit(newParsed.unit);
  }, [value, defaultUnit]);

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
      <TextField
        fullWidth
        size="small"
        label={label}
        value={number}
        onChange={(e) => handleNumberChange(e.target.value)}
        placeholder={placeholder}
        type="number"
        disabled={unit === 'auto'}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <FormControl size="small" sx={{ minWidth: 70 }}>
                <Select
                  value={unit}
                  onChange={(e) => handleUnitChange(e.target.value as 'px' | 'rem' | 'auto' | 'percent')}
                  sx={{ 
                    '& .MuiSelect-select': { 
                      py: 0.5,
                      fontSize: '0.875rem',
                    } 
                  }}
                >
                  {allowAuto && <MenuItem value="auto">auto</MenuItem>}
                  {allowPercent && <MenuItem value="percent">%</MenuItem>}
                  <MenuItem value="px">px</MenuItem>
                  <MenuItem value="rem">rem</MenuItem>
                </Select>
              </FormControl>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
};

// Content Box Dialog
const ContentBoxDialog: React.FC<ShortcodeDialogProps> = ({ open, onClose, onInsert }) => {
  const [type, setType] = useState('content');
  const [content, setContent] = useState('');
  const [heading, setHeading] = useState('');
  const [ariaLabel, setAriaLabel] = useState('');
  const [borderColor, setBorderColor] = useState('#3b82f6'); // main (blue-500)
  const [width, setWidth] = useState('auto');
  const [height, setHeight] = useState('auto');
  const [bgColor, setBgColor] = useState('transparent');
  const [textColor, setTextColor] = useState('');
  const [marginY, setMarginY] = useState('0');
  const [marginX, setMarginX] = useState('0');

  const handleReset = () => {
    setType('content');
    setContent('');
    setHeading('');
    setAriaLabel('');
    setBorderColor('#3b82f6');
    setWidth('auto');
    setHeight('auto');
    setBgColor('transparent');
    setTextColor('');
    setMarginY('0');
    setMarginX('0');
  };

  const handleInsert = () => {
    const params: string[] = [];
    if (type !== 'content') params.push(`type="${type}"`);
    if (content) params.push(`content="${content}"`);
    if (heading) params.push(`heading="${heading}"`);
    if (ariaLabel) params.push(`ariaLabel="${ariaLabel}"`);
    if (borderColor !== '#3b82f6') params.push(`borderColor="${borderColor}"`);
    if (width !== 'auto') params.push(`width="${width}"`);
    if (height !== 'auto') params.push(`height="${height}"`);
    if (bgColor !== 'transparent') params.push(`bgColor="${bgColor}"`);
    if (textColor) params.push(`textColor="${textColor}"`);
    if (marginY !== '0') params.push(`marginY="${marginY}"`);
    if (marginX !== '0') params.push(`marginX="${marginX}"`);

    const shortcode = `{{< content-box${params.length > 0 ? ' ' + params.join(' ') : ''} >}}`;
    onInsert(shortcode);
    onClose();
    handleReset();
  };

  // Generate preview HTML
  const previewHtml = type === 'heading' ? (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-start' }}>
      <div
        aria-label={ariaLabel || undefined}
        style={{
          display: 'flex',
          paddingLeft: '1rem',
          paddingRight: '1rem',
          border: `1px solid ${borderColor}`,
          borderRadius: '0.375rem',
          marginTop: marginY !== '0' ? marginY : undefined,
          marginBottom: marginY !== '0' ? marginY : undefined,
          marginLeft: marginX !== '0' ? marginX : undefined,
          marginRight: marginX !== '0' ? marginX : undefined,
          backgroundColor: bgColor !== 'transparent' ? bgColor : undefined,
          color: textColor || undefined,
        }}
      >
        {heading ? <ReactMarkdown>{heading}</ReactMarkdown> : (content ? <ReactMarkdown>{content}</ReactMarkdown> : <span style={{ opacity: 0.5 }}>Preview heading</span>)}
      </div>
    </div>
  ) : (
    <div
      style={{
        display: 'inline-flex',
        border: `1px solid ${borderColor}`,
        paddingLeft: '1rem',
        paddingRight: '1rem',
        paddingTop: '0.5rem',
        paddingBottom: '0.5rem',
        borderRadius: '0.375rem',
        marginTop: marginY !== '0' ? marginY : undefined,
        marginBottom: marginY !== '0' ? marginY : undefined,
        marginLeft: marginX !== '0' ? marginX : undefined,
        marginRight: marginX !== '0' ? marginX : undefined,
        width: width !== 'auto' ? width : undefined,
        height: height !== 'auto' ? height : undefined,
        backgroundColor: bgColor !== 'transparent' ? bgColor : undefined,
        color: bgColor === 'white' ? 'black' : (textColor || undefined),
        alignSelf: 'flex-start',
      }}
    >
      {content ? <ReactMarkdown>{content}</ReactMarkdown> : <span style={{ opacity: 0.5 }}>content</span>}
    </div>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth sx={{ '& .MuiDialog-paper': { maxWidth: '900px', height: '80vh' } }}>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">Content Box</Typography>
            <Tooltip title="Content Box is used to display content or headings with customizable borders, colors, and dimensions." arrow>
              <HelpCircle size={18} style={{ cursor: 'help', opacity: 0.7 }} />
            </Tooltip>
          </Box>
          <IconButton onClick={onClose} size="small">
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', gap: 2, mt: 1, overflow: 'hidden', pb: 1, flex: 1, minHeight: 0 }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5, overflow: 'auto', pr: 1, minWidth: 0 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Type</InputLabel>
            <Select value={type} onChange={(e) => setType(e.target.value)} label="Type">
              <MenuItem value="content">Content</MenuItem>
              <MenuItem value="heading">Heading</MenuItem>
            </Select>
          </FormControl>
          
          {type === 'content' ? (
            <TextField
              fullWidth
              size="small"
              label="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              multiline
              rows={3}
              placeholder="Enter content text"
            />
          ) : (
            <TextField
              fullWidth
              size="small"
              label="Heading"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="Enter heading text"
            />
          )}
          
          <TextField
            fullWidth
            size="small"
            label="Aria Label (optional)"
            value={ariaLabel}
            onChange={(e) => setAriaLabel(e.target.value)}
            placeholder="Accessibility label"
          />
          
          <ColorPicker
            label="Border Color"
            value={borderColor}
            onChange={setBorderColor}
            placeholder="#3b82f6"
          />
          
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <NumberWithUnitInput
              label="Width"
              value={width}
              onChange={setWidth}
              placeholder="auto"
              allowAuto={true}
              allowPercent={true}
            />
            <NumberWithUnitInput
              label="Height"
              value={height}
              onChange={setHeight}
              placeholder="auto"
              allowAuto={true}
            />
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <NumberWithUnitInput
              label="Vertical Margin"
              value={marginY}
              onChange={setMarginY}
              placeholder="0"
              defaultUnit="rem"
            />
            <NumberWithUnitInput
              label="Horizontal Margin"
              value={marginX}
              onChange={setMarginX}
              placeholder="0"
              defaultUnit="rem"
            />
          </Box>
          
          <ColorPicker
            label="Background Color"
            value={bgColor}
            onChange={setBgColor}
            placeholder="transparent"
            allowTransparent={true}
          />
          
          <ColorPicker
            label="Text Color (optional)"
            value={textColor}
            onChange={setTextColor}
            placeholder="#000000"
          />
        </Box>
        
        <Divider orientation="vertical" flexItem />
        
        <Box sx={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <PreviewSection>
            {previewHtml}
          </PreviewSection>
        </Box>
      </DialogContent>
      <DialogActions>
        <Tooltip title="Reset" arrow>
          <IconButton onClick={handleReset} color="secondary">
            <RotateCcw size={20} />
          </IconButton>
        </Tooltip>
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleInsert} variant="contained">Insert</Button>
      </DialogActions>
    </Dialog>
  );
};

// Line Dialog
const LineDialog: React.FC<ShortcodeDialogProps> = ({ open, onClose, onInsert }) => {
  const [width, setWidth] = useState('100%');
  const [height, setHeight] = useState('1px');
  const [color, setColor] = useState('#6b7280'); // gray-500
  const [marginY, setMarginY] = useState('0');
  const [marginX, setMarginX] = useState('0');

  const handleReset = () => {
    setWidth('100%');
    setHeight('1px');
    setColor('#6b7280');
    setMarginY('0');
    setMarginX('0');
  };

  const handleInsert = () => {
    const params: string[] = [];
    if (width !== '100%') params.push(`width="${width}"`);
    if (height !== '1px') params.push(`height="${height}"`);
    if (color !== '#6b7280') params.push(`color="${color}"`);
    if (marginY !== '0') params.push(`marginY="${marginY}"`);
    if (marginX !== '0') params.push(`marginX="${marginX}"`);

    const shortcode = `{{< line${params.length > 0 ? ' ' + params.join(' ') : ''} >}}`;
    onInsert(shortcode);
    onClose();
    handleReset();
  };

  // Generate preview HTML
  const previewHtml = (
    <span
      className="inline-block border-b max-w-full"
      style={{
        borderColor: color,
        width: width,
        height: height,
        marginTop: marginY !== '0' ? marginY : undefined,
        marginBottom: marginY !== '0' ? marginY : undefined,
        marginLeft: marginX !== '0' ? marginX : undefined,
        marginRight: marginX !== '0' ? marginX : undefined,
        alignSelf: 'flex-start',
      }}
    />
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth sx={{ '& .MuiDialog-paper': { maxWidth: '900px', height: '80vh' } }}>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">Line</Typography>
            <Tooltip title="Line is used to create horizontal divider lines with customizable width, height, and color." arrow>
              <HelpCircle size={18} style={{ cursor: 'help', opacity: 0.7 }} />
            </Tooltip>
          </Box>
          <IconButton onClick={onClose} size="small">
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', gap: 2, mt: 1, overflow: 'hidden', pb: 1, flex: 1, minHeight: 0 }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5, overflow: 'auto', pr: 1, minWidth: 0 }}>
          <NumberWithUnitInput
            label="Width"
            value={width}
            onChange={setWidth}
            placeholder="100"
            defaultUnit="rem"
            allowPercent={true}
          />
          <NumberWithUnitInput
            label="Height"
            value={height}
            onChange={setHeight}
            placeholder="1"
            defaultUnit="px"
          />
          <ColorPicker
            label="Color"
            value={color}
            onChange={setColor}
            placeholder="#6b7280"
          />
          <NumberWithUnitInput
            label="Vertical Margin"
            value={marginY}
            onChange={setMarginY}
            placeholder="1.125"
            defaultUnit="rem"
          />
        </Box>
        
        <Divider orientation="vertical" flexItem />
        
        <Box sx={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <PreviewSection>
            {previewHtml}
          </PreviewSection>
        </Box>
      </DialogContent>
      <DialogActions>
        <Tooltip title="Reset" arrow>
          <IconButton onClick={handleReset} color="secondary">
            <RotateCcw size={20} />
          </IconButton>
        </Tooltip>
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleInsert} variant="contained">Insert</Button>
      </DialogActions>
    </Dialog>
  );
};

// Flex Dialog
const FlexDialog: React.FC<ShortcodeDialogProps> = ({ open, onClose, onInsert }) => {
  const [direction, setDirection] = useState('row');
  const [justifyContent, setJustifyContent] = useState('start');
  const [alignItems, setAlignItems] = useState('start');
  const [alignContent, setAlignContent] = useState('start');
  const [gap, setGap] = useState('1rem');
  const [marginY, setMarginY] = useState('0');
  const [marginX, setMarginX] = useState('0');
  const [flex, setFlex] = useState('');
  const [flexType, setFlexType] = useState<'preset' | 'custom'>('preset');
  const [flexPreset, setFlexPreset] = useState('initial');
  const [flexCustom, setFlexCustom] = useState('');
  const [flexTarget, setFlexTarget] = useState('container');
  const [innerContent, setInnerContent] = useState('');

  const handleReset = () => {
    setDirection('row');
    setJustifyContent('start');
    setAlignItems('start');
    setAlignContent('start');
    setGap('1rem');
    setMarginY('0');
    setMarginX('0');
    setFlex('');
    setFlexType('preset');
    setFlexPreset('initial');
    setFlexCustom('');
    setFlexTarget('container');
    setInnerContent('');
  };

  // Process innerContent to add flex property to shortcodes or wrap text content
  const processInnerContent = (content: string): string => {
    if (flexTarget === 'container' || !content) return content;
    
    const flexValue = flexType === 'preset' ? flexPreset : flexCustom;
    if (!flexValue) return content;

    // Parse content to find shortcodes and text
    const shortcodePattern = /\{\{<\s*([\w-]+)([^>]*?)\s*>\}\}/g;
    const parts: Array<{ type: 'shortcode' | 'text'; content: string; index: number }> = [];
    let lastIndex = 0;
    let match;
    const matches: RegExpExecArray[] = [];
    
    // Collect all matches
    while ((match = shortcodePattern.exec(content)) !== null) {
      matches.push(match);
    }

    matches.forEach((match) => {
      // Add text before shortcode
      if (match.index > lastIndex) {
        const textBefore = content.substring(lastIndex, match.index);
        if (textBefore.trim()) {
          parts.push({ type: 'text', content: textBefore, index: lastIndex });
        }
      }
      // Add shortcode
      parts.push({ type: 'shortcode', content: match[0], index: match.index });
      lastIndex = match.index + match[0].length;
    });

    // Add remaining text
    if (lastIndex < content.length) {
      const remainingText = content.substring(lastIndex);
      if (remainingText.trim()) {
        parts.push({ type: 'text', content: remainingText, index: lastIndex });
      }
    }

    // If no parts found, return original content
    if (parts.length === 0) return content;

    // Find first and last shortcode indices
    const firstShortcodeIdx = parts.findIndex(p => p.type === 'shortcode');
    const lastShortcodeIdx = parts.length > 0 ? parts.map((p, i) => ({ type: p.type, idx: i })).filter(p => p.type === 'shortcode').pop()?.idx ?? -1 : -1;

    // Process parts based on flexTarget
    const processedParts = parts.map((part, idx) => {
      if (part.type === 'shortcode') {
        // Check if we need to add flex to this shortcode
        let shouldAddFlex = false;
        if (flexTarget === 'all-children') {
          shouldAddFlex = true;
        } else if (flexTarget === 'first-child') {
          shouldAddFlex = idx === firstShortcodeIdx;
        } else if (flexTarget === 'last-child') {
          shouldAddFlex = idx === lastShortcodeIdx;
        }

        if (shouldAddFlex && !part.content.includes('flex=')) {
          // Insert flex before the closing >}}
          part.content = part.content.replace(/>\}\}/, ` flex="${flexValue}">}}`);
        }
        return part.content;
      } else {
        // Wrap text content in content-box with flex property
        let shouldWrap = false;
        if (flexTarget === 'all-children') {
          shouldWrap = true;
        } else if (flexTarget === 'first-child') {
          // Wrap text only if it's the first part and there are no shortcodes before it
          shouldWrap = idx === 0 && firstShortcodeIdx === -1;
        } else if (flexTarget === 'last-child') {
          // Wrap text only if it's the last part and there are no shortcodes after it
          shouldWrap = idx === parts.length - 1 && lastShortcodeIdx === -1;
        }

        if (shouldWrap) {
          const escapedContent = part.content.trim().replace(/"/g, '&quot;').replace(/\n/g, ' ');
          return `{{< content-box content="${escapedContent}" flex="${flexValue}" >}}`;
        }
        return part.content;
      }
    });

    return processedParts.join('');
  };

  const handleInsert = () => {
    const params: string[] = [];
    if (direction !== 'row') params.push(`direction="${direction}"`);
    if (justifyContent !== 'start') params.push(`justifyContent="${justifyContent}"`);
    if (alignItems !== 'start') params.push(`alignItems="${alignItems}"`);
    if (alignContent !== 'start') params.push(`alignContent="${alignContent}"`);
    if (gap !== '1rem') params.push(`gap="${gap}"`);
    if (marginY !== '0') params.push(`marginY="${marginY}"`);
    if (marginX !== '0') params.push(`marginX="${marginX}"`);
    
    const flexValue = flexType === 'preset' ? flexPreset : flexCustom;
    if (flexValue && flexTarget === 'container') {
      params.push(`flex="${flexValue}"`);
    }
    if (flexValue && flexTarget !== 'container') {
      params.push(`flexTarget="${flexTarget}"`);
    }

    const processedContent = flexValue && flexTarget !== 'container' 
      ? processInnerContent(innerContent || '\n  Your content here\n')
      : (innerContent || '\n  Your content here\n');

    const shortcode = `{{< flex${params.length > 0 ? ' ' + params.join(' ') : ''} >}}${processedContent}{{< /flex >}}`;
    onInsert(shortcode);
    onClose();
    handleReset();
  };

  // Generate preview HTML
  const getFlexValue = () => {
    const flexValue = flexType === 'preset' ? flexPreset : flexCustom;
    if (!flexValue) return undefined;
    return flexValue;
  };

  const flexValue = getFlexValue();
  const justifyContentMap: { [key: string]: string } = {
    'start': 'flex-start',
    'center': 'center',
    'end': 'flex-end',
    'between': 'space-between',
    'around': 'space-around',
  };
  const alignItemsMap: { [key: string]: string } = {
    'start': 'flex-start',
    'center': 'center',
    'end': 'flex-end',
  };
  const alignContentMap: { [key: string]: string } = {
    'start': 'flex-start',
    'center': 'center',
    'end': 'flex-end',
    'between': 'space-between',
    'around': 'space-around',
    'stretch': 'stretch',
  };

  // Apply flex to rendered content based on flexTarget
  const applyFlexToContent = (content: React.ReactNode, flexValue: string | undefined, target: string): React.ReactNode => {
    if (!flexValue || target === 'container' || !content) return content;
    
    if (React.isValidElement(content)) {
      if (content.type === React.Fragment) {
        const fragmentProps = content.props as { children?: React.ReactNode };
        const children = React.Children.toArray(fragmentProps.children);
        
        // Find indices of shortcode elements (elements that are not just text spans)
        const shortcodeIndices: number[] = [];
        children.forEach((child, idx) => {
          if (React.isValidElement(child)) {
            // Check if it's a shortcode element (has className or specific structure)
            const childProps = child.props as { className?: string; style?: React.CSSProperties; key?: React.Key };
            const key = child.key?.toString() || '';
            const className = childProps.className || '';
            const style = childProps.style || {};
            // More comprehensive detection: check key first (shortcodes have keys starting with "shortcode-"), then className/structure
            const isShortcode = 
              key.startsWith('shortcode-') ||
              className.includes('inline-block') || 
              className.includes('inline-flex') || 
              className.includes('border') ||  // This will match border-b, border-t, etc.
              (typeof child.type === 'string' && child.type === 'div' && (style.border || style.borderColor || style.display === 'inline-flex' || style.display === 'flex')) ||
              (typeof child.type === 'string' && child.type === 'span' && (className.includes('border') || style.border || style.borderColor || className.includes('inline-block')));
            if (isShortcode) {
              shortcodeIndices.push(idx);
            }
          }
        });
        
        // If no shortcodes found, treat all non-text elements as potential targets
        const hasShortcodes = shortcodeIndices.length > 0;
        
        return React.cloneElement(content as React.ReactElement<any>, {
          children: children.map((child, idx) => {
            if (!React.isValidElement(child)) {
              // Wrap text nodes in a span with flex only if no shortcodes exist
              if (!hasShortcodes) {
                let shouldApplyFlex = false;
                if (target === 'all-children') {
                  shouldApplyFlex = true;
                } else if (target === 'first-child') {
                  shouldApplyFlex = idx === 0;
                } else if (target === 'last-child') {
                  shouldApplyFlex = idx === children.length - 1;
                }
                
                if (shouldApplyFlex && typeof child === 'string' && child.trim()) {
                  return (
                    <span key={`text-flex-${idx}`} style={{ flex: flexValue, display: 'inline-block' }}>
                      {child}
                    </span>
                  );
                }
              }
              return child;
            }
            
            // Determine if this element should get flex
            let shouldApplyFlex = false;
            if (target === 'all-children') {
              shouldApplyFlex = true;
            } else if (target === 'first-child') {
              if (hasShortcodes) {
                // Apply to first shortcode
                shouldApplyFlex = idx === shortcodeIndices[0];
              } else {
                // Apply to first element
                shouldApplyFlex = idx === 0;
              }
            } else if (target === 'last-child') {
              if (hasShortcodes) {
                // Apply to last shortcode
                shouldApplyFlex = idx === shortcodeIndices[shortcodeIndices.length - 1];
              } else {
                // Apply to last element
                shouldApplyFlex = idx === children.length - 1;
              }
            }
            
            if (shouldApplyFlex) {
              const childProps = child.props as { style?: React.CSSProperties; [key: string]: any };
              const currentStyle = childProps.style || {};
              // Ensure flex is applied correctly - merge with existing styles
              const newStyle = {
                ...currentStyle,
                flex: flexValue,
              };
              return React.cloneElement(child as React.ReactElement<any>, {
                style: newStyle,
              });
            }
            return child;
          }),
        });
      } else {
        // Single element, apply flex directly
        const contentProps = content.props as { style?: React.CSSProperties; [key: string]: any };
        const currentStyle = contentProps.style || {};
        return React.cloneElement(content as React.ReactElement<any>, {
          style: {
            ...currentStyle,
            flex: flexValue,
          },
        });
      }
    }
    return content;
  };

  const renderedContent = innerContent ? parseAndRenderShortcodes(innerContent) : null;
  const contentWithFlex = renderedContent && flexValue && flexTarget !== 'container' 
    ? applyFlexToContent(renderedContent, flexValue, flexTarget)
    : renderedContent;
  const showPlaceholder = !contentWithFlex;

  const previewHtml = (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: alignItemsMap[alignItems] || 'flex-start',
          alignContent: alignContentMap[alignContent] || 'flex-start',
          justifyContent: justifyContentMap[justifyContent] || 'flex-start',
          flexDirection: direction === 'column' ? 'column' : 'row',
          marginTop: marginY !== '0' ? marginY : undefined,
          marginBottom: marginY !== '0' ? marginY : undefined,
          marginLeft: marginX !== '0' ? marginX : undefined,
          marginRight: marginX !== '0' ? marginX : undefined,
          gap: gap,
          flex: flexValue && flexTarget === 'container' ? flexValue : undefined,
          width: '100%',
          height: '100%',
          minHeight: direction === 'row' ? '100%' : 'auto',
          alignSelf: 'stretch',
          paddingTop: (alignItems === 'start' || alignItems === 'end') && direction === 'row' && marginY !== '0' ? marginY : undefined,
          paddingBottom: (alignItems === 'start' || alignItems === 'end') && direction === 'row' && marginY !== '0' ? marginY : undefined,
        }}
      >
        {contentWithFlex}
      </div>
      {showPlaceholder && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        >
          <Typography variant="body2" sx={{ color: 'text.secondary', opacity: 0.6, textAlign: 'center', whiteSpace: 'nowrap' }}>
            Live preview will be shown here
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth sx={{ '& .MuiDialog-paper': { maxWidth: '900px', height: '80vh' } }}>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">Flex</Typography>
            <Tooltip title="Flex is used to arrange child items in one dimensional layout. The child items can be normal content or line, content-box, empty-box, underscored-space and even another flex (if child flex items are needed)." arrow>
              <HelpCircle size={18} style={{ cursor: 'help', opacity: 0.7 }} />
            </Tooltip>
          </Box>
          <IconButton onClick={onClose} size="small">
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', gap: 2, mt: 1, overflow: 'hidden', pb: 1, flex: 1, minHeight: 0 }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5, overflow: 'auto', pr: 1, minWidth: 0 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Direction</InputLabel>
            <Select value={direction} onChange={(e) => setDirection(e.target.value)} label="Direction">
              <MenuItem value="row">Row</MenuItem>
              <MenuItem value="column">Column</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth size="small">
            <InputLabel>Justify Content</InputLabel>
            <Select value={justifyContent} onChange={(e) => setJustifyContent(e.target.value)} label="Justify Content">
              <MenuItem value="start">Start</MenuItem>
              <MenuItem value="center">Center</MenuItem>
              <MenuItem value="end">End</MenuItem>
              <MenuItem value="between">Between</MenuItem>
              <MenuItem value="around">Around</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth size="small">
            <InputLabel>Align Items</InputLabel>
            <Select value={alignItems} onChange={(e) => setAlignItems(e.target.value)} label="Align Items">
              <MenuItem value="start">Start</MenuItem>
              <MenuItem value="center">Center</MenuItem>
              <MenuItem value="end">End</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth size="small">
            <InputLabel>Align Content</InputLabel>
            <Select value={alignContent} onChange={(e) => setAlignContent(e.target.value)} label="Align Content">
              <MenuItem value="start">Start</MenuItem>
              <MenuItem value="center">Center</MenuItem>
              <MenuItem value="end">End</MenuItem>
              <MenuItem value="between">Between</MenuItem>
              <MenuItem value="around">Around</MenuItem>
              <MenuItem value="stretch">Stretch</MenuItem>
            </Select>
          </FormControl>
          
          <NumberWithUnitInput
            label="Gap"
            value={gap}
            onChange={setGap}
            placeholder="1"
            defaultUnit="rem"
          />
          
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <NumberWithUnitInput
              label="Vertical Margin"
              value={marginY}
              onChange={setMarginY}
              placeholder="0"
              defaultUnit="rem"
            />
            <NumberWithUnitInput
              label="Horizontal Margin"
              value={marginX}
              onChange={setMarginX}
              placeholder="0"
              defaultUnit="rem"
            />
          </Box>
          
          <FormControl fullWidth size="small">
            <InputLabel>Flex Target</InputLabel>
            <Select value={flexTarget} onChange={(e) => setFlexTarget(e.target.value)} label="Flex Target">
              <MenuItem value="container">Container</MenuItem>
              <MenuItem value="all-children">All Children</MenuItem>
              <MenuItem value="first-child">First Child</MenuItem>
              <MenuItem value="last-child">Last Child</MenuItem>
            </Select>
          </FormControl>
          
          {flexTarget !== 'container' && (
            <>
              <FormControl fullWidth size="small">
                <InputLabel>Flex Type</InputLabel>
                <Select value={flexType} onChange={(e) => setFlexType(e.target.value as 'preset' | 'custom')} label="Flex Type">
                  <MenuItem value="preset">Preset</MenuItem>
                  <MenuItem value="custom">Custom</MenuItem>
                </Select>
              </FormControl>
              
              {flexType === 'preset' ? (
                <FormControl fullWidth size="small">
                  <InputLabel>Flex Value</InputLabel>
                  <Select value={flexPreset} onChange={(e) => setFlexPreset(e.target.value)} label="Flex Value">
                    <MenuItem value="1">1</MenuItem>
                    <MenuItem value="auto">auto</MenuItem>
                    <MenuItem value="initial">initial</MenuItem>
                    <MenuItem value="none">none</MenuItem>
                  </Select>
                </FormControl>
              ) : (
                <TextField
                  fullWidth
                  size="small"
                  label="Custom Flex Value"
                  value={flexCustom}
                  onChange={(e) => setFlexCustom(e.target.value)}
                  placeholder="e.g., 2, 1 1 auto, 0 1 auto"
                  helperText="Enter custom flex value (e.g., 2, 1 1 auto)"
                />
              )}
            </>
          )}
          
          {flexTarget === 'container' && (
            <>
              <FormControl fullWidth size="small">
                <InputLabel>Flex Type</InputLabel>
                <Select value={flexType} onChange={(e) => setFlexType(e.target.value as 'preset' | 'custom')} label="Flex Type">
                  <MenuItem value="preset">Preset</MenuItem>
                  <MenuItem value="custom">Custom</MenuItem>
                </Select>
              </FormControl>
              
              {flexType === 'preset' ? (
                <FormControl fullWidth size="small">
                  <InputLabel>Flex Value</InputLabel>
                  <Select value={flexPreset} onChange={(e) => setFlexPreset(e.target.value)} label="Flex Value">
                    <MenuItem value="1">1</MenuItem>
                    <MenuItem value="auto">auto</MenuItem>
                    <MenuItem value="initial">initial</MenuItem>
                    <MenuItem value="none">none</MenuItem>
                  </Select>
                </FormControl>
              ) : (
                <TextField
                  fullWidth
                  size="small"
                  label="Custom Flex Value"
                  value={flexCustom}
                  onChange={(e) => setFlexCustom(e.target.value)}
                  placeholder="e.g., 2, 1 1 auto, 0 1 auto"
                  helperText="Enter custom flex value (e.g., 2, 1 1 auto). Applied to the flex container itself."
                />
              )}
            </>
          )}
          
          <Box>
            <TextField
              fullWidth
              size="small"
              label="Content (optional)"
              value={innerContent}
              onChange={(e) => setInnerContent(e.target.value)}
              multiline
              rows={3}
              placeholder="Content inside flex container"
            />
            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Minus size={14} />}
                onClick={() => setInnerContent(prev => prev + (prev ? '\n' : '') + '{{< line >}}')}
                sx={{ textTransform: 'none', fontSize: '0.75rem' }}
              >
                Line
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<BoxIcon size={14} />}
                onClick={() => setInnerContent(prev => prev + (prev ? '\n' : '') + '{{< empty-box >}}')}
                sx={{ textTransform: 'none', fontSize: '0.75rem' }}
              >
                Empty Box
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Square size={14} />}
                onClick={() => setInnerContent(prev => prev + (prev ? '\n' : '') + '{{< content-box content="content" >}}')}
                sx={{ textTransform: 'none', fontSize: '0.75rem' }}
              >
                Content Box
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Underline size={14} />}
                onClick={() => setInnerContent(prev => prev + (prev ? '\n' : '') + '{{< underscored-space >}}')}
                sx={{ textTransform: 'none', fontSize: '0.75rem' }}
              >
                Underscored Space
              </Button>
            </Box>
          </Box>
        </Box>
        
        <Divider orientation="vertical" flexItem />
        
        <Box sx={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <PreviewSection>
            {previewHtml}
          </PreviewSection>
        </Box>
      </DialogContent>
      <DialogActions>
        <Tooltip title="Reset" arrow>
          <IconButton onClick={handleReset} color="secondary">
            <RotateCcw size={20} />
          </IconButton>
        </Tooltip>
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleInsert} variant="contained">Insert</Button>
      </DialogActions>
    </Dialog>
  );
};

// Table Flex Dialog
const TableFlexDialog: React.FC<ShortcodeDialogProps> = ({ open, onClose, onInsert }) => {
  const [direction, setDirection] = useState('row');
  const [justifyContent, setJustifyContent] = useState('start');
  const [alignItems, setAlignItems] = useState('start');
  const [alignContent, setAlignContent] = useState('start');
  const [gap, setGap] = useState('1rem');
  const [wrap, setWrap] = useState('wrap');
  const [marginY, setMarginY] = useState('0');
  const [marginX, setMarginX] = useState('0');
  const [innerContent, setInnerContent] = useState('');

  const handleReset = () => {
    setDirection('row');
    setJustifyContent('start');
    setAlignItems('start');
    setAlignContent('start');
    setGap('1rem');
    setWrap('wrap');
    setMarginY('0');
    setMarginX('0');
    setInnerContent('');
  };

  const handleInsert = () => {
    const params: string[] = [];
    if (direction !== 'row') params.push(`direction="${direction}"`);
    if (justifyContent !== 'start') params.push(`justifyContent="${justifyContent}"`);
    if (alignItems !== 'start') params.push(`alignItems="${alignItems}"`);
    if (alignContent !== 'start') params.push(`alignContent="${alignContent}"`);
    if (gap !== '1rem') params.push(`gap="${gap}"`);
    if (wrap !== 'wrap') params.push(`wrap="${wrap}"`);
    if (marginY !== '0') params.push(`marginY="${marginY}"`);
    if (marginX !== '0') params.push(`marginX="${marginX}"`);

    const shortcode = `{{< table-flex${params.length > 0 ? ' ' + params.join(' ') : ''} >}}${innerContent || '\n  Your content here\n'}{{< /table-flex >}}`;
    onInsert(shortcode);
    onClose();
    handleReset();
  };

  // Generate preview HTML
  const justifyContentMap: { [key: string]: string } = {
    'start': 'flex-start',
    'center': 'center',
    'end': 'flex-end',
    'between': 'space-between',
    'around': 'space-around',
  };
  const alignItemsMap: { [key: string]: string } = {
    'start': 'flex-start',
    'center': 'center',
    'end': 'flex-end',
  };
  const alignContentMap: { [key: string]: string } = {
    'start': 'flex-start',
    'center': 'center',
    'end': 'flex-end',
    'between': 'space-between',
    'around': 'space-around',
    'stretch': 'stretch',
  };

  const previewHtml = (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: wrap === 'nowrap' ? 'nowrap' : 'wrap',
          alignItems: alignItemsMap[alignItems] || 'flex-start',
          alignContent: alignContentMap[alignContent] || 'flex-start',
          justifyContent: justifyContentMap[justifyContent] || 'flex-start',
          flexDirection: direction === 'column' ? 'column' : 'row',
          marginTop: marginY !== '0' ? marginY : undefined,
          marginBottom: marginY !== '0' ? marginY : undefined,
          marginLeft: marginX !== '0' ? marginX : undefined,
          marginRight: marginX !== '0' ? marginX : undefined,
          gap: gap,
          width: '100%',
          height: '100%',
          minHeight: direction === 'row' ? '100%' : 'auto',
          alignSelf: 'stretch',
          paddingTop: (alignItems === 'start' || alignItems === 'end') && direction === 'row' && marginY !== '0' ? marginY : undefined,
          paddingBottom: (alignItems === 'start' || alignItems === 'end') && direction === 'row' && marginY !== '0' ? marginY : undefined,
        }}
      >
        {innerContent && renderMarkdownTables(innerContent)}
      </div>
      {!innerContent && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        >
          <Typography variant="body2" sx={{ color: 'text.secondary', opacity: 0.6, textAlign: 'center', whiteSpace: 'nowrap' }}>
            Live preview will be shown here
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth sx={{ '& .MuiDialog-paper': { maxWidth: '900px', height: '80vh' } }}>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">Table Flex</Typography>
            <Tooltip title="Table Flex is used to arrange the continuous multiple markdown tables in one dimensional layout." arrow>
              <HelpCircle size={18} style={{ cursor: 'help', opacity: 0.7 }} />
            </Tooltip>
          </Box>
          <IconButton onClick={onClose} size="small">
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', gap: 2, mt: 1, overflow: 'hidden', pb: 1, flex: 1, minHeight: 0 }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5, overflow: 'auto', pr: 1, minWidth: 0 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Direction</InputLabel>
            <Select value={direction} onChange={(e) => setDirection(e.target.value)} label="Direction">
              <MenuItem value="row">Row</MenuItem>
              <MenuItem value="column">Column</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth size="small">
            <InputLabel>Justify Content</InputLabel>
            <Select value={justifyContent} onChange={(e) => setJustifyContent(e.target.value)} label="Justify Content">
              <MenuItem value="start">Start</MenuItem>
              <MenuItem value="center">Center</MenuItem>
              <MenuItem value="end">End</MenuItem>
              <MenuItem value="between">Between</MenuItem>
              <MenuItem value="around">Around</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth size="small">
            <InputLabel>Align Items</InputLabel>
            <Select value={alignItems} onChange={(e) => setAlignItems(e.target.value)} label="Align Items">
              <MenuItem value="start">Start</MenuItem>
              <MenuItem value="center">Center</MenuItem>
              <MenuItem value="end">End</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth size="small">
            <InputLabel>Align Content</InputLabel>
            <Select value={alignContent} onChange={(e) => setAlignContent(e.target.value)} label="Align Content">
              <MenuItem value="start">Start</MenuItem>
              <MenuItem value="center">Center</MenuItem>
              <MenuItem value="end">End</MenuItem>
              <MenuItem value="between">Between</MenuItem>
              <MenuItem value="around">Around</MenuItem>
              <MenuItem value="stretch">Stretch</MenuItem>
            </Select>
          </FormControl>
          
          <NumberWithUnitInput
            label="Gap"
            value={gap}
            onChange={setGap}
            placeholder="1"
            defaultUnit="rem"
          />
          
          <FormControl fullWidth size="small">
            <InputLabel>Wrap</InputLabel>
            <Select value={wrap} onChange={(e) => setWrap(e.target.value)} label="Wrap">
              <MenuItem value="wrap">Wrap</MenuItem>
              <MenuItem value="nowrap">No Wrap</MenuItem>
            </Select>
          </FormControl>
          
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <NumberWithUnitInput
              label="Vertical Margin"
              value={marginY}
              onChange={setMarginY}
              placeholder="0"
              defaultUnit="rem"
            />
            <NumberWithUnitInput
              label="Horizontal Margin"
              value={marginX}
              onChange={setMarginX}
              placeholder="0"
              defaultUnit="rem"
            />
          </Box>
          
          <Box>
            <TextField
              fullWidth
              size="small"
              label="Content (optional)"
              value={innerContent}
              onChange={(e) => setInnerContent(e.target.value)}
              multiline
              rows={3}
              placeholder="Content inside table-flex container"
            />
            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Table size={14} />}
                onClick={() => {
                  const tableTemplate = `| Header 1 | Header 2 | Header 3 |
|----------|---------|---------|
| Cell 1   | Cell 2  | Cell 3  |
| Cell 4   | Cell 5  | Cell 6  |`;
                  setInnerContent(prev => prev + (prev ? '\n\n' : '') + tableTemplate);
                }}
                sx={{ textTransform: 'none', fontSize: '0.75rem' }}
              >
                Add Table
              </Button>
            </Box>
          </Box>
        </Box>
        
        <Divider orientation="vertical" flexItem />
        
        <Box sx={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <PreviewSection>
            {previewHtml}
          </PreviewSection>
        </Box>
      </DialogContent>
      <DialogActions>
        <Tooltip title="Reset" arrow>
          <IconButton onClick={handleReset} color="secondary">
            <RotateCcw size={20} />
          </IconButton>
        </Tooltip>
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleInsert} variant="contained">Insert</Button>
      </DialogActions>
    </Dialog>
  );
};

// Underscored Space Dialog
const UnderscoredSpaceDialog: React.FC<ShortcodeDialogProps> = ({ open, onClose, onInsert }) => {
  const [no, setNo] = useState('1');
  const [width, setWidth] = useState('6rem');
  const [color, setColor] = useState('#6b7280'); // gray-500
  const [marginY, setMarginY] = useState('0');
  const [marginX, setMarginX] = useState('0');

  const handleReset = () => {
    setNo('1');
    setWidth('6rem');
    setColor('#6b7280');
    setMarginY('0');
    setMarginX('0');
  };

  const handleInsert = () => {
    const params: string[] = [];
    if (no !== '1') params.push(`no="${no}"`);
    if (width !== '6rem') params.push(`width="${width}"`);
    if (color !== '#6b7280') params.push(`color="${color}"`);
    if (marginY !== '0') params.push(`marginY="${marginY}"`);
    if (marginX !== '0') params.push(`marginX="${marginX}"`);

    const shortcode = `{{< underscored-space${params.length > 0 ? ' ' + params.join(' ') : ''} >}}`;
    onInsert(shortcode);
    onClose();
    handleReset();
  };

  // Generate preview HTML
  const count = parseInt(no) || 1;
  const previewHtml = (
    <Box 
      sx={{ 
        alignSelf: 'flex-start',
        marginTop: marginY !== '0' ? marginY : undefined,
        marginBottom: marginY !== '0' ? marginY : undefined,
        marginLeft: marginX !== '0' ? marginX : undefined,
        marginRight: marginX !== '0' ? marginX : undefined,
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <span
          key={index}
          style={{
            display: 'inline-block',
            borderBottom: `1px solid ${color}`,
            userSelect: 'none',
            marginTop: index > 0 ? '1rem' : undefined,
            height: '0.25rem',
            maxWidth: '100%',
            width: width,
          }}
        />
      ))}
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth sx={{ '& .MuiDialog-paper': { maxWidth: '900px', height: '80vh' } }}>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">Underscored Space</Typography>
            <Tooltip title="Underscored Space is used to create multiple horizontal lines for spacing purposes." arrow>
              <HelpCircle size={18} style={{ cursor: 'help', opacity: 0.7 }} />
            </Tooltip>
          </Box>
          <IconButton onClick={onClose} size="small">
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', gap: 2, mt: 1, overflow: 'hidden', pb: 1, flex: 1, minHeight: 0 }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5, overflow: 'auto', pr: 1, minWidth: 0 }}>
          <TextField
            fullWidth
            size="small"
            label="Number of Spaces"
            type="number"
            value={no}
            onChange={(e) => setNo(e.target.value)}
            placeholder="1"
          />
          <NumberWithUnitInput
            label="Width"
            value={width}
            onChange={setWidth}
            placeholder="6"
            defaultUnit="rem"
            allowPercent={true}
          />
          <ColorPicker
            label="Color"
            value={color}
            onChange={setColor}
            placeholder="#6b7280"
          />
          
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <NumberWithUnitInput
              label="Vertical Margin"
              value={marginY}
              onChange={setMarginY}
              placeholder="0"
              defaultUnit="rem"
            />
            <NumberWithUnitInput
              label="Horizontal Margin"
              value={marginX}
              onChange={setMarginX}
              placeholder="0"
              defaultUnit="rem"
            />
          </Box>
        </Box>
        
        <Divider orientation="vertical" flexItem />
        
        <Box sx={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <PreviewSection>
            {previewHtml}
          </PreviewSection>
        </Box>
      </DialogContent>
      <DialogActions>
        <Tooltip title="Reset" arrow>
          <IconButton onClick={handleReset} color="secondary">
            <RotateCcw size={20} />
          </IconButton>
        </Tooltip>
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleInsert} variant="contained">Insert</Button>
      </DialogActions>
    </Dialog>
  );
};

// Empty Box Dialog
const EmptyBoxDialog: React.FC<ShortcodeDialogProps> = ({ open, onClose, onInsert }) => {
  const [width, setWidth] = useState('5.5rem');
  const [height, setHeight] = useState('2.5rem');
  const [borderColor, setBorderColor] = useState('#3b82f6'); // main (blue-500)
  const [marginY, setMarginY] = useState('0');
  const [marginX, setMarginX] = useState('0');

  const handleReset = () => {
    setWidth('5.5rem');
    setHeight('2.5rem');
    setBorderColor('#3b82f6');
    setMarginY('0');
    setMarginX('0');
  };

  const handleInsert = () => {
    const params: string[] = [];
    if (width !== '5.5rem') params.push(`width="${width}"`);
    if (height !== '2.5rem') params.push(`height="${height}"`);
    if (borderColor !== '#3b82f6') params.push(`borderColor="${borderColor}"`);
    if (marginY !== '0') params.push(`marginY="${marginY}"`);
    if (marginX !== '0') params.push(`marginX="${marginX}"`);

    const shortcode = `{{< empty-box${params.length > 0 ? ' ' + params.join(' ') : ''} >}}`;
    onInsert(shortcode);
    onClose();
    handleReset();
  };

  // Generate preview HTML
  const previewHtml = (
    <div
      className="inline-flex border rounded-sm"
      style={{
        width: width,
        height: height,
        borderColor: borderColor,
        alignSelf: 'flex-start',
        marginTop: marginY !== '0' ? marginY : undefined,
        marginBottom: marginY !== '0' ? marginY : undefined,
        marginLeft: marginX !== '0' ? marginX : undefined,
        marginRight: marginX !== '0' ? marginX : undefined,
      }}
    />
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth sx={{ '& .MuiDialog-paper': { maxWidth: '900px', height: '80vh' } }}>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">Empty Box</Typography>
            <Tooltip title="Empty Box is used to create empty placeholder boxes with customizable dimensions and border color." arrow>
              <HelpCircle size={18} style={{ cursor: 'help', opacity: 0.7 }} />
            </Tooltip>
          </Box>
          <IconButton onClick={onClose} size="small">
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', gap: 2, mt: 1, overflow: 'hidden', pb: 1, flex: 1, minHeight: 0 }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5, overflow: 'auto', pr: 1, minWidth: 0 }}>
          <NumberWithUnitInput
            label="Width"
            value={width}
            onChange={setWidth}
            placeholder="5.5"
            defaultUnit="rem"
            allowPercent={true}
          />
          <NumberWithUnitInput
            label="Height"
            value={height}
            onChange={setHeight}
            placeholder="2.5"
            defaultUnit="rem"
          />
          <ColorPicker
            label="Border Color"
            value={borderColor}
            onChange={setBorderColor}
            placeholder="#3b82f6"
          />
          
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <NumberWithUnitInput
              label="Vertical Margin"
              value={marginY}
              onChange={setMarginY}
              placeholder="0"
              defaultUnit="rem"
            />
            <NumberWithUnitInput
              label="Horizontal Margin"
              value={marginX}
              onChange={setMarginX}
              placeholder="0"
              defaultUnit="rem"
            />
          </Box>
        </Box>
        
        <Divider orientation="vertical" flexItem />
        
        <Box sx={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <PreviewSection>
            {previewHtml}
          </PreviewSection>
        </Box>
      </DialogContent>
      <DialogActions>
        <Tooltip title="Reset" arrow>
          <IconButton onClick={handleReset} color="secondary">
            <RotateCcw size={20} />
          </IconButton>
        </Tooltip>
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleInsert} variant="contained">Insert</Button>
      </DialogActions>
    </Dialog>
  );
};

const ShortcodeToolbar: React.FC<ShortcodeToolbarProps> = ({ onInsert }) => {
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  const shortcodes = [
    { id: 'content-box', name: 'Content Box', icon: Square, component: ContentBoxDialog },
    { id: 'line', name: 'Line', icon: Minus, component: LineDialog },
    { id: 'flex', name: 'Flex', icon: Layout, component: FlexDialog },
    { id: 'table-flex', name: 'Table Flex', icon: Table, component: TableFlexDialog },
    { id: 'underscored-space', name: 'Underscored Space', icon: Underline, component: UnderscoredSpaceDialog },
    { id: 'empty-box', name: 'Empty Box', icon: BoxIcon, component: EmptyBoxDialog },
  ];

  const handleOpenDialog = (id: string) => {
    setOpenDialog(id);
  };

  const handleCloseDialog = () => {
    setOpenDialog(null);
  };

  const handleInsert = (shortcode: string) => {
    onInsert(shortcode);
  };

  return (
    <>
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 1, 
        p: 2,
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        bgcolor: 'rgba(255, 255, 255, 0.02)',
      }}>
        {shortcodes.map((shortcode) => {
          const Icon = shortcode.icon;
          return (
            <Tooltip key={shortcode.id} title={shortcode.name} arrow>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleOpenDialog(shortcode.id)}
                startIcon={<Icon size={16} />}
                sx={{
                  textTransform: 'none',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'text.primary',
                  '&:hover': {
                    borderColor: 'rgba(96, 165, 250, 0.5)',
                    bgcolor: 'rgba(96, 165, 250, 0.1)',
                  },
                }}
              >
                {shortcode.name}
              </Button>
            </Tooltip>
          );
        })}
      </Box>
      
      {shortcodes.map((shortcode) => {
        const DialogComponent = shortcode.component;
        return (
          <DialogComponent
            key={shortcode.id}
            open={openDialog === shortcode.id}
            onClose={handleCloseDialog}
            onInsert={handleInsert}
            shortcodeType={shortcode.id}
          />
        );
      })}
    </>
  );
};

export default ShortcodeToolbar;
