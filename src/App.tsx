import { useState, useCallback, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Alert,
} from '@mui/material';
import { PlayArrow } from '@mui/icons-material';
import {
  ImageCanvas,
  ImageUploader,
  TextStylePanel,
  NamesInput,
  GeneratedImages,
} from './components';
import type { UploadedImage, TextArea, TextStyle, CustomFont, GeneratedImage } from './types';
import { generateImages, downloadAsZip } from './utils';
import { loadPersistedState, savePersistedState } from './hooks';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  // Load initial state from localStorage
  const initialState = loadPersistedState();

  const [image, setImage] = useState<UploadedImage | null>(null);
  const [textAreas, setTextAreas] = useState<TextArea[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [names, setNames] = useState<string[]>(initialState?.names || []);
  const [customFonts, setCustomFonts] = useState<CustomFont[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [previewName] = useState('Preview Text');

  // Auto-save names to localStorage when they change
  useEffect(() => {
    const currentState = loadPersistedState() || { names: [] };
    savePersistedState({
      ...currentState,
      names,
    });
  }, [names]);

  // Auto-save last text style when it changes
  useEffect(() => {
    if (textAreas.length > 0) {
      const lastArea = textAreas[textAreas.length - 1];
      const currentState = loadPersistedState() || { names: [] };
      savePersistedState({
        ...currentState,
        lastTextStyle: lastArea.style,
      });
    }
  }, [textAreas]);

  const selectedArea = textAreas.find((a) => a.id === selectedAreaId) || null;

  const handleImageUpload = useCallback((uploadedImage: UploadedImage) => {
    setImage(uploadedImage);
    setTextAreas([]);
    setSelectedAreaId(null);
    setGeneratedImages([]);
  }, []);

  const handleImageClear = useCallback(() => {
    setImage(null);
    setTextAreas([]);
    setSelectedAreaId(null);
    setGeneratedImages([]);
  }, []);

  const handleStyleChange = useCallback((areaId: string, styleUpdates: Partial<TextStyle>) => {
    setTextAreas((areas) =>
      areas.map((area) =>
        area.id === areaId
          ? { ...area, style: { ...area.style, ...styleUpdates } }
          : area
      )
    );
  }, []);

  const handleDeleteArea = useCallback((areaId: string) => {
    setTextAreas((areas) => areas.filter((area) => area.id !== areaId));
    if (selectedAreaId === areaId) {
      setSelectedAreaId(null);
    }
  }, [selectedAreaId]);

  const handleFontUpload = useCallback((font: CustomFont) => {
    setCustomFonts((fonts) => [...fonts, font]);
  }, []);

  const handleFontRemove = useCallback((font: CustomFont) => {
    setCustomFonts((fonts) => fonts.filter((f) => f.name !== font.name));
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!image || names.length === 0 || textAreas.length === 0) return;

    setIsProcessing(true);
    setProgress({ current: 0, total: names.length });
    setGeneratedImages([]);

    try {
      const results = await generateImages(
        image.dataUrl,
        image.width,
        image.height,
        names,
        textAreas,
        (current, total) => setProgress({ current, total })
      );
      setGeneratedImages(results);
    } catch (error) {
      console.error('Failed to generate images:', error);
      alert('Failed to generate images. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [image, names, textAreas]);

  const handleDownloadAll = useCallback(() => {
    downloadAsZip(generatedImages);
  }, [generatedImages]);

  const handleDownloadSingle = useCallback((img: GeneratedImage) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(img.blob);
    link.download = `${img.name}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }, []);

  // Update preview name when names list changes
  const effectivePreviewName = names.length > 0 ? names[0] : previewName;

  const canGenerate = image && names.length > 0 && textAreas.length > 0;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Batch Text Insertion
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ py: 3, flex: 1 }}>
          <Grid container spacing={3}>
            {/* Left Panel - Image and Canvas */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <ImageUploader
                  image={image}
                  customFonts={customFonts}
                  onImageUpload={handleImageUpload}
                  onImageClear={handleImageClear}
                  onFontUpload={handleFontUpload}
                  onFontRemove={handleFontRemove}
                />

                {image && (
                  <Alert severity="info" sx={{ mb: 1 }}>
                    Click and drag on the image to create text areas. You can create multiple areas.
                  </Alert>
                )}

                <ImageCanvas
                  image={image}
                  textAreas={textAreas}
                  selectedAreaId={selectedAreaId}
                  onTextAreasChange={setTextAreas}
                  onSelectArea={setSelectedAreaId}
                  previewName={effectivePreviewName}
                  defaultTextStyle={initialState?.lastTextStyle}
                />

                <GeneratedImages
                  images={generatedImages}
                  isProcessing={isProcessing}
                  progress={progress}
                  onDownloadAll={handleDownloadAll}
                  onDownloadSingle={handleDownloadSingle}
                />
              </Box>
            </Grid>

            {/* Right Panel - Controls */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <NamesInput names={names} onNamesChange={setNames} />

                <TextStylePanel
                  selectedArea={selectedArea}
                  customFonts={customFonts}
                  onStyleChange={handleStyleChange}
                  onDeleteArea={handleDeleteArea}
                />

                <Button
                  variant="contained"
                  size="large"
                  color="success"
                  startIcon={<PlayArrow />}
                  onClick={handleGenerate}
                  disabled={!canGenerate || isProcessing}
                  fullWidth
                >
                  {isProcessing
                    ? `Generating... (${progress.current}/${progress.total})`
                    : `Generate ${names.length} Images`}
                </Button>

                {!canGenerate && (
                  <Alert severity="warning">
                    {!image && 'Upload an image, '}
                    {names.length === 0 && 'add some names, '}
                    {textAreas.length === 0 && 'create at least one text area'}
                    {' to enable generation.'}
                  </Alert>
                )}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
