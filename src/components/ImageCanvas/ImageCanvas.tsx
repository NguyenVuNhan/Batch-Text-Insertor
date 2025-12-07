import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Box } from '@mui/material';
import type { TextArea, UploadedImage, TextStyle } from '../../types';
import { DEFAULT_TEXT_STYLE } from '../../types';
import { generateId, drawTextOnCanvas } from '../../utils';

interface ImageCanvasProps {
  image: UploadedImage | null;
  textAreas: TextArea[];
  selectedAreaId: string | null;
  onTextAreasChange: (areas: TextArea[]) => void;
  onSelectArea: (id: string | null) => void;
  previewName?: string;
  defaultTextStyle?: TextStyle;
}

interface DragState {
  isDragging: boolean;
  isResizing: boolean;
  startX: number;
  startY: number;
  areaStartX: number;
  areaStartY: number;
  areaStartWidth: number;
  areaStartHeight: number;
  resizeHandle: string | null;
}

const HANDLE_SIZE = 4;
const MIN_AREA_SIZE = 20; // Minimum 20px for usability, text will auto-scale

export const ImageCanvas: React.FC<ImageCanvasProps> = ({
  image,
  textAreas,
  selectedAreaId,
  onTextAreasChange,
  onSelectArea,
  previewName = 'Preview Text',
  defaultTextStyle,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [currentRect, setCurrentRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    isResizing: false,
    startX: 0,
    startY: 0,
    areaStartX: 0,
    areaStartY: 0,
    areaStartWidth: 0,
    areaStartHeight: 0,
    resizeHandle: null,
  });

  // Calculate scale to fit image in container
  useEffect(() => {
    if (image && containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const maxHeight = window.innerHeight * 0.6;
      const scaleX = containerWidth / image.width;
      const scaleY = maxHeight / image.height;
      setScale(Math.min(scaleX, scaleY, 1));
    }
  }, [image]);

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Clear and draw image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw text areas with preview text
      textAreas.forEach((area) => {
        const scaledArea = {
          ...area,
          x: area.x * scale,
          y: area.y * scale,
          width: area.width * scale,
          height: area.height * scale,
        };

        // Draw area rectangle
        ctx.strokeStyle = selectedAreaId === area.id ? 'rgba(25, 118, 210, 0.5)' : 'rgba(102, 102, 102, 0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(scaledArea.x, scaledArea.y, scaledArea.width, scaledArea.height);
        ctx.setLineDash([]);

        // Draw preview text
        drawTextOnCanvas(ctx, previewName, area, scale, scale);

        // Draw resize handles for selected area
        if (selectedAreaId === area.id) {
          drawResizeHandles(ctx, scaledArea);
        }
      });

      // Draw current selection rectangle
      if (currentRect) {
        ctx.strokeStyle = 'rgba(25, 118, 210, 0.1)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(currentRect.x, currentRect.y, currentRect.width, currentRect.height);
        ctx.setLineDash([]);
      }
    };
    img.src = image.dataUrl;
  }, [image, textAreas, selectedAreaId, scale, currentRect, previewName]);

  const drawResizeHandles = (ctx: CanvasRenderingContext2D, area: { x: number; y: number; width: number; height: number }) => {
    ctx.fillStyle = 'rgba(25, 118, 210, 0.5)';
    const handles = getResizeHandles(area);
    Object.values(handles).forEach((handle) => {
      ctx.fillRect(handle.x, handle.y, HANDLE_SIZE, HANDLE_SIZE);
    });
  };

  const getResizeHandles = (area: { x: number; y: number; width: number; height: number }) => {
    const halfHandle = HANDLE_SIZE / 2;
    return {
      nw: { x: area.x - halfHandle, y: area.y - halfHandle },
      ne: { x: area.x + area.width - halfHandle, y: area.y - halfHandle },
      sw: { x: area.x - halfHandle, y: area.y + area.height - halfHandle },
      se: { x: area.x + area.width - halfHandle, y: area.y + area.height - halfHandle },
      n: { x: area.x + area.width / 2 - halfHandle, y: area.y - halfHandle },
      s: { x: area.x + area.width / 2 - halfHandle, y: area.y + area.height - halfHandle },
      e: { x: area.x + area.width - halfHandle, y: area.y + area.height / 2 - halfHandle },
      w: { x: area.x - halfHandle, y: area.y + area.height / 2 - halfHandle },
    };
  };

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const findAreaAtPoint = (x: number, y: number): TextArea | null => {
    for (let i = textAreas.length - 1; i >= 0; i--) {
      const area = textAreas[i];
      const scaledArea = {
        x: area.x * scale,
        y: area.y * scale,
        width: area.width * scale,
        height: area.height * scale,
      };
      if (
        x >= scaledArea.x &&
        x <= scaledArea.x + scaledArea.width &&
        y >= scaledArea.y &&
        y <= scaledArea.y + scaledArea.height
      ) {
        return area;
      }
    }
    return null;
  };

  const findResizeHandle = (x: number, y: number): string | null => {
    if (!selectedAreaId) return null;
    const area = textAreas.find((a) => a.id === selectedAreaId);
    if (!area) return null;

    const scaledArea = {
      x: area.x * scale,
      y: area.y * scale,
      width: area.width * scale,
      height: area.height * scale,
    };
    const handles = getResizeHandles(scaledArea);

    for (const [key, handle] of Object.entries(handles)) {
      if (
        x >= handle.x &&
        x <= handle.x + HANDLE_SIZE &&
        y >= handle.y &&
        y <= handle.y + HANDLE_SIZE
      ) {
        return key;
      }
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!image) return;
    const { x, y } = getCanvasCoordinates(e);

    // Check for resize handle first
    const handle = findResizeHandle(x, y);
    if (handle && selectedAreaId) {
      const area = textAreas.find((a) => a.id === selectedAreaId);
      if (area) {
        setDragState({
          isDragging: false,
          isResizing: true,
          startX: x,
          startY: y,
          areaStartX: area.x,
          areaStartY: area.y,
          areaStartWidth: area.width,
          areaStartHeight: area.height,
          resizeHandle: handle,
        });
        return;
      }
    }

    // Check if clicking on existing area
    const clickedArea = findAreaAtPoint(x, y);
    if (clickedArea) {
      onSelectArea(clickedArea.id);
      setDragState({
        isDragging: true,
        isResizing: false,
        startX: x,
        startY: y,
        areaStartX: clickedArea.x,
        areaStartY: clickedArea.y,
        areaStartWidth: clickedArea.width,
        areaStartHeight: clickedArea.height,
        resizeHandle: null,
      });
      return;
    }

    // Start drawing new area
    onSelectArea(null);
    setIsDrawing(true);
    setDrawStart({ x, y });
    setCurrentRect({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!image) return;
    const { x, y } = getCanvasCoordinates(e);

    // Handle resizing
    if (dragState.isResizing && selectedAreaId) {
      const deltaX = (x - dragState.startX) / scale;
      const deltaY = (y - dragState.startY) / scale;

      const updatedAreas = textAreas.map((area) => {
        if (area.id !== selectedAreaId) return area;

        let newX = dragState.areaStartX;
        let newY = dragState.areaStartY;
        let newWidth = dragState.areaStartWidth;
        let newHeight = dragState.areaStartHeight;

        switch (dragState.resizeHandle) {
          case 'nw':
            newX = dragState.areaStartX + deltaX;
            newY = dragState.areaStartY + deltaY;
            newWidth = dragState.areaStartWidth - deltaX;
            newHeight = dragState.areaStartHeight - deltaY;
            break;
          case 'ne':
            newY = dragState.areaStartY + deltaY;
            newWidth = dragState.areaStartWidth + deltaX;
            newHeight = dragState.areaStartHeight - deltaY;
            break;
          case 'sw':
            newX = dragState.areaStartX + deltaX;
            newWidth = dragState.areaStartWidth - deltaX;
            newHeight = dragState.areaStartHeight + deltaY;
            break;
          case 'se':
            newWidth = dragState.areaStartWidth + deltaX;
            newHeight = dragState.areaStartHeight + deltaY;
            break;
          case 'n':
            newY = dragState.areaStartY + deltaY;
            newHeight = dragState.areaStartHeight - deltaY;
            break;
          case 's':
            newHeight = dragState.areaStartHeight + deltaY;
            break;
          case 'e':
            newWidth = dragState.areaStartWidth + deltaX;
            break;
          case 'w':
            newX = dragState.areaStartX + deltaX;
            newWidth = dragState.areaStartWidth - deltaX;
            break;
        }

        // Ensure minimum size
        if (newWidth < MIN_AREA_SIZE) {
          newWidth = MIN_AREA_SIZE;
          if (dragState.resizeHandle?.includes('w')) {
            newX = dragState.areaStartX + dragState.areaStartWidth - MIN_AREA_SIZE;
          }
        }
        if (newHeight < MIN_AREA_SIZE) {
          newHeight = MIN_AREA_SIZE;
          if (dragState.resizeHandle?.includes('n')) {
            newY = dragState.areaStartY + dragState.areaStartHeight - MIN_AREA_SIZE;
          }
        }

        return { ...area, x: newX, y: newY, width: newWidth, height: newHeight };
      });

      onTextAreasChange(updatedAreas);
      return;
    }

    // Handle dragging
    if (dragState.isDragging && selectedAreaId) {
      const deltaX = (x - dragState.startX) / scale;
      const deltaY = (y - dragState.startY) / scale;

      const updatedAreas = textAreas.map((area) => {
        if (area.id !== selectedAreaId) return area;
        return {
          ...area,
          x: Math.max(0, dragState.areaStartX + deltaX),
          y: Math.max(0, dragState.areaStartY + deltaY),
        };
      });

      onTextAreasChange(updatedAreas);
      return;
    }

    // Handle drawing new area
    if (isDrawing && drawStart) {
      const width = x - drawStart.x;
      const height = y - drawStart.y;
      setCurrentRect({
        x: width > 0 ? drawStart.x : x,
        y: height > 0 ? drawStart.y : y,
        width: Math.abs(width),
        height: Math.abs(height),
      });
    }
  }, [dragState, selectedAreaId, textAreas, isDrawing, drawStart, scale, onTextAreasChange, image]);

  const handleMouseUp = () => {
    // Finish drawing new area
    if (isDrawing && currentRect && currentRect.width >= MIN_AREA_SIZE && currentRect.height >= MIN_AREA_SIZE) {
      const newArea: TextArea = {
        id: generateId(),
        x: currentRect.x / scale,
        y: currentRect.y / scale,
        width: currentRect.width / scale,
        height: currentRect.height / scale,
        style: { ...(defaultTextStyle || DEFAULT_TEXT_STYLE) },
      };
      onTextAreasChange([...textAreas, newArea]);
      onSelectArea(newArea.id);
    }

    setIsDrawing(false);
    setDrawStart(null);
    setCurrentRect(null);
    setDragState({
      isDragging: false,
      isResizing: false,
      startX: 0,
      startY: 0,
      areaStartX: 0,
      areaStartY: 0,
      areaStartWidth: 0,
      areaStartHeight: 0,
      resizeHandle: null,
    });
  };

  const getCursor = (): string => {
    if (!image) return 'default';
    if (dragState.isResizing) {
      const handle = dragState.resizeHandle;
      if (handle === 'nw' || handle === 'se') return 'nwse-resize';
      if (handle === 'ne' || handle === 'sw') return 'nesw-resize';
      if (handle === 'n' || handle === 's') return 'ns-resize';
      if (handle === 'e' || handle === 'w') return 'ew-resize';
    }
    if (dragState.isDragging) return 'move';
    return 'crosshair';
  };

  if (!image) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 300,
          border: '2px dashed #ccc',
          borderRadius: 2,
          color: '#666',
        }}
      >
        Upload an image to get started
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        overflow: 'auto',
      }}
    >
      <canvas
        ref={canvasRef}
        width={image.width * scale}
        height={image.height * scale}
        style={{
          border: '1px solid #ccc',
          cursor: getCursor(),
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </Box>
  );
};
