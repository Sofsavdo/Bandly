import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '@fontsource-variable/inter';
import '@fontsource/unbounded/600.css';
import '@fontsource/unbounded/700.css';
import './styles.css';
import { startSync } from './lib/account';
import { initPay } from './lib/pay';

import { bootTelegram } from './lib/telegram';

// Telegram Mini App bo'lsa — avval Telegram skripti va avtomatik kirish (oddiy saytda darhol o'tadi)
void bootTelegram().finally(() => {
  startSync();
  void initPay();
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
