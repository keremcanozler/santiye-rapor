import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Import and expose global libraries for compatibility
import { createIcons, icons } from 'lucide';
import html2pdf from 'html2pdf.js';

window.lucide = {
    createIcons,
    icons,
    ...icons // Spread icons to root so they can be accessed directly if needed
};
window.html2pdf = html2pdf;

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
