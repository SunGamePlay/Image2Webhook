import React, { useCallback, useRef } from 'react';

interface SplitterProps {
  onRatioChange: (ratio: number) => void;
}

export const Splitter: React.FC<SplitterProps> = ({ onRatioChange }) => {
  const isDragging = useRef(false);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (ev: MouseEvent) => {
      if (!isDragging.current) return;
      const totalWidth = window.innerWidth - 72; // minus navrail
      const currentX = ev.clientX - 72;
      const ratio = Math.min(Math.max((currentX / totalWidth) * 100, 10), 90);
      onRatioChange(Math.round(ratio));
    };

    const onMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [onRatioChange]);

  return (
    <div
      onMouseDown={onMouseDown}
      onDoubleClick={() => onRatioChange(50)}
      title="拖拽调节宽度，双击复位 50:50"
      className="w-1.5 hover:w-2 bg-[#EAE6DF] hover:bg-[#E25C1D] transition-all cursor-col-resize shrink-0 z-20 flex items-center justify-center group comparison-splitter"
    >
      <div className="w-0.5 h-8 bg-gray-400 group-hover:bg-white rounded-full transition" />
    </div>
  );
};
