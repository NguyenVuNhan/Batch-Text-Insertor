import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Add, Clear, ContentPaste, List, Close } from '@mui/icons-material';

interface NamesInputProps {
  names: string[];
  onNamesChange: (names: string[]) => void;
}

export const NamesInput: React.FC<NamesInputProps> = ({ names, onNamesChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkInputValue, setBulkInputValue] = useState('');

  const handleAddName = () => {
    if (inputValue.trim()) {
      onNamesChange([...names, inputValue.trim()]);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddName();
    }
  };

  const handleRemoveName = (index: number) => {
    const newNames = [...names];
    newNames.splice(index, 1);
    onNamesChange(newNames);
  };

  const handleClearAll = () => {
    onNamesChange([]);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      // Split by newlines only, preserve spaces within names
      const pastedNames = text
        .split(/[\n\r]+/)
        .map((name) => name.trim())
        .filter((name) => name.length > 0);
      
      if (pastedNames.length > 0) {
        onNamesChange([...names, ...pastedNames]);
      }
    } catch (error) {
      console.error('Failed to paste:', error);
    }
  };

  // Open bulk modal with current names
  const handleOpenBulkModal = () => {
    setBulkInputValue(names.join('\n'));
    setBulkModalOpen(true);
  };

  // Apply bulk input changes
  const handleApplyBulkInput = () => {
    // Split by newlines only, preserve spaces within each name
    const parsedNames = bulkInputValue
      .split(/[\n\r]+/)
      .map((name) => name.trim())
      .filter((name) => name.length > 0);
    onNamesChange(parsedNames);
    setBulkModalOpen(false);
  };

  // Cancel bulk input
  const handleCancelBulkInput = () => {
    setBulkModalOpen(false);
    setBulkInputValue('');
  };

  return (
    <>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Names List ({names.length})
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            label="Add name"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a name and press Enter"
          />
          <Button variant="contained" onClick={handleAddName} startIcon={<Add />}>
            Add
          </Button>
          <Tooltip title="Paste names from clipboard (one per line)">
            <IconButton onClick={handlePaste}>
              <ContentPaste />
            </IconButton>
          </Tooltip>
        </Box>

        <Button
          variant="outlined"
          fullWidth
          startIcon={<List />}
          onClick={handleOpenBulkModal}
          sx={{ mb: 2 }}
        >
          Bulk Input ({names.length} names)
        </Button>

        {names.length > 0 && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Preview:
              </Typography>
              <Button
                size="small"
                color="error"
                startIcon={<Clear />}
                onClick={handleClearAll}
              >
                Clear All
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxHeight: 150, overflow: 'auto' }}>
              {names.map((name, index) => (
                <Chip
                  key={index}
                  label={name}
                  size="small"
                  onDelete={() => handleRemoveName(index)}
                />
              ))}
            </Box>
          </>
        )}
      </Paper>

      {/* Bulk Input Modal */}
      <Dialog
        open={bulkModalOpen}
        onClose={handleCancelBulkInput}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: '70vh' }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Bulk Name Input
          <IconButton onClick={handleCancelBulkInput} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter one name per line. Names can contain spaces and special characters.
          </Typography>
          <TextField
            fullWidth
            multiline
            value={bulkInputValue}
            onChange={(e) => setBulkInputValue(e.target.value)}
            placeholder={"John Doe\nJane Smith\nDr. Bob Wilson Jr.\nMary-Anne O'Connor"}
            sx={{ 
              flex: 1,
              '& .MuiInputBase-root': {
                height: '100%',
                alignItems: 'flex-start',
              },
              '& .MuiInputBase-input': {
                height: '100% !important',
                overflow: 'auto !important',
              }
            }}
            slotProps={{
              input: {
                sx: { minHeight: '45vh' }
              }
            }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {bulkInputValue.split(/[\n\r]+/).filter(n => n.trim()).length} names detected
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCancelBulkInput} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleApplyBulkInput} variant="contained" color="primary">
            Apply Names
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
