import React, { useEffect, useState } from 'react';
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
import { getSystemFonts, getVietnameseFonts, getOtherGoogleFonts, loadGoogleFont } from '../../utils';

interface TextStylePanelProps {
  selectedArea: TextArea | null;
  customFonts: CustomFont[];
  onStyleChange: (areaId: string, style: Partial<TextStyle>) => void;
  onDeleteArea: (areaId: string) => void;
}

// Load all Google Fonts once when the module loads
const vietnameseFonts = getVietnameseFonts();
const otherGoogleFonts = getOtherGoogleFonts();
const allGoogleFonts = [...vietnameseFonts, ...otherGoogleFonts];
let fontsLoadingPromise: Promise<void> | null = null;

function loadAllGoogleFonts(): Promise<void> {
  if (fontsLoadingPromise) return fontsLoadingPromise;
  
  fontsLoadingPromise = Promise.all(
    allGoogleFonts.map(font => loadGoogleFont(font).catch(() => {
      // Ignore individual font load failures
    }))
  ).then(() => {});
  
  return fontsLoadingPromise;
}

export const TextStylePanel: React.FC<TextStylePanelProps> = ({
  selectedArea,
  customFonts,
  onStyleChange,
  onDeleteArea,
}) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Load all Google Fonts on mount
  useEffect(() => {
    loadAllGoogleFonts().then(() => {
      setFontsLoaded(true);
    });
  }, []);

  if (!selectedArea) {
    return (
      <Paper sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
        Select a text area to edit its style
      </Paper>
    );
  }

  const { style } = selectedArea;
  const systemFonts = getSystemFonts();
  const customFontNames = customFonts.map((f) => f.name);

  const handleStyleChange = (updates: Partial<TextStyle>) => {
    onStyleChange(selectedArea.id, updates);
  };

  const handleFontChange = (fontFamily: string) => {
    handleStyleChange({ fontFamily });
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

  // Convert font weight to number for slider
  const fontWeightValue = style.fontWeight === 'normal' ? 400 : 
    style.fontWeight === 'bold' ? 700 : 
    parseInt(style.fontWeight as string) || 400;

  const getFontWeightLabel = (weight: number): string => {
    const labels: Record<number, string> = {
      100: 'Thin',
      200: 'Extra Light',
      300: 'Light',
      400: 'Normal',
      500: 'Medium',
      600: 'Semi Bold',
      700: 'Bold',
      800: 'Extra Bold',
      900: 'Black',
    };
    return labels[weight] || 'Normal';
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
              onChange={(e) => handleFontChange(e.target.value)}
            >
              {/* Custom Fonts */}
              {customFontNames.length > 0 && (
                <MenuItem disabled sx={{ fontWeight: 'bold', opacity: 1 }}>
                  — Custom Fonts —
                </MenuItem>
              )}
              {customFontNames.map((font) => (
                <MenuItem key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </MenuItem>
              ))}
              
              {/* System Fonts */}
              <MenuItem disabled sx={{ fontWeight: 'bold', opacity: 1 }}>
                — System Fonts —
              </MenuItem>
              {systemFonts.map((font) => (
                <MenuItem key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </MenuItem>
              ))}
              
              {/* Vietnamese Fonts */}
              <MenuItem disabled sx={{ fontWeight: 'bold', opacity: 1, color: 'success.main' }}>
                — Vietnamese Support ✓ —
              </MenuItem>
              {vietnameseFonts.map((font) => (
                <MenuItem 
                  key={font} 
                  value={font} 
                  style={{ fontFamily: fontsLoaded ? font : 'inherit' }}
                >
                  {font}
                </MenuItem>
              ))}
              
              {/* Other Google Fonts */}
              <MenuItem disabled sx={{ fontWeight: 'bold', opacity: 1 }}>
                — Other Google Fonts —
              </MenuItem>
              {otherGoogleFonts.map((font) => (
                <MenuItem 
                  key={font} 
                  value={font} 
                  style={{ fontFamily: fontsLoaded ? font : 'inherit' }}
                >
                  {font}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Font Weight Slider */}
        <Grid size={12}>
          <Typography variant="body2" gutterBottom>
            Font Weight: {fontWeightValue} - {getFontWeightLabel(fontWeightValue)}
          </Typography>
          <Slider
            value={fontWeightValue}
            min={100}
            max={900}
            step={100}
            marks
            onChange={(_, value) => handleStyleChange({ fontWeight: String(value) as TextStyle['fontWeight'] })}
          />
        </Grid>

        {/* Quick Format Buttons */}
        <Grid size={12}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <ToggleButtonGroup size="small">
              <ToggleButton
                value="bold"
                selected={fontWeightValue >= 700}
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
      </Grid>
    </Paper>
  );
};
