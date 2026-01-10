'use client';

import React, { useState } from 'react';
import {
  Box,
  Chip,
  TextField,
  Autocomplete,
  Typography,
} from '@mui/material';
import { TAGS } from '@/app/CONSTANT';

interface TagSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
}

const TagSelector: React.FC<TagSelectorProps> = ({ value, onChange, error }) => {
  const [inputValue, setInputValue] = useState('');

  const handleDeleteTag = (tagToDelete: string) => {
    onChange(value.filter(tag => tag !== tagToDelete));
  };

  const handleAddTag = (tag: string) => {
    if (tag && !value.includes(tag) && value.length < 5) {
      onChange([...value, tag]);
      setInputValue('');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
        {value.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            onDelete={() => handleDeleteTag(tag)}
            color="primary"
            variant="outlined"
          />
        ))}
      </Box>
      <Autocomplete
        options={TAGS.filter(tag => !value.includes(tag))}
        value={null}
        onChange={(event, newValue) => {
          if (newValue && !value.includes(newValue) && value.length < 5) {
            handleAddTag(newValue);
          }
        }}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        filterOptions={(options, { inputValue }) => {
          const normalizedInput = inputValue.toLowerCase().replace(/[^a-z0-9]/g, '');
          return options.filter(
            tag => 
              tag.toLowerCase().includes(inputValue.toLowerCase()) ||
              tag.toLowerCase().replace(/[^a-z0-9]/g, '').includes(normalizedInput)
          ).sort((a, b) => {
            // Sort to prioritize exact matches or closer matches at the top
            const aMatchesInput = a.toLowerCase().includes(inputValue.toLowerCase());
            const bMatchesInput = b.toLowerCase().includes(inputValue.toLowerCase());
            
            if (aMatchesInput && !bMatchesInput) return -1;
            if (!aMatchesInput && bMatchesInput) return 1;
            
            return a.localeCompare(b);
          });
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Select tags (max 5)"
            error={!!error}
            helperText={error}
            inputProps={{
              ...params.inputProps,
              maxLength: 50, // Limit tag length
            }}
            disabled={value.length >= 5}
            value={inputValue}
          />
        )}
        limitTags={5}
        disabled={value.length >= 5}
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
        autoComplete
      />
      <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
        {value.length}/5 tags selected
      </Typography>
    </Box>
  );
};

export default TagSelector;