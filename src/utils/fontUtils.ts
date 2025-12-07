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
    // Sans-serif fonts
    'Arial',
    'Arial Black',
    'Calibri',
    'Helvetica',
    'Segoe UI',
    'Tahoma',
    'Trebuchet MS',
    'Verdana',
    // Serif fonts
    'Cambria',
    'Georgia',
    'Palatino Linotype',
    'Times New Roman',
    // Monospace fonts
    'Consolas',
    'Courier New',
    'Lucida Console',
    // Display fonts
    'Comic Sans MS',
    'Impact',
    'Lucida Sans Unicode',
  ];
}

/**
 * Google Fonts with Vietnamese support
 */
export function getVietnameseFonts(): string[] {
  return [
    // Handwritten / Script with Vietnamese
    'Dancing Script',
    'Pacifico',
    'Caveat',
    'Charm',
    'Patrick Hand',
    'Kalam',
    'Handlee',
    'Architects Daughter',
    'Shadows Into Light',
    'Gloria Hallelujah',
    'Indie Flower',
    'Amatic SC',
    'Courgette',
    'Sacramento',
    'Great Vibes',
    'Satisfy',
    'Cookie',
    'Allura',
    'Yellowtail',
    'Merienda',
    // Sans-serif with Vietnamese
    'Be Vietnam Pro',
    'Quicksand',
    'Nunito',
    'Nunito Sans',
    'Josefin Sans',
    'Lexend',
    'Source Sans 3',
    'Mulish',
    'Barlow',
    'Manrope',
    'Space Grotesk',
    'Signika',
    'Signika Negative',
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Poppins',
    'Raleway',
    'Inter',
    'Work Sans',
    // Serif with Vietnamese
    'Spectral',
    'Lora',
    'Merriweather',
    'Playfair Display',
    'Source Serif 4',
  ];
}

/**
 * Other Google Fonts (may not fully support Vietnamese)
 */
export function getOtherGoogleFonts(): string[] {
  return [
    // === HANDWRITTEN / SCRIPT ===
    'Kaushan Script',
    'Alex Brush',
    'Bad Script',
    'Berkshire Swash',
    'Bilbo Swash Caps',
    'Cedarville Cursive',
    'Chilanka',
    'Damion',
    'Dawning of a New Day',
    'Delius',
    'Edu AU VIC WA NT Hand',
    'Edu NSW ACT Foundation',
    'Euphoria Script',
    'Felipa',
    'Gochi Hand',
    'Grand Hotel',
    'Herr Von Muellerhoff',
    'Homemade Apple',
    'Italianno',
    'Julee',
    'Just Another Hand',
    'Kristi',
    'La Belle Aurore',
    'League Script',
    'Leckerli One',
    'Loved by the King',
    'Lovers Quarrel',
    'Marck Script',
    'Meow Script',
    'Miama',
    'Monsieur La Doulaise',
    'Mr Dafoe',
    'Mrs Saint Delafield',
    'Niconne',
    'Nothing You Could Do',
    'Oooh Baby',
    'Over the Rainbow',
    'Parisienne',
    'Petit Formal Script',
    'Pinyon Script',
    'Playball',
    'Playwrite DE Grund',
    'Playwrite US Trad',
    'Princess Sofia',
    'Qwigley',
    'Reenie Beanie',
    'Rochester',
    'Rock Salt',
    'Rouge Script',
    'Ruthie',
    'Short Stack',
    'Sofia',
    'Stalemate',
    'Sue Ellen Francisco',
    'Sunshiney',
    'Tangerine',
    'The Girl Next Door',
    'Waiting for the Sunrise',
    'Zeyada',
    
    // === SANS-SERIF ===
    'Ubuntu',
    'Oswald',
    'Rubik',
    'Mukta',
    'Kanit',
    
    // === SERIF ===
    'PT Serif',
    'Libre Baskerville',
    'Crimson Text',
    'Eczar',
    
    // === DISPLAY / DECORATIVE ===
    'Bebas Neue',
    'Lobster',
    'Permanent Marker',
    'Righteous',
    'Bangers',
    'Alfa Slab One',
    'Anton',
    'Black Ops One',
    'Bungee',
    'Fredoka',
    'Orbitron',
    'Press Start 2P',
    'Special Elite',
    
    // === MONOSPACE ===
    'Roboto Mono',
    'Source Code Pro',
    'Fira Code',
    'JetBrains Mono',
    'IBM Plex Mono',
  ];
}

/**
 * All Google Fonts combined
 */
export function getGoogleFonts(): string[] {
  return [...getVietnameseFonts(), ...getOtherGoogleFonts()];
}

/**
 * Load a Google Font dynamically
 */
export async function loadGoogleFont(fontName: string): Promise<void> {
  // Check if already loaded
  const existingLink = document.querySelector(`link[data-font="${fontName}"]`);
  
  if (!existingLink) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    // Include italic variants as well
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap`;
    link.setAttribute('data-font', fontName);
    
    // Create a promise that resolves when the link loads
    const loadPromise = new Promise<void>((resolve, reject) => {
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to load font: ${fontName}`));
    });
    
    document.head.appendChild(link);
    
    // Wait for the CSS to load
    await loadPromise;
  }
  
  // Wait for the font face to be fully loaded and ready for use
  await document.fonts.ready;
  
  // Try to explicitly load the font with a test string to ensure it's available for canvas
  // Use a test string with common characters to trigger font loading
  const testWeights = ['400', '700'];
  const loadPromises = testWeights.map(weight => 
    document.fonts.load(`${weight} 16px "${fontName}"`, 'AaBbCcDdEe').catch(() => {
      // Some fonts might not support all weights, that's ok
    })
  );
  
  await Promise.all(loadPromises);
}

/**
 * Load multiple Google Fonts
 */
export async function loadGoogleFonts(fontNames: string[]): Promise<void> {
  await Promise.all(fontNames.map(loadGoogleFont));
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
