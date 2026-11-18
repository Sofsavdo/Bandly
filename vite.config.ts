import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Ilova kodi bitta faylda (til lug'ati yuklangandan keyin bir so'rov bilan keladi); faqat tekshiruv katalogi alohida
  // Ikki fayl: "boot" (React, til tizimi) avval ishlaydi va lug'atni yuklaydi, keyin "app" (butun ilova) — modul darajasidagi
  // matnlar shuning uchun tanlangan tilda hosil bo'ladi. Ko'p mayda fayl bo'lmaydi (so'rovlar soni kam).
  build: { rollupOptions: { output: { manualChunks: (id) => {
    if (id.includes('/src/i18n/catalog.json')) return 'catalog';
    if (/\.css($|\?)/.test(id) || /\/src\/(main\.tsx|i18n\/(index|uz)\.ts|lib\/(cloudBoot|progressMerge|referral)\.ts)$/.test(id) || /node_modules\/(react|react-dom|scheduler|@fontsource|@fontsource-variable)\//.test(id)) return 'boot';
    if (id.includes('/src/') || id.includes('node_modules')) return 'app';
    return undefined;
  } } } },
  server: { proxy: { '/api': 'http://127.0.0.1:3101' } },
  preview: { proxy: { '/api': 'http://127.0.0.1:3101' } },
});
