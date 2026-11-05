import React from 'react';
import ReactDOM from 'react-dom/client';
import JsBarcode from 'jsbarcode';
import { App } from './App';
import './index.css';

// Ensure barcode library is available globally for legacy form templates
(window as any).JsBarcode = JsBarcode;

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
