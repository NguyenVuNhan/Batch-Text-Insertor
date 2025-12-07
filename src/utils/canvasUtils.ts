import type { TextStyle, TextArea } from '../types';

/**
 * Draws text on a canvas with auto-scaling and centering within the specified area
 */
export function drawTextOnCanvas(
  ctx: CanvasRenderingContext2D,
  text: string,
  area: TextArea,
  scaleX: number = 1,
  scaleY: number = 1
): void {
  const { style } = area;
  
  // Calculate scaled dimensions
  const scaledX = area.x * scaleX;
  const scaledY = area.y * scaleY;
  const scaledWidth = area.width * scaleX;
  const scaledHeight = area.height * scaleY;

  // Apply text transformations
  let displayText = text;
  switch (style.textTransform) {
    case 'uppercase':
      displayText = text.toUpperCase();
      break;
    case 'lowercase':
      displayText = text.toLowerCase();
      break;
    case 'capitalize':
      displayText = text.replace(/\b\w/g, (c) => c.toUpperCase());
      break;
  }

  // Find the optimal font size that fits within the area
  const optimalFontSize = calculateOptimalFontSize(
    ctx,
    displayText,
    scaledWidth,
    scaledHeight,
    style
  );

  // Set canvas text properties
  ctx.save();
  ctx.globalAlpha = style.opacity;
  ctx.font = buildFontString(style, optimalFontSize);
  ctx.fillStyle = style.color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Apply text shadow if specified
  if (style.textShadow && style.textShadow !== 'none') {
    const shadowMatch = style.textShadow.match(
      /(-?\d+)px\s+(-?\d+)px\s+(\d+)px\s+(.*)/
    );
    if (shadowMatch) {
      ctx.shadowOffsetX = parseInt(shadowMatch[1]);
      ctx.shadowOffsetY = parseInt(shadowMatch[2]);
      ctx.shadowBlur = parseInt(shadowMatch[3]);
      ctx.shadowColor = shadowMatch[4];
    }
  }

  // Calculate center position
  const centerX = scaledX + scaledWidth / 2;
  const centerY = scaledY + scaledHeight / 2;

  // Apply letter spacing by drawing each character individually if needed
  if (style.letterSpacing !== 0) {
    drawTextWithLetterSpacing(ctx, displayText, centerX, centerY, style.letterSpacing);
  } else {
    ctx.fillText(displayText, centerX, centerY);
  }

  // Apply text decoration
  if (style.textDecoration !== 'none') {
    drawTextDecoration(ctx, displayText, centerX, centerY, optimalFontSize, style);
  }

  ctx.restore();
}

/**
 * Calculates the optimal font size to fit text within the given dimensions
 */
function calculateOptimalFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxHeight: number,
  style: TextStyle
): number {
  const minFontSize = 4; // Allow very small fonts for tiny areas
  const padding = 4; // Minimal padding for better fit

  // Binary search for optimal font size
  // Start from very small and go up to the area height (text can be as tall as the area)
  let low = minFontSize;
  let high = Math.max(maxHeight, maxWidth); // Use larger dimension as upper bound
  let optimalFontSize = minFontSize;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    ctx.font = buildFontString(style, mid);
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width + (style.letterSpacing * (text.length - 1));
    const textHeight = mid * style.lineHeight;

    if (textWidth <= maxWidth - padding && textHeight <= maxHeight - padding) {
      optimalFontSize = mid; // This size fits, try larger
      low = mid + 1;
    } else {
      high = mid - 1; // Too big, try smaller
    }
  }

  return Math.max(optimalFontSize, minFontSize);
}

/**
 * Builds a CSS font string from text style
 */
function buildFontString(style: TextStyle, fontSize: number): string {
  return `${style.fontStyle} ${style.fontWeight} ${fontSize}px ${style.fontFamily}`;
}

/**
 * Draws text with custom letter spacing
 */
function drawTextWithLetterSpacing(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  letterSpacing: number
): void {
  const characters = text.split('');
  let totalWidth = 0;

  // Calculate total width
  characters.forEach((char) => {
    totalWidth += ctx.measureText(char).width + letterSpacing;
  });
  totalWidth -= letterSpacing; // Remove last spacing

  // Start position (centered)
  let currentX = x - totalWidth / 2;

  characters.forEach((char) => {
    const charWidth = ctx.measureText(char).width;
    ctx.fillText(char, currentX + charWidth / 2, y);
    currentX += charWidth + letterSpacing;
  });
}

/**
 * Draws text decoration (underline, line-through, overline)
 */
function drawTextDecoration(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fontSize: number,
  style: TextStyle
): void {
  const metrics = ctx.measureText(text);
  const textWidth = metrics.width + (style.letterSpacing * (text.length - 1));
  const startX = x - textWidth / 2;
  const endX = x + textWidth / 2;

  ctx.strokeStyle = style.color;
  ctx.lineWidth = Math.max(1, fontSize / 15);
  ctx.beginPath();

  switch (style.textDecoration) {
    case 'underline':
      const underlineY = y + fontSize / 4;
      ctx.moveTo(startX, underlineY);
      ctx.lineTo(endX, underlineY);
      break;
    case 'line-through':
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      break;
    case 'overline':
      const overlineY = y - fontSize / 2;
      ctx.moveTo(startX, overlineY);
      ctx.lineTo(endX, overlineY);
      break;
  }

  ctx.stroke();
}

/**
 * Generates images with text inserted for each name
 */
export async function generateImages(
  imageDataUrl: string,
  imageWidth: number,
  imageHeight: number,
  names: string[],
  textAreas: TextArea[],
  onProgress?: (current: number, total: number) => void
): Promise<{ name: string; dataUrl: string; blob: Blob }[]> {
  const results: { name: string; dataUrl: string; blob: Blob }[] = [];
  
  // Load the source image
  const img = await loadImage(imageDataUrl);

  for (let i = 0; i < names.length; i++) {
    const name = names[i].trim();
    if (!name) continue;

    // Create a canvas for this image
    const canvas = document.createElement('canvas');
    canvas.width = imageWidth;
    canvas.height = imageHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) continue;

    // Draw the base image
    ctx.drawImage(img, 0, 0, imageWidth, imageHeight);

    // Draw text on each area
    textAreas.forEach((area) => {
      drawTextOnCanvas(ctx, name, area);
    });

    // Convert to blob
    const blob = await canvasToBlob(canvas);
    const dataUrl = canvas.toDataURL('image/png');

    results.push({ name, dataUrl, blob });

    if (onProgress) {
      onProgress(i + 1, names.length);
    }
  }

  return results;
}

/**
 * Loads an image from a data URL
 */
function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/**
 * Converts canvas to blob
 */
function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to create blob'));
      }
    }, 'image/png');
  });
}

/**
 * Downloads all generated images as a zip file
 */
export async function downloadAsZip(
  images: { name: string; blob: Blob }[]
): Promise<void> {
  // Simple download without zip for now - each file individually
  // For production, consider using JSZip library
  images.forEach((image, index) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(image.blob);
    link.download = `${image.name || `image-${index + 1}`}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  });
}

/**
 * Generates a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
