import React from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Typography,
  IconButton,
  Tooltip,
  Paper,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  StrikethroughS,
  FormatColorText,
  Delete,
} from '@mui/icons-material';
import type { TextArea, TextStyle, CustomFont } from '../../types';
import { getSystemFonts } from '../../utils';

interface TextStylePanelProps {
  selectedArea: TextArea | null;
  customFonts: CustomFont[];
  onStyleChange: (areaId: string, style: Partial<TextStyle>) => void;
  onDeleteArea: (areaId: string) => void;
}

export const TextStylePanel: React.FC<TextStylePanelProps> = ({
  selectedArea,
  customFonts,
  onStyleChange,
  onDeleteArea,
}) => {
  if (!selectedArea) {
    return (
      <Paper sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
        Select a text area to edit its style
      </Paper>
    );
  }

  const { style } = selectedArea;
  const allFonts = [...getSystemFonts(), ...customFonts.map((f) => f.name)];

  const handleStyleChange = (updates: Partial<TextStyle>) => {
    onStyleChange(selectedArea.id, updates);
  };

  const handleFormatToggle = (format: 'bold' | 'italic') => {
    if (format === 'bold') {
      handleStyleChange({
        fontWeight: style.fontWeight === 'bold' ? 'normal' : 'bold',
      });
    } else {
      handleStyleChange({
        fontStyle: style.fontStyle === 'italic' ? 'normal' : 'italic',
      });
    }
  };

  const handleDecorationChange = (decoration: TextStyle['textDecoration']) => {
    handleStyleChange({
      textDecoration: style.textDecoration === decoration ? 'none' : decoration,
    });
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Text Style</Typography>
        <Tooltip title="Delete area">
          <IconButton
            color="error"
            onClick={() => onDeleteArea(selectedArea.id)}
            size="small"
          >
            <Delete />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={2}>
        {/* Font Family */}
        <Grid size={12}>
          <FormControl fullWidth size="small">
            <InputLabel>Font Family</InputLabel>
            <Select
              value={style.fontFamily}
              label="Font Family"
              onChange={(e) => handleStyleChange({ fontFamily: e.target.value })}
            >
              {allFonts.map((font) => (
                <MenuItem key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Font Size */}
        <Grid size={12}>
          <Typography variant="body2" gutterBottom>
            Font Size: {style.fontSize}px
          </Typography>
          <Slider
            value={style.fontSize}
            min={8}
            max={200}
            onChange={(_, value) => handleStyleChange({ fontSize: value as number })}
          />
        </Grid>

        {/* Font Weight */}
        <Grid size={12}>
          <FormControl fullWidth size="small">
            <InputLabel>Font Weight</InputLabel>
            <Select
              value={style.fontWeight}
              label="Font Weight"
              onChange={(e) => handleStyleChange({ fontWeight: e.target.value as TextStyle['fontWeight'] })}
            >
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="bold">Bold</MenuItem>
              <MenuItem value="100">100 - Thin</MenuItem>
              <MenuItem value="200">200 - Extra Light</MenuItem>
              <MenuItem value="300">300 - Light</MenuItem>
              <MenuItem value="400">400 - Normal</MenuItem>
              <MenuItem value="500">500 - Medium</MenuItem>
              <MenuItem value="600">600 - Semi Bold</MenuItem>
              <MenuItem value="700">700 - Bold</MenuItem>
              <MenuItem value="800">800 - Extra Bold</MenuItem>
              <MenuItem value="900">900 - Black</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Quick Format Buttons */}
        <Grid size={12}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <ToggleButtonGroup size="small">
              <ToggleButton
                value="bold"
                selected={style.fontWeight === 'bold' || parseInt(style.fontWeight as string) >= 700}
                onClick={() => handleFormatToggle('bold')}
              >
                <FormatBold />
              </ToggleButton>
              <ToggleButton
                value="italic"
                selected={style.fontStyle === 'italic'}
                onClick={() => handleFormatToggle('italic')}
              >
                <FormatItalic />
              </ToggleButton>
            </ToggleButtonGroup>

            <ToggleButtonGroup size="small">
              <ToggleButton
                value="underline"
                selected={style.textDecoration === 'underline'}
                onClick={() => handleDecorationChange('underline')}
              >
                <FormatUnderlined />
              </ToggleButton>
              <ToggleButton
                value="line-through"
                selected={style.textDecoration === 'line-through'}
                onClick={() => handleDecorationChange('line-through')}
              >
                <StrikethroughS />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Grid>

        <Grid size={12}>
          <Divider />
        </Grid>

        {/* Color */}
        <Grid size={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FormatColorText />
            <TextField
              type="color"
              value={style.color}
              onChange={(e) => handleStyleChange({ color: e.target.value })}
              size="small"
              sx={{ width: 60 }}
            />
            <Typography variant="body2">{style.color}</Typography>
          </Box>
        </Grid>

        {/* Opacity */}
        <Grid size={6}>
          <Typography variant="body2" gutterBottom>
            Opacity: {Math.round(style.opacity * 100)}%
          </Typography>
          <Slider
            value={style.opacity}
            min={0}
            max={1}
            step={0.05}
            onChange={(_, value) => handleStyleChange({ opacity: value as number })}
          />
        </Grid>

        {/* Text Transform */}
        <Grid size={12}>
          <FormControl fullWidth size="small">
            <InputLabel>Text Transform</InputLabel>
            <Select
              value={style.textTransform}
              label="Text Transform"
              onChange={(e) => handleStyleChange({ textTransform: e.target.value as TextStyle['textTransform'] })}
            >
              <MenuItem value="none">None</MenuItem>
              <MenuItem value="uppercase">UPPERCASE</MenuItem>
              <MenuItem value="lowercase">lowercase</MenuItem>
              <MenuItem value="capitalize">Capitalize</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Letter Spacing */}
        <Grid size={12}>
          <Typography variant="body2" gutterBottom>
            Letter Spacing: {style.letterSpacing}px
          </Typography>
          <Slider
            value={style.letterSpacing}
            min={-5}
            max={20}
            onChange={(_, value) => handleStyleChange({ letterSpacing: value as number })}
          />
        </Grid>

        {/* Line Height */}
        <Grid size={12}>
          <Typography variant="body2" gutterBottom>
            Line Height: {style.lineHeight}
          </Typography>
          <Slider
            value={style.lineHeight}
            min={0.5}
            max={3}
            step={0.1}
            onChange={(_, value) => handleStyleChange({ lineHeight: value as number })}
          />
        </Grid>

        <Grid size={12}>
          <Divider />
        </Grid>

        {/* Text Shadow */}
        <Grid size={12}>
          <TextField
            fullWidth
            size="small"
            label="Text Shadow (CSS format)"
            placeholder="2px 2px 4px #000000"
            value={style.textShadow === 'none' ? '' : style.textShadow}
            onChange={(e) => handleStyleChange({ textShadow: e.target.value || 'none' })}
            helperText="Format: offsetX offsetY blur color"
          />
        </Grid>
      </Grid>
    </Paper>
  );
};
