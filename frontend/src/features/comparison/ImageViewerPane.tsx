import React, { useRef, useEffect } from 'react';
import { useGalleryStore } from '../../stores/useGalleryStore';
import { useImageViewer } from '../../hooks/useImageViewer';

interface Props {
  onOpenLightbox: (src: string) => void;
}

export const ImageViewerPane: React.FC<Props> = ({ onOpenLightbox }) => {
  const { items, selectedIndex } = useGalleryStore();
  const currentItem = items[selectedIndex];
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const {
    scale,
    pan,
    rotation,
    zoom,
    rotate,
    reset,
    fitToContainer,
    startDrag,
    onDrag,
    endDrag,
    naturalSize,
    setNaturalSize,
  } = useImageViewer();

  useEffect(() => {
    reset();
  }, [selectedIndex, reset]);

  const onImageLoad = () => {
    if (imgRef.current) {
      setNaturalSize({ width: imgRef.current.naturalWidth, height: imgRef.current.naturalHeight });
      fitToContainer(containerRef.current, imgRef.current);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    zoom(e.deltaY < 0 ? 1 : -1);
  };

  return (
    <section className="flex-1 flex flex-col h-full bg-[#1F1C1A] text-white overflow-hidden select-none">
      {/* Top toolbar */}
      <div className="h-11 bg-[#2C2926] border-b border-[#3D3A37] px-3 flex items-center justify-between shrink-0">
        <span className="text-xs font-mono text-gray-300 truncate max-w-[220px]">
          {currentItem ? `${currentItem.image_name} · ${naturalSize.width}×${naturalSize.height}` : '无图片'}
        </span>

        <div className="flex items-center gap-1.5 text-xs">
          <button type="button" onClick={() => zoom(1)} className="px-2 py-1 bg-[#3D3A37] hover:bg-[#4D4A47] rounded">🔍+</button>
          <button type="button" onClick={() => zoom(-1)} className="px-2 py-1 bg-[#3D3A37] hover:bg-[#4D4A47] rounded">🔍−</button>
          <button type="button" onClick={() => fitToContainer(containerRef.current, imgRef.current)} className="px-2 py-1 bg-[#3D3A37] hover:bg-[#4D4A47] rounded">适应</button>
          <button type="button" onClick={rotate} className="px-2 py-1 bg-[#3D3A37] hover:bg-[#4D4A47] rounded">⟳ 90°</button>
          <button type="button" onClick={reset} className="px-2 py-1 bg-[#3D3A37] hover:bg-[#4D4A47] rounded">复位</button>
          {currentItem?.image_url && (
            <button type="button" onClick={() => onOpenLightbox(currentItem.image_url)} className="px-2 py-1 bg-[#3D3A37] hover:bg-[#4D4A47] rounded">全屏</button>
          )}
          <span className="font-mono text-[11px] text-gray-400 ml-1">{Math.round(scale * 100)}%</span>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={startDrag}
        onMouseMove={onDrag}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        className="flex-1 overflow-hidden relative cursor-grab active:cursor-grabbing flex items-center justify-center"
      >
        {currentItem?.image_url ? (
          <img
            ref={imgRef}
            src={currentItem.image_url}
            alt=""
            onLoad={onImageLoad}
            draggable={false}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale}) rotate(${rotation}deg)`,
              transformOrigin: 'center center',
              transition: isNaN(pan.x) ? 'none' : 'transform 0.05s ease-out',
            }}
            className="max-w-none pointer-events-none select-none"
          />
        ) : (
          <div className="text-xs text-gray-500">请选择左侧列表中的图片进行对比查看</div>
        )}
      </div>
    </section>
  );
};
