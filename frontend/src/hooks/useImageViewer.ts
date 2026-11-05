import { useState, useRef, useCallback, useEffect } from 'react';

export function useImageViewer() {
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const reset = useCallback(() => {
    setScale(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
  }, []);

  const fitToContainer = useCallback((containerEl: HTMLElement | null, imgEl: HTMLImageElement | null) => {
    if (!containerEl || !imgEl || !imgEl.naturalWidth) return;
    const cw = containerEl.clientWidth - 40;
    const ch = containerEl.clientHeight - 40;
    const nw = imgEl.naturalWidth;
    const nh = imgEl.naturalHeight;
    const s = Math.min(cw / nw, ch / nh, 1);
    setScale(s > 0 ? s : 1);
    setPan({ x: 0, y: 0 });
  }, []);

  const zoom = useCallback((delta: number) => {
    setScale(s => Math.min(Math.max(s + delta * 0.15, 0.1), 8));
  }, []);

  const rotate = useCallback(() => {
    setRotation(r => (r + 90) % 360);
  }, []);

  const startDrag = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  }, [pan]);

  const onDrag = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    setPan({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  }, []);

  const endDrag = useCallback(() => {
    isDragging.current = false;
  }, []);

  return {
    scale,
    pan,
    rotation,
    naturalSize,
    setNaturalSize,
    setScale,
    setPan,
    zoom,
    rotate,
    reset,
    fitToContainer,
    startDrag,
    onDrag,
    endDrag,
  };
}
