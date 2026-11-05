import React, { useState, useEffect } from 'react';

interface ToastMessage {
  id: number;
  text: string;
  type?: 'info' | 'success' | 'error';
}

let toastId = 0;
let addToastHandler: ((t: ToastMessage) => void) | null = null;

export function notify(text: string, type: 'info' | 'success' | 'error' = 'info') {
  if (addToastHandler) {
    addToastHandler({ id: ++toastId, text, type });
  }
}

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    addToastHandler = (t) => {
      setToasts(prev => [...prev, t]);
      setTimeout(() => {
        setToasts(prev => prev.filter(x => x.id !== t.id));
      }, 3000);
    };
    return () => { addToastHandler = null; };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none toast-container">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg transition-all transform translate-y-0
            ${t.type === 'error' ? 'bg-red-600 text-white' : t.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-white'}`}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
};
