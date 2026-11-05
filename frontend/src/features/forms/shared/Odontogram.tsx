import React from 'react';

const UPPER = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
const LOWER = [31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18];

interface OdontogramProps {
  selectedTeeth?: number[];
  onChange?: (teeth: number[]) => void;
  disabled?: boolean;
}

export const Odontogram: React.FC<OdontogramProps> = ({ selectedTeeth = [], onChange, disabled = false }) => {
  const toggleTooth = (num: number) => {
    if (disabled || !onChange) return;
    const next = selectedTeeth.includes(num)
      ? selectedTeeth.filter(t => t !== num)
      : [...selectedTeeth, num];
    onChange(next);
  };

  const renderRow = (teeth: number[], isUpper: boolean) => (
    <div className="flex gap-1 justify-center">
      {teeth.map(num => {
        const isSelected = selectedTeeth.includes(num);
        return (
          <button
            key={num}
            type="button"
            disabled={disabled}
            onClick={() => toggleTooth(num)}
            className={`w-7 h-10 border rounded flex flex-col items-center justify-between p-1 text-[11px] font-mono transition-all
              ${isSelected ? 'bg-[#E25C1D] text-white border-[#C74E13] shadow-sm' : 'bg-white hover:bg-orange-50 border-gray-300 text-gray-700'}`}
          >
            {isUpper && <span>{num}</span>}
            <div className={`w-3.5 h-3.5 rounded-full border ${isSelected ? 'bg-white' : 'bg-gray-100'}`} />
            {!isUpper && <span>{num}</span>}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl my-2">
      {renderRow(UPPER, true)}
      <div className="border-b border-dashed border-gray-300 my-0.5" />
      {renderRow(LOWER, false)}
    </div>
  );
};
