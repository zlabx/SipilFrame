# SipilFrame

Analisis struktur 2D (balok, rangka batang, dan portal) yang berjalan di browser.

**SipilFrame adalah versi modifikasi dari [EduBeam](https://github.com/janvorisek/edubeam) karya Jan Vorisek dan kontributor EduBeam**, dirilis di bawah **GNU General Public License v3.0** (lihat [`LICENSE`](LICENSE)). Seluruh riwayat commit EduBeam dipertahankan di repo ini.

**Pemberitahuan modifikasi (GPL-3.0 §5a):** dasar kode adalah EduBeam v1.2.0 (upstream commit `ac56926`, 27 September 2026). Repo ini dimodifikasi oleh zlabx sejak 29 September 2026. Ringkasan perubahan: penggantian merek (nama, ikon, dan tampilan), penonaktifan telemetri, font yang dihosting sendiri, dan penyesuaian antarmuka. Setiap perubahan beserta tanggalnya tercatat di riwayat commit dan tag rilis (`v1.2.0-sf.N`).

**Kode sumber:** repo ini adalah kode sumber lengkap untuk versi yang berjalan di <https://sipilstock.com/sipilframe/>. Tag rilis menunjuk ke versi persis yang tersaji.

**Build:** Node.js 20 atau lebih baru, lalu `npm ci` dan `VITE_BASE=/sipilframe/ npm run build` (hasil di `dist/`).
