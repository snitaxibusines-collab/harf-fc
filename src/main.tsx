import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/noto-naskh-arabic/arabic-500.css';
import '@fontsource/noto-naskh-arabic/arabic-700.css';
import '@fontsource/baloo-2/latin-500.css';
import '@fontsource/baloo-2/latin-700.css';
import '@fontsource/baloo-2/latin-800.css';
import './styles.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Si une nouvelle version est en ligne, on recharge la page (l'iPad garde parfois l'ancienne).
function checkVersion() {
  if (!location.protocol.startsWith('http')) return;
  fetch('version.txt?t=' + Date.now(), { cache: 'no-store' })
    .then((r) => (r.ok ? r.text() : ''))
    .then((v) => {
      v = v.trim();
      if (!v || v === __BUILD__) return;
      try {
        if (sessionStorage.getItem('harf-reloaded') === v) return;
        sessionStorage.setItem('harf-reloaded', v);
      } catch {
        /* rien */
      }
      location.reload();
    })
    .catch(() => undefined);
}
checkVersion();
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') checkVersion();
});
