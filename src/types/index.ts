// Text styling options matching CSS text properties
export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontStyle: 'normal' | 'italic' | 'oblique';
  color: string;
  textDecoration: 'none' | 'underline' | 'line-through' | 'overline';
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  letterSpacing: number;
  lineHeight: number;
  textShadow: string;
  opacity: number;
}

// Represents a selectable area on the image where text will be inserted
export interface TextArea {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  style: TextStyle;
}

// Represents an uploaded image
export interface UploadedImage {
  file: File;
  dataUrl: string;
  width: number;
  height: number;
}

// Represents a custom font uploaded by the user
export interface CustomFont {
  name: string;
  file: File;
  fontFace: FontFace;
}

// Represents a generated image with text inserted
export interface GeneratedImage {
  name: string;
  dataUrl: string;
  blob: Blob;
}

// Application state
export interface AppState {
  image: UploadedImage | null;
  textAreas: TextArea[];
  names: string[];
  customFonts: CustomFont[];
  selectedAreaId: string | null;
  isProcessing: boolean;
  generatedImages: GeneratedImage[];
}

// Default text style
export const DEFAULT_TEXT_STYLE: TextStyle = {
  fontFamily: 'Arial',
  fontSize: 24,
  fontWeight: 'normal',
  fontStyle: 'normal',
  color: '#000000',
  textDecoration: 'none',
  textTransform: 'none',
  letterSpacing: 0,
  lineHeight: 1.2,
  textShadow: 'none',
  opacity: 1,
};
