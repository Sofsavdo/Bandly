import './lib/cloudBoot'; // birinchi bo'lishi shart: navbatdagi hisob progressi boshqa modullardan oldin yoziladi
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
import { pullIfNewer, startCloud } from './lib/cloud';

// Telegram Mini App bo'lsa — avval Telegram skripti va avtomatik kirish; keyin hisob progressi (boshqa qurilmada yangilangan bo'lsa)
void bootTelegram().then(() => pullIfNewer()).finally(() => {
  startSync();
  startCloud();
  void initPay();
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
