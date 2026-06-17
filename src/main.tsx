import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import '@/index.css';
import '@/i18n';
import App from '@/App.tsx';
import { initializeTheme } from '@/hooks/useTheme';

registerSW({ immediate: true });

// Inicializar el tema antes de renderizar para evitar flash
initializeTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
