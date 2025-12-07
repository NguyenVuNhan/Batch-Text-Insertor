# Batch Text Insertion - Copilot Instructions

## Project Overview
A React TypeScript application for batch inserting text into images. Users upload an image, define text areas by drawing rectangles, input a list of names, and generate individual images with each name rendered in the defined areas.

## Architecture

### Core Components (`src/components/`)
- **ImageCanvas** - Interactive canvas for image display and text area selection (drag-to-create, resize handles, move areas)
- **TextStylePanel** - Full CSS text styling controls (font, weight, color, shadow, transform, letter-spacing, etc.)
- **NamesInput** - Bulk name input with paste support and chip-based preview
- **ImageUploader** - Image and custom font upload handling
- **GeneratedImages** - Gallery view with download capabilities

### Utilities (`src/utils/`)
- **canvasUtils.ts** - Canvas rendering logic including `drawTextOnCanvas()` with auto-scaling/centering and `generateImages()` for batch processing
- **fontUtils.ts** - Custom font registration using FontFace API

### Type Definitions (`src/types/index.ts`)
- `TextStyle` - All CSS text properties (fontFamily, fontSize, fontWeight, fontStyle, color, textDecoration, textTransform, letterSpacing, lineHeight, textShadow, opacity)
- `TextArea` - Area definition with position, dimensions, and associated style
- `UploadedImage`, `CustomFont`, `GeneratedImage` - Supporting types

## Key Patterns

### Type Imports
Always use `type` keyword for type-only imports (TypeScript verbatimModuleSyntax enabled):
```typescript
import type { TextArea, TextStyle } from '../types';
import { DEFAULT_TEXT_STYLE } from '../types';  // value import separate
```

### Component Structure
Each component lives in its own folder with barrel export:
```
src/components/ComponentName/
├── ComponentName.tsx
└── index.ts  // exports { ComponentName }
```

### Canvas Coordinate Scaling
The canvas displays at scaled size for UI but stores coordinates in original image dimensions:
```typescript
// When drawing: multiply by scale
const scaledX = area.x * scale;
// When creating areas: divide by scale
x: currentRect.x / scale,
```

### State Management
App.tsx manages all state with `useState` hooks. Child components receive callbacks for state updates. No external state library.

## Development Commands
```bash
npm run dev      # Start dev server (Vite)
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # ESLint check
```

## Adding New Text Style Properties
1. Add property to `TextStyle` interface in `src/types/index.ts`
2. Add default value in `DEFAULT_TEXT_STYLE`
3. Add control in `TextStylePanel.tsx`
4. Handle rendering in `drawTextOnCanvas()` in `canvasUtils.ts`

## Custom Font Flow
1. User uploads `.ttf/.otf/.woff/.woff2` file
2. `registerCustomFont()` creates FontFace, loads it, adds to `document.fonts`
3. Font name appears in TextStylePanel dropdown
4. Canvas uses font via standard CSS font string
