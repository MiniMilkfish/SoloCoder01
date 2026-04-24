import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { Palette, Eraser, Pencil, Trash2, Minus, Circle, Square, Download } from 'lucide-react';

const COLORS = [
  '#1f2937',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
];

const SIZES = [2, 4, 6, 10, 16];

interface Point {
  x: number;
  y: number;
}

interface DrawAction {
  id: string;
  type: 'pen' | 'eraser';
  color: string;
  size: number;
  points: Point[];
}

export function CollaborativeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const isDrawingRef = useRef(false);
  const currentPointsRef = useRef<Point[]>([]);
  const canvasOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedSize, setSelectedSize] = useState(4);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [isConnected, setIsConnected] = useState(false);

  const getMousePos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const getTouchPos = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  }, []);

  const drawAction = useCallback((ctx: CanvasRenderingContext2D, action: DrawAction) => {
    if (action.points.length === 0) return;

    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (action.type === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = action.size * 3;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = action.color;
      ctx.lineWidth = action.size;
    }

    ctx.moveTo(action.points[0].x, action.points[0].y);
    for (let i = 1; i < action.points.length; i++) {
      const xc = (action.points[i].x + action.points[i - 1].x) / 2;
      const yc = (action.points[i].y + action.points[i - 1].y) / 2;
      ctx.quadraticCurveTo(action.points[i - 1].x, action.points[i - 1].y, xc, yc);
    }
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  }, []);

  const redrawAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const ydoc = ydocRef.current;
    if (!ydoc) return;

    const actions = ydoc.getArray<DrawAction>('canvas-actions');
    actions.forEach((action) => {
      drawAction(ctx, action);
    });
  }, [drawAction]);

  const startDrawing = useCallback((pos: Point) => {
    isDrawingRef.current = true;
    currentPointsRef.current = [pos];
  }, []);

  const continueDrawing = useCallback((pos: Point) => {
    if (!isDrawingRef.current) return;
    currentPointsRef.current.push(pos);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const points = currentPointsRef.current;
    if (points.length < 2) return;

    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = selectedSize * 3;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = selectedSize;
    }

    ctx.moveTo(points[points.length - 2].x, points[points.length - 2].y);
    ctx.quadraticCurveTo(
      points[points.length - 2].x,
      points[points.length - 2].y,
      (points[points.length - 1].x + points[points.length - 2].x) / 2,
      (points[points.length - 1].y + points[points.length - 2].y) / 2
    );
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  }, [tool, selectedColor, selectedSize]);

  const stopDrawing = useCallback(() => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    if (currentPointsRef.current.length < 2) {
      currentPointsRef.current = [];
      return;
    }

    const action: DrawAction = {
      id: Math.random().toString(36).substring(7),
      type: tool,
      color: selectedColor,
      size: selectedSize,
      points: [...currentPointsRef.current],
    };

    const ydoc = ydocRef.current;
    if (ydoc) {
      const actions = ydoc.getArray<DrawAction>('canvas-actions');
      actions.push([action]);
    }

    currentPointsRef.current = [];
  }, [tool, selectedColor, selectedSize]);

  const clearCanvas = useCallback(() => {
    const ydoc = ydocRef.current;
    if (ydoc) {
      const actions = ydoc.getArray<DrawAction>('canvas-actions');
      actions.delete(0, actions.length);
    }
    redrawAll();
  }, [redrawAll]);

  const downloadCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    ctx.drawImage(canvas, 0, 0);

    const link = document.createElement('a');
    link.download = `canvas-${Date.now()}.png`;
    link.href = tempCanvas.toDataURL();
    link.click();
  }, []);

  useEffect(() => {
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    const provider = new WebsocketProvider('ws://localhost:3001', 'yjs', ydoc);
    providerRef.current = provider;

    provider.on('status', (event: { status: string }) => {
      setIsConnected(event.status === 'connected');
    });

    const actions = ydoc.getArray<DrawAction>('canvas-actions');
    actions.observe(() => {
      redrawAll();
    });

    return () => {
      provider.destroy();
      ydoc.destroy();
    };
  }, [redrawAll]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      redrawAll();
    };

    resize();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, [redrawAll]);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-green-500 to-teal-600">
        <Palette className="w-5 h-5 text-white" />
        <h2 className="text-white font-semibold">协同画板</h2>
        <div className="ml-auto flex items-center gap-2">
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              isConnected
                ? 'bg-green-400/30 text-green-100'
                : 'bg-yellow-400/30 text-yellow-100'
            }`}
          >
            {isConnected ? '已同步' : '连接中...'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 px-4 py-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTool('pen')}
            className={`p-2 rounded-lg transition-colors ${
              tool === 'pen'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="画笔"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`p-2 rounded-lg transition-colors ${
              tool === 'eraser'
                ? 'bg-orange-100 text-orange-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="橡皮擦"
          >
            <Eraser className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-gray-300" />

        <div className="flex items-center gap-1">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`w-6 h-6 rounded-full border-2 transition-all ${
                selectedColor === color
                  ? 'border-gray-800 scale-110'
                  : 'border-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>

        <div className="w-px h-6 bg-gray-300" />

        <div className="flex items-center gap-1">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`p-1 rounded transition-colors ${
                selectedSize === size ? 'text-blue-600' : 'text-gray-600'
              }`}
              title={`大小: ${size}px`}
            >
              <div
                className="rounded-full bg-gray-800"
                style={{ width: size + 4, height: size + 4 }}
              />
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <button
          onClick={downloadCanvas}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="下载画布"
        >
          <Download className="w-4 h-4" />
        </button>
        <button
          onClick={clearCanvas}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="清空画布"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div ref={containerRef} className="flex-1 relative bg-gray-100">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 cursor-crosshair touch-none"
          onMouseDown={(e) => startDrawing(getMousePos(e))}
          onMouseMove={(e) => continueDrawing(getMousePos(e))}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={(e) => {
            e.preventDefault();
            startDrawing(getTouchPos(e));
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            continueDrawing(getTouchPos(e));
          }}
          onTouchEnd={stopDrawing}
        />
      </div>
    </div>
  );
}
