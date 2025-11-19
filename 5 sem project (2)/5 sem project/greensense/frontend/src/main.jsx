// Frontend entry placeholder
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

// CRITICAL FIX: Import the CSS file that contains the Tailwind directives.
// This tells Vite/React to process the Tailwind styles and include them.
import './index.css';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);