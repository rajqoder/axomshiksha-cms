'use client';

import React, { useState, KeyboardEvent } from 'react';
import {
  Box,
  Chip,
  TextField,
  Typography,
} from '@mui/material';

interface KeywordsInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
}

const KeywordsInput: React.FC<KeywordsInputProps> = ({ value, onChange, error }) => {
  const [inputValue, setInputValue] = useState('');

  const handleDeleteKeyword = (keywordToDelete: string) => {
    onChange(value.filter(keyword => keyword !== keywordToDelete));
  };

  const addKeyword = (keyword: string) => {
    const trimmedKeyword = keyword.trim();
    if (trimmedKeyword && !value.includes(trimmedKeyword)) {
      onChange([...value, trimmedKeyword]);
      return true; // Successfully added
    }
    return false; // Not added
  };

  const handleAddKeywordFromInput = () => {
    if (addKeyword(inputValue)) {
      setInputValue(''); // Clear input only if keyword was added
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault(); // Prevent form submission or space insertion
      handleAddKeywordFromInput();
    }
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    
    // Check if the value ends with a space and add the keyword if so
    if (value.endsWith(' ')) {
      const keywordToAdd = value.trim();
      if (addKeyword(keywordToAdd)) {
        setInputValue(''); // Clear input after adding keyword
      } else {
        // If keyword wasn't added (e.g., duplicate), just remove the trailing space
        setInputValue(keywordToAdd + ' ');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
        {value.map((keyword) => (
          <Chip
            key={keyword}
            label={keyword}
            onDelete={() => handleDeleteKeyword(keyword)}
            color="primary"
            variant="outlined"
          />
        ))}
      </Box>
      <TextField
        fullWidth
        label="Enter keywords (press Space or Enter to add)"
        variant="outlined"
        margin="normal"
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        error={!!error}
        helperText={error || "Separate keywords with space or press Enter"}
        inputProps={{
          maxLength: 50, // Limit keyword length
        }}
      />
      <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
        {value.length} keyword(s) entered
      </Typography>
    </Box>
  );
};

export default KeywordsInput;