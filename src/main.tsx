import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx';
import { LocationProvider } from './context/LocationContext.tsx';
import '../src/public/locales/i18n.ts';
import './App.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <AuthProvider>
        <LocationProvider>
          <App />
        </LocationProvider>
      </AuthProvider>
  </StrictMode>,
)
