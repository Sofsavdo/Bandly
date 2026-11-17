import './lib/cloudBoot'; // birinchi bo'lishi shart: navbatdagi hisob progressi boshqa modullardan oldin yoziladi
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '@fontsource-variable/inter';
import '@fontsource-variable/outfit';
import './styles.css';
import './design3.css'; // Design 3.0 qatlami: pastel ranglar, qora pill tugmalar, yon panel
import { startSync } from './lib/account';
import { initPay } from './lib/pay';

import { bootTelegram } from './lib/telegram';
import { pullIfNewer, startCloud } from './lib/cloud';
import { loadRemoteContent } from './content/remote';

// Telegram Mini App bo'lsa — avval Telegram skripti va avtomatik kirish; keyin hisob progressi (boshqa qurilmada yangilangan bo'lsa)
void Promise.all([bootTelegram().then(() => pullIfNewer()), loadRemoteContent()]).finally(() => {
  startSync();
  startCloud();
  void initPay();
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
