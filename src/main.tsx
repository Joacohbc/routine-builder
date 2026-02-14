import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/index.css';
import '@/i18n';
import App from '@/App.tsx';
import { initializeTheme } from '@/hooks/useTheme';

// Inicializar el tema antes de renderizar para evitar flash
initializeTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
