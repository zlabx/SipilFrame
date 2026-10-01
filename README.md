# SipilFrame

**Analisis struktur 2D online untuk balok, rangka batang (truss), dan portal (frame)** — bagian dari ekosistem [SipilStock](https://sipilstock.com).

SipilFrame adalah turunan (derivative work) dari **[EduBeam](https://github.com/janvorisek/edubeam)** karya **Jan Vorisek**, dan dirilis di bawah lisensi yang sama, **GPL-3.0**.

> ## Atribusi
>
> | | |
> |---|---|
> | Proyek asli | **EduBeam** — <https://github.com/janvorisek/edubeam> |
> | Penulis asli | Jan Vorisek dan kontributor EduBeam |
> | Aplikasi asli | <https://run.edubeam.app> |
> | Dokumentasi asli | <https://edubeam.app> |
> | Lisensi | GPL-3.0 (lihat [`LICENSE`](LICENSE)) |
>
> Seluruh riwayat commit EduBeam dipertahankan di repo ini. Semua kredit atas solver, antarmuka, dan dokumentasi dasar
> menjadi milik penulis asli. Perubahan khusus SipilFrame dicatat di bagian [Perubahan dari upstream](#perubahan-dari-upstream).

---

## Status

- Basis saat ini: **EduBeam v1.2.0**, upstream commit [`ac56926`](https://github.com/janvorisek/edubeam/commit/ac56926) (27 Sep 2026).
- Modifikasi kode sebatas **penonaktifan telemetri upstream** (Sentry), **self-host font** (tanpa Google Fonts), dan satu tautan GitHub; lihat [Perubahan dari upstream](#perubahan-dari-upstream). Solver dan antarmuka tidak diubah; nama dan logo "edubeam" di dalam aplikasi sengaja dibiarkan apa adanya.
- Rilis: **`v1.2.0-sf.1`** (pertama) dan **`v1.2.0-sf.2`** (perbaikan dialog "What's New" saat disajikan dari subfolder). Repo utama mengunci versi build ke salah satu tag ini.
- **Belum dideploy.** Sisa pekerjaan ada di [Checklist sebelum deploy](#checklist-sebelum-deploy) dan [Integrasi dengan SipilStock](#integrasi-dengan-sipilstock).

## Fitur (dari EduBeam)

- Analisis struktur 2D real-time: reaksi tumpuan, perpindahan nodal, dan gaya dalam dihitung ulang setiap ada perubahan.
- Elemen balok Timoshenko dan elemen truss (aksial saja), bisa dicampur dalam satu model.
- Beban titik, beban terdistribusi, perpindahan terprogram / penurunan tumpuan, dan beban temperatur.
- Visualisasi bentuk awal dan deformasi, diagram N-V-M, dan reaksi tumpuan.
- Mode edukasi: tampilan matriks kekakuan, DOF, dan detail solver.
- Berbagi model lewat tautan atau ekspor JSON.
- Antarmuka multibahasa upstream: EN, CS, DE, ES, FR, ZH. (Bahasa Indonesia belum ada.)

Stack: Vue 3, Vite, TypeScript, Pinia, Vuetify. Semua perhitungan berjalan di browser.

## Pengembangan lokal

Butuh Node.js 20.x.

```bash
git clone https://github.com/zlabx/SipilFrame.git
cd SipilFrame
npm install
npm run dev        # dev server Vite (port 3000, lihat vite.config.ts)
npm run test:run   # unit test (Vitest)
npm run lint
```

Build produksi untuk di-host di subfolder `/sipilframe/`:

```bash
VITE_BASE=/sipilframe/ npm run build   # hasil di dist/
```

`VITE_BASE` sudah didukung upstream di `vite.config.ts`, jadi tidak perlu mengubah kode untuk deploy di subfolder.

## Struktur branch dan sinkron dengan upstream

| Branch | Fungsi |
|---|---|
| `upstream` | **Cermin murni** `janvorisek/edubeam` (`dev`). Jangan commit apa pun di sini. |
| `main` | Versi SipilFrame. Ini yang dipakai untuk build/deploy. |

Remote `upstream` menunjuk ke repo EduBeam. Cara mengambil update:

```bash
git remote add upstream https://github.com/janvorisek/edubeam.git   # sekali saja
git fetch upstream

git checkout upstream
git merge --ff-only upstream/dev      # cermin harus selalu fast-forward
git push origin upstream

git checkout main
git merge upstream                    # tinjau hasilnya, jalankan test, lalu push
```

Kalau `README.md` konflik saat merge (upstream ikut mengubahnya), pertahankan versi SipilFrame:
`git checkout --ours README.md && git add README.md`.

### Aturan supaya update tetap murah

- Batasi perubahan di `main`: branding, konfigurasi, dan tautan ke SipilStock. Hindari refactor.
- Setelah merge dari upstream, cari path absolut baru yang tidak memperhitungkan subfolder: `grep -rnE "fetch\(\s*[`'\"]/" src` dan cek `src="/..."` / `url(/...)`. Aplikasi ini disajikan dari `/sipilframe/`, jadi path berawalan `/` harus lewat `import.meta.env.BASE_URL` (lihat `Changelog.vue`).
- Jangan menghapus file upstream yang tidak dipakai (mis. `docs/`); menghapusnya memicu konflik merge di kemudian hari. Cukup jangan di-build.
- Tambahan besar (mis. terjemahan Indonesia) sebaiknya dikirim juga sebagai PR ke upstream agar tidak perlu dirawat sendiri.
- Untuk deploy, kunci ke tag atau commit `main` tertentu, jangan ke `HEAD`, supaya merge upstream yang bermasalah tidak langsung naik ke produksi.

## Perubahan dari upstream

Catat setiap perubahan di sini agar mudah ditinjau saat merge.

| File | Perubahan | Alasan |
|---|---|---|
| `src/main.ts` | DSN Sentry upstream dihapus; `Sentry.init` hanya jalan bila `VITE_SENTRY_DSN` di-set | Mencegah error dan session replay pengguna terkirim ke proyek Sentry pihak lain |
| `vite.config.ts` | `sentryVitePlugin` hanya aktif bila `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` di-set; `sourcemap` jadi `false` bila plugin mati | Upstream meng-hardcode org/project miliknya |
| `.github/dependabot.yml` | Target `main` (bukan `dev`); pembaruan versi dimatikan (`open-pull-requests-limit: 0`), notifikasi keamanan tetap jalan | Branch `dev` tidak ada di repo ini; PR upgrade dependensi membuat `package-lock.json` menyimpang dari upstream sehingga merge EduBeam rawan konflik |
| `.env.example` (baru) | Dokumentasi variabel lingkungan | — |
| `src/plugins/webfontloader.ts` | Font Barlow, Roboto, dan Lobster di-self-host lewat `@fontsource` (subset latin + latin-ext); `loadFonts()` dibiarkan kosong agar `plugins/index.ts` upstream tidak berubah | Tidak ada request ke Google Fonts, jadi IP pengguna tidak terkirim ke Google |
| `src/assets/main.scss` | Baris `@import` Google Fonts dihapus | Idem |
| `package.json`, `package-lock.json` | Tambah `@fontsource/lobster` dan `@fontsource/roboto` (lockfile hanya menambah 2 entri, tanpa mengubah entri lain) | Sumber font lokal |
| `src/App.vue` | Tombol GitHub di app bar menunjuk ke repo ini, bukan repo upstream | Source yang disajikan ada di repo ini; atribusi ke EduBeam ada di README |
| `src/components/dialogs/Changelog.vue` | Path `/changelog/...` (JSON dan gambar/video di dalamnya) diberi `import.meta.env.BASE_URL`; tidak berefek bila base `/` | Dari subfolder `/sipilframe/`, path absolut menunjuk ke root situs sehingga dialog "What's New" menampilkan "Missing base changelog" dan gambarnya rusak |
| `README.md` | Diganti | Atribusi dan panduan SipilFrame |

Hasil build tanpa env apa pun sudah diverifikasi: tidak ada DSN atau host Sentry di `dist/`, tidak ada source map, dan library Sentry ikut ter-tree-shake. Dengan `VITE_SENTRY_DSN` di-set, Sentry aktif kembali dengan DSN tersebut.

Verifikasi runtime (Chromium headless, build `/sipilframe/`): aplikasi hanya menghubungi host asalnya sendiri (nol request ke domain lain), font Barlow dan Lobster termuat dari file lokal, dan model contoh langsung terhitung. Subset cyrillic, greek, dan vietnamese tidak disertakan; teks di luar latin/latin-ext memakai font sans-serif sistem.

## Checklist sebelum deploy

Hasil audit awal. Yang sudah dikerjakan ditandai centang.

- [x] **Sentry milik upstream** dinonaktifkan (lihat tabel di atas). Kalau nanti ingin memakai monitoring sendiri, isi `VITE_SENTRY_DSN` dengan DSN proyek sendiri, dan **pertimbangkan** mengubah `maskAllText: false` dan `blockAllMedia: false` pada session replay di `src/main.ts` menjadi `true`. Perbarui Kebijakan Privasi SipilStock bila monitoring diaktifkan.
- [x] **`sentryVitePlugin`** tidak lagi menunjuk ke org/project upstream.
- [x] **`.github/dependabot.yml`** disesuaikan ke branch `main`, dan pembaruan versi dimatikan. Dependensi dinaikkan lewat merge dari upstream; kerentanan keamanan tetap dilaporkan Dependabot.
- [x] **Google Analytics** hanya aktif jika `VITE_GANALYTICS_TAG_ID` diisi; biarkan kosong kecuali memang dipakai.
- [x] **Google Fonts** di-self-host (lihat tabel di atas). Sekarang tidak ada request ke pihak ketiga, sehingga tidak perlu menyebut Google di Kebijakan Privasi.
- [x] **Atribusi dan source.** Tombol GitHub di aplikasi menunjuk ke repo ini, yang README-nya memuat atribusi EduBeam (Jan Vorisek, GPL-3.0). Tautan "Documentation" tetap ke dokumentasi asli (`edubeam.app`).
- [x] **Branding "edubeam"** di dalam aplikasi sengaja tidak diubah (keputusan: apa adanya).
- [ ] **`.github/FUNDING.yml`** masih menunjuk ke sponsor upstream. Sengaja dibiarkan agar dukungan mengalir ke penulis asli; ganti bila tidak diinginkan.

## Integrasi dengan SipilStock

Direncanakan: repo utama [`zlabx/zlabx`](https://github.com/zlabx/zlabx) (privat) akan meng-clone repo ini pada **tag tertentu** (mis. `v1.2.0-sf.1`, bukan `main`) saat build Cloudflare Pages, menjalankan `VITE_BASE=/sipilframe/ npm run build`, lalu menyalin `dist/` ke `sipilframe/`, dengan pola yang sama seperti SipilCAD. Karena repo ini publik, tidak diperlukan token untuk clone.

## Lisensi

[GNU General Public License v3.0](LICENSE). Copyright pada kode EduBeam dimiliki penulis aslinya; modifikasi SipilFrame dirilis di bawah lisensi yang sama. Kode sumber lengkap tersedia di repo ini untuk siapa pun yang menggunakan SipilFrame.
