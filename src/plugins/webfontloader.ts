/**
 * plugins/webfontloader.ts
 *
 * SipilFrame: font di-self-host lewat @fontsource (subset latin + latin-ext), bukan dimuat dari
 * Google Fonts saat runtime, sehingga aplikasi tidak mengirim request/IP pengguna ke Google.
 * Bobot sama dengan yang sebelumnya diminta ke Google: Barlow 300/400/500/700, Roboto
 * 100/300/400/500/700/900, Lobster 400. Subset lain (cyrillic, greek, vietnamese) tidak
 * disertakan; teks di luar latin/latin-ext memakai font sans-serif sistem.
 *
 * `loadFonts` dipertahankan (kosong) agar plugins/index.ts dari upstream tidak perlu diubah,
 * sehingga merge dari EduBeam tetap mudah.
 */
import '@fontsource/barlow/latin-300.css';
import '@fontsource/barlow/latin-ext-300.css';
import '@fontsource/barlow/latin-400.css';
import '@fontsource/barlow/latin-ext-400.css';
import '@fontsource/barlow/latin-500.css';
import '@fontsource/barlow/latin-ext-500.css';
import '@fontsource/barlow/latin-700.css';
import '@fontsource/barlow/latin-ext-700.css';
import '@fontsource/roboto/latin-100.css';
import '@fontsource/roboto/latin-ext-100.css';
import '@fontsource/roboto/latin-300.css';
import '@fontsource/roboto/latin-ext-300.css';
import '@fontsource/roboto/latin-400.css';
import '@fontsource/roboto/latin-ext-400.css';
import '@fontsource/roboto/latin-500.css';
import '@fontsource/roboto/latin-ext-500.css';
import '@fontsource/roboto/latin-700.css';
import '@fontsource/roboto/latin-ext-700.css';
import '@fontsource/roboto/latin-900.css';
import '@fontsource/roboto/latin-ext-900.css';
import '@fontsource/lobster/latin-400.css';
import '@fontsource/lobster/latin-ext-400.css';

export function loadFonts() {
  // no-op: font sudah di-bundle oleh import di atas.
}
