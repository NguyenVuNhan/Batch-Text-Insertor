import React from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  LinearProgress,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { Download, Preview, Close } from '@mui/icons-material';
import type { GeneratedImage } from '../../types';

interface GeneratedImagesProps {
  images: GeneratedImage[];
  isProcessing: boolean;
  progress: { current: number; total: number };
  onDownloadAll: () => void;
  onDownloadSingle: (image: GeneratedImage) => void;
}

export const GeneratedImages: React.FC<GeneratedImagesProps> = ({
  images,
  isProcessing,
  progress,
  onDownloadAll,
  onDownloadSingle,
}) => {
  const [previewImage, setPreviewImage] = React.useState<GeneratedImage | null>(null);

  const progressPercent = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Generated Images ({images.length})
        </Typography>
        {images.length > 0 && (
          <Button
            variant="contained"
            color="success"
            startIcon={<Download />}
            onClick={onDownloadAll}
            disabled={isProcessing}
          >
            Download All
          </Button>
        )}
      </Box>

      {isProcessing && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Processing: {progress.current} / {progress.total}
          </Typography>
          <LinearProgress variant="determinate" value={progressPercent} />
        </Box>
      )}

      {images.length === 0 && !isProcessing && (
        <Typography color="text.secondary" textAlign="center" py={4}>
          No images generated yet. Add names and click "Generate Images" to start.
        </Typography>
      )}

      {images.length > 0 && (
        <ImageList cols={4} gap={8} sx={{ maxHeight: 400, overflow: 'auto' }}>
          {images.map((image, index) => (
            <ImageListItem key={index}>
              <img
                src={image.dataUrl}
                alt={image.name}
                loading="lazy"
                style={{ cursor: 'pointer' }}
                onClick={() => setPreviewImage(image)}
              />
              <ImageListItemBar
                title={image.name}
                actionIcon={
                  <Box>
                    <IconButton
                      sx={{ color: 'white' }}
                      onClick={() => setPreviewImage(image)}
                    >
                      <Preview />
                    </IconButton>
                    <IconButton
                      sx={{ color: 'white' }}
                      onClick={() => onDownloadSingle(image)}
                    >
                      <Download />
                    </IconButton>
                  </Box>
                }
              />
            </ImageListItem>
          ))}
        </ImageList>
      )}

      {/* Preview Dialog */}
      <Dialog
        open={!!previewImage}
        onClose={() => setPreviewImage(null)}
        maxWidth="lg"
        fullWidth
      >
        {previewImage && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {previewImage.name}
              <IconButton onClick={() => setPreviewImage(null)}>
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <img
                src={previewImage.dataUrl}
                alt={previewImage.name}
                style={{ width: '100%', height: 'auto' }}
              />
            </DialogContent>
          </>
        )}
      </Dialog>
    </Paper>
  );
};
