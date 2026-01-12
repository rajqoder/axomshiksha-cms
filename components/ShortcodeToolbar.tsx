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
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Helper function to parse and render markdown tables, handling tables without headers
const renderMarkdownTables = (markdown: string) => {
  if (!markdown || markdown.trim() === '') {
    // Default preview: 3 sample tables (one without header)
    const defaultTables = `| Header 1 | Header 2 | Header 3 |
|----------|---------|---------|
| Cell 1   | Cell 2  | Cell 3  |
| Cell 4   | Cell 5  | Cell 6  |

|     |     |
|-----|-----|
| A   | B   |
| C   | D   |

| Col 1 | Col 2 |
|-------|-------|
| Data 1| Data 2|`;
    return <ReactMarkdown remarkPlugins={[remarkGfm]}>{defaultTables}</ReactMarkdown>;
  }
  
  // Process markdown to handle tables without headers
  const processMarkdown = (md: string): string => {
    const lines = md.split('\n');
    const processed: string[] = [];
    let i = 0;
    
    while (i < lines.length) {
      const line = lines[i];
      const isSeparator = line.match(/^\|[\s\-\|:]+\|$/);
      
      if (isSeparator) {
        // Check previous line - if it's not a table row or is empty, this table has no header
        const prevLine = i > 0 ? lines[i - 1].trim() : '';
        const isPrevTableRow = prevLine.match(/^\|[\s\w\|]+\|$/);
        
        // Check if previous line is empty or not a table row
        if (!isPrevTableRow || prevLine === '' || prevLine.length === 0) {
          // No header row - skip the separator line
          i++;
          continue;
        }
      }
      
      processed.push(line);
      i++;
    }
    
    return processed.join('\n');
  };
  
  const processedMarkdown = processMarkdown(markdown);
  return (
    <Box sx={{ alignSelf: 'flex-start', width: '100%' }}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{processedMarkdown}</ReactMarkdown>
    </Box>
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

const PreviewSection: React.FC<PreviewSectionProps> = ({ title = 'Live Preview', children }) => {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Eye size={16} />
        <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
          {title}
        </Typography>
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
          minHeight: '400px',
          maxHeight: 'calc(80vh - 120px)',
        }}
      >
        <Box sx={{ width: '100%', alignSelf: 'flex-start' }}>
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
  const [marginY, setMarginY] = useState('1rem');

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
    setMarginY('1rem');
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
    if (marginY !== '1rem') params.push(`marginY="${marginY}"`);

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
          marginTop: marginY,
          marginBottom: marginY,
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
        marginRight: '1rem',
        borderRadius: '0.375rem',
        marginTop: marginY,
        marginBottom: marginY,
        width: width !== 'auto' ? width : undefined,
        height: height !== 'auto' ? height : undefined,
        backgroundColor: bgColor !== 'transparent' ? bgColor : undefined,
        color: bgColor === 'white' ? 'black' : (textColor || undefined),
        alignSelf: 'flex-start',
      }}
    >
      {content ? <ReactMarkdown>{content}</ReactMarkdown> : <span style={{ opacity: 0.5 }}>Preview content</span>}
    </div>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth sx={{ '& .MuiDialog-paper': { maxWidth: '900px', height: '80vh' } }}>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Content Box Shortcode</Typography>
          <IconButton onClick={onClose} size="small">
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', gap: 2, mt: 1, overflow: 'hidden', pb: 1 }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5, overflow: 'auto', pr: 1 }}>
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
          
          <NumberWithUnitInput
            label="Vertical Margin"
            value={marginY}
            onChange={setMarginY}
            placeholder="1"
            defaultUnit="rem"
          />
          
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
        
        <Box sx={{ flex: 1, minWidth: '300px' }}>
          <PreviewSection>
            {previewHtml}
          </PreviewSection>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleReset} color="secondary">Reset</Button>
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
  const [marginY, setMarginY] = useState('1.125rem');

  const handleReset = () => {
    setWidth('100%');
    setHeight('1px');
    setColor('#6b7280');
    setMarginY('1.125rem');
  };

  const handleInsert = () => {
    const params: string[] = [];
    if (width !== '100%') params.push(`width="${width}"`);
    if (height !== '1px') params.push(`height="${height}"`);
    if (color !== '#6b7280') params.push(`color="${color}"`);
    if (marginY !== '1.125rem') params.push(`marginY="${marginY}"`);

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
        alignSelf: 'flex-start',
      }}
    />
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth sx={{ '& .MuiDialog-paper': { maxWidth: '900px', height: '80vh' } }}>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Line Shortcode</Typography>
          <IconButton onClick={onClose} size="small">
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', gap: 2, mt: 1, overflow: 'hidden', pb: 1 }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5, overflow: 'auto', pr: 1 }}>
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
        
        <Box sx={{ flex: 1, minWidth: '300px' }}>
          <PreviewSection>
            {previewHtml}
          </PreviewSection>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleReset} color="secondary">Reset</Button>
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
  const [gap, setGap] = useState('1rem');
  const [marginY, setMarginY] = useState('1rem');
  const [flex, setFlex] = useState('');
  const [innerContent, setInnerContent] = useState('');

  const handleReset = () => {
    setDirection('row');
    setJustifyContent('start');
    setAlignItems('start');
    setGap('1rem');
    setMarginY('1rem');
    setFlex('');
    setInnerContent('');
  };

  const handleInsert = () => {
    const params: string[] = [];
    if (direction !== 'row') params.push(`direction="${direction}"`);
    if (justifyContent !== 'start') params.push(`justifyContent="${justifyContent}"`);
    if (alignItems !== 'start') params.push(`alignItems="${alignItems}"`);
    if (gap !== '1rem') params.push(`gap="${gap}"`);
    if (marginY !== '1rem') params.push(`marginY="${marginY}"`);
    if (flex) params.push(`flex="${flex}"`);

    const shortcode = `{{< flex${params.length > 0 ? ' ' + params.join(' ') : ''} >}}${innerContent || '\n  Your content here\n'}{{< /flex >}}`;
    onInsert(shortcode);
    onClose();
    handleReset();
  };

  // Generate preview HTML
  const getFlexValue = () => {
    if (!flex) return undefined;
    if (flex === '1' || flex === 'auto' || flex === 'initial' || flex === 'none') {
      return flex;
    }
    return flex;
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

  const previewHtml = (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: alignItemsMap[alignItems] || 'flex-start',
        justifyContent: justifyContentMap[justifyContent] || 'flex-start',
        flexDirection: direction === 'column' ? 'column' : 'row',
        marginTop: marginY,
        marginBottom: marginY,
        gap: gap,
        flex: flexValue,
        alignSelf: 'flex-start',
      }}
    >
      {innerContent ? (
        <div dangerouslySetInnerHTML={{ __html: innerContent }} />
      ) : (
        <>
          <div style={{ padding: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>Item 1</div>
          <div style={{ padding: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>Item 2</div>
          <div style={{ padding: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>Item 3</div>
        </>
      )}
    </div>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth sx={{ '& .MuiDialog-paper': { maxWidth: '900px', height: '80vh' } }}>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Flex Shortcode</Typography>
          <IconButton onClick={onClose} size="small">
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', gap: 2, mt: 1, overflow: 'hidden', pb: 1 }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5, overflow: 'auto', pr: 1 }}>
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
          
          <NumberWithUnitInput
            label="Gap"
            value={gap}
            onChange={setGap}
            placeholder="1"
            defaultUnit="rem"
          />
          
          <NumberWithUnitInput
            label="Vertical Margin"
            value={marginY}
            onChange={setMarginY}
            placeholder="1"
            defaultUnit="rem"
          />
          
          <TextField
            fullWidth
            size="small"
            label="Flex (optional)"
            value={flex}
            onChange={(e) => setFlex(e.target.value)}
            placeholder="e.g., 1, auto, initial, none, or custom value"
            helperText="Values: 1, auto, initial, none, or any custom flex value"
          />
          
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
        </Box>
        
        <Divider orientation="vertical" flexItem />
        
        <Box sx={{ flex: 1, minWidth: '300px' }}>
          <PreviewSection>
            {previewHtml}
          </PreviewSection>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleReset} color="secondary">Reset</Button>
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
  const [gap, setGap] = useState('1rem');
  const [wrap, setWrap] = useState('wrap');
  const [marginY, setMarginY] = useState('1rem');
  const [innerContent, setInnerContent] = useState('');

  const handleReset = () => {
    setDirection('row');
    setJustifyContent('start');
    setAlignItems('start');
    setGap('1rem');
    setWrap('wrap');
    setMarginY('1rem');
    setInnerContent('');
  };

  const handleInsert = () => {
    const params: string[] = [];
    if (direction !== 'row') params.push(`direction="${direction}"`);
    if (justifyContent !== 'start') params.push(`justifyContent="${justifyContent}"`);
    if (alignItems !== 'start') params.push(`alignItems="${alignItems}"`);
    if (gap !== '1rem') params.push(`gap="${gap}"`);
    if (wrap !== 'wrap') params.push(`wrap="${wrap}"`);
    if (marginY !== '1rem') params.push(`marginY="${marginY}"`);

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

  const previewHtml = (
    <div
      style={{
        display: 'flex',
        flexWrap: wrap === 'nowrap' ? 'nowrap' : 'wrap',
        alignItems: alignItemsMap[alignItems] || 'flex-start',
        justifyContent: justifyContentMap[justifyContent] || 'flex-start',
        flexDirection: direction === 'column' ? 'column' : 'row',
        marginTop: marginY,
        marginBottom: marginY,
        gap: gap,
        alignSelf: 'flex-start',
      }}
    >
      {innerContent ? (
        renderMarkdownTables(innerContent)
      ) : (
        renderMarkdownTables('')
      )}
    </div>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth sx={{ '& .MuiDialog-paper': { maxWidth: '900px', height: '80vh' } }}>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Table Flex Shortcode</Typography>
          <IconButton onClick={onClose} size="small">
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', gap: 2, mt: 1, overflow: 'hidden', pb: 1 }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5, overflow: 'auto', pr: 1 }}>
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
          
          <NumberWithUnitInput
            label="Vertical Margin"
            value={marginY}
            onChange={setMarginY}
            placeholder="1"
            defaultUnit="rem"
          />
          
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
        </Box>
        
        <Divider orientation="vertical" flexItem />
        
        <Box sx={{ flex: 1, minWidth: '300px' }}>
          <PreviewSection>
            {previewHtml}
          </PreviewSection>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleReset} color="secondary">Reset</Button>
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

  const handleReset = () => {
    setNo('1');
    setWidth('6rem');
    setColor('#6b7280');
  };

  const handleInsert = () => {
    const params: string[] = [];
    if (no !== '1') params.push(`no="${no}"`);
    if (width !== '6rem') params.push(`width="${width}"`);
    if (color !== '#6b7280') params.push(`color="${color}"`);

    const shortcode = `{{< underscored-space${params.length > 0 ? ' ' + params.join(' ') : ''} >}}`;
    onInsert(shortcode);
    onClose();
    handleReset();
  };

  // Generate preview HTML
  const count = parseInt(no) || 1;
  const previewHtml = (
    <Box sx={{ alignSelf: 'flex-start' }}>
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
          <Typography variant="h6">Underscored Space Shortcode</Typography>
          <IconButton onClick={onClose} size="small">
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', gap: 2, mt: 1, overflow: 'hidden', pb: 1 }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5, overflow: 'auto', pr: 1 }}>
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
        </Box>
        
        <Divider orientation="vertical" flexItem />
        
        <Box sx={{ flex: 1, minWidth: '300px' }}>
          <PreviewSection>
            {previewHtml}
          </PreviewSection>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleReset} color="secondary">Reset</Button>
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

  const handleReset = () => {
    setWidth('5.5rem');
    setHeight('2.5rem');
    setBorderColor('#3b82f6');
  };

  const handleInsert = () => {
    const params: string[] = [];
    if (width !== '5.5rem') params.push(`width="${width}"`);
    if (height !== '2.5rem') params.push(`height="${height}"`);
    if (borderColor !== '#3b82f6') params.push(`borderColor="${borderColor}"`);

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
      }}
    />
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth sx={{ '& .MuiDialog-paper': { maxWidth: '900px', height: '80vh' } }}>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Empty Box Shortcode</Typography>
          <IconButton onClick={onClose} size="small">
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', gap: 2, mt: 1, overflow: 'hidden', pb: 1 }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5, overflow: 'auto', pr: 1 }}>
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
        </Box>
        
        <Divider orientation="vertical" flexItem />
        
        <Box sx={{ flex: 1, minWidth: '300px' }}>
          <PreviewSection>
            {previewHtml}
          </PreviewSection>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleReset} color="secondary">Reset</Button>
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
        <Typography variant="body2" sx={{ width: '100%', mb: 1, color: 'text.secondary', fontWeight: 600 }}>
          Shortcodes
        </Typography>
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
