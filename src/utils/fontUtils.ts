import type { CustomFont } from '../types';

/**
 * Registers a custom font from a file
 */
export async function registerCustomFont(file: File): Promise<CustomFont> {
  const fontName = file.name.replace(/\.(ttf|otf|woff|woff2)$/i, '');
  const buffer = await file.arrayBuffer();
  
  const fontFace = new FontFace(fontName, buffer);
  await fontFace.load();
  document.fonts.add(fontFace);

  return {
    name: fontName,
    file,
    fontFace,
  };
}

/**
 * Removes a custom font
 */
export function unregisterCustomFont(font: CustomFont): void {
  document.fonts.delete(font.fontFace);
}

/**
 * Gets a list of available system fonts (common web-safe fonts)
 */
export function getSystemFonts(): string[] {
  return [
    'Arial',
    'Arial Black',
    'Calibri',
    'Cambria',
    'Comic Sans MS',
    'Consolas',
    'Courier New',
    'Georgia',
    'Helvetica',
    'Impact',
    'Lucida Console',
    'Lucida Sans Unicode',
    'Palatino Linotype',
    'Segoe UI',
    'Tahoma',
    'Times New Roman',
    'Trebuchet MS',
    'Verdana',
  ];
}

/**
 * Checks if a font is available
 */
export function isFontAvailable(fontFamily: string): boolean {
  const testString = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return false;

  ctx.font = `72px monospace`;
  const baseWidth = ctx.measureText(testString).width;

  ctx.font = `72px ${fontFamily}, monospace`;
  const testWidth = ctx.measureText(testString).width;

  return baseWidth !== testWidth;
}
