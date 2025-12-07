import React, { useCallback } from 'react';
import { Box, Button, Typography, Paper, IconButton, Tooltip } from '@mui/material';
import { CloudUpload, Delete, FontDownload } from '@mui/icons-material';
import type { UploadedImage, CustomFont } from '../../types';
import { registerCustomFont, unregisterCustomFont } from '../../utils';

interface ImageUploaderProps {
  image: UploadedImage | null;
  customFonts: CustomFont[];
  onImageUpload: (image: UploadedImage) => void;
  onImageClear: () => void;
  onFontUpload: (font: CustomFont) => void;
  onFontRemove: (font: CustomFont) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  image,
  customFonts,
  onImageUpload,
  onImageClear,
  onFontUpload,
  onFontRemove,
}) => {
  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const img = new Image();
        img.onload = () => {
          onImageUpload({
            file,
            dataUrl,
            width: img.width,
            height: img.height,
          });
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    },
    [onImageUpload]
  );

  const handleFontChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const font = await registerCustomFont(file);
        onFontUpload(font);
      } catch (error) {
        console.error('Failed to load font:', error);
        alert('Failed to load font. Please make sure it is a valid font file.');
      }
    },
    [onFontUpload]
  );

  const handleRemoveFont = (font: CustomFont) => {
    unregisterCustomFont(font);
    onFontRemove(font);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Image Upload */}
        <Box>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="image-upload"
            type="file"
            onChange={handleImageChange}
          />
          <label htmlFor="image-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<CloudUpload />}
            >
              {image ? 'Change Image' : 'Upload Image'}
            </Button>
          </label>
        </Box>

        {image && (
          <>
            <Typography variant="body2" color="text.secondary">
              {image.file.name} ({image.width} × {image.height})
            </Typography>
            <Tooltip title="Remove image">
              <IconButton size="small" color="error" onClick={onImageClear}>
                <Delete />
              </IconButton>
            </Tooltip>
          </>
        )}

        {/* Font Upload */}
        <Box sx={{ ml: 'auto' }}>
          <input
            accept=".ttf,.otf,.woff,.woff2"
            style={{ display: 'none' }}
            id="font-upload"
            type="file"
            onChange={handleFontChange}
          />
          <label htmlFor="font-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<FontDownload />}
              size="small"
            >
              Add Custom Font
            </Button>
          </label>
        </Box>
      </Box>

      {/* Custom Fonts List */}
      {customFonts.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Custom Fonts:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {customFonts.map((font) => (
              <Box
                key={font.name}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1,
                  py: 0.5,
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2" style={{ fontFamily: font.name }}>
                  {font.name}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleRemoveFont(font)}
                  sx={{ p: 0.25 }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
};
