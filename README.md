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
- Modifikasi kode: **penonaktifan telemetri upstream** (Sentry), **self-host font** (tanpa Google Fonts), satu tautan GitHub, perbaikan path subfolder, dan **rebranding bertahap ke SipilFrame** (tahap 1–3 selesai: judul tab, ikon, manifest PWA, pratinjau tautan, logo app bar, judul dialog selamat datang, nama file unduhan, dan footer menu samping; lihat [Rebranding](#rebranding-ke-sipilframe-bertahap)). Solver tidak diubah.
- Rilis: **`v1.2.0-sf.1`** (pertama), **`v1.2.0-sf.2`** (perbaikan dialog "What's New" saat disajikan dari subfolder), **`v1.2.0-sf.3`** (rebranding tahap 1), **`v1.2.0-sf.4`** (rebranding tahap 2), **`v1.2.0-sf.5`** (rebranding tahap 3), **`v1.2.0-sf.6`** (tombol "What's New?" dan "Documentation" disembunyikan), **`v1.2.0-sf.7`** (tombol GitHub di app bar disembunyikan), dan **`v1.2.0-sf.8`** (tombol Clear mesh dan Share model menjadi ikon saja). Repo utama mengunci versi build ke salah satu tag ini.
- **Sudah live** di <https://sipilstock.com/sipilframe/>. Versi yang tayang selalu sama dengan `SIPILFRAME_REF` di repo utama dan terlihat di `/sipilframe/SOURCE.txt`; cara menaikkannya ada di [Cara rilis](#cara-rilis-naik-versi-di-produksi).
- Item [checklist](#checklist-sebelum-deploy) yang tersisa hanya `FUNDING.yml` (sengaja dibiarkan).

## Fitur (dari EduBeam)

- Analisis struktur 2D real-time: reaksi tumpuan, perpindahan nodal, dan gaya dalam dihitung ulang setiap ada perubahan.
- Elemen balok Timoshenko dan elemen truss (aksial saja), bisa dicampur dalam satu model.
- Beban titik, beban terdistribusi, perpindahan terprogram / penurunan tumpuan, dan beban temperatur.
- Visualisasi bentuk awal dan deformasi, diagram N-V-M, dan reaksi tumpuan.
- Mode edukasi: tampilan matriks kekakuan, DOF, dan detail solver.
- Berbagi model lewat tautan atau ekspor JSON.
- Antarmuka multibahasa upstream: 11 bahasa (`cn`, `cs`, `de`, `en`, `es`, `fr`, `pl`, `pt`, `ru`, `th`, `uk`). Bahasa Indonesia tidak ditambahkan (keputusan: tidak diperlukan; lihat [Rebranding](#rebranding-ke-sipilframe-bertahap)).

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
- Tambahan besar (mis. bahasa baru) sebaiknya dikirim juga sebagai PR ke upstream agar tidak perlu dirawat sendiri.
- Untuk deploy, kunci ke tag atau commit `main` tertentu, jangan ke `HEAD`, supaya merge upstream yang bermasalah tidak langsung naik ke produksi.

## Cara rilis (naik versi di produksi)

Produksi **tidak mengikuti `main`** repo ini. Repo utama ([`zlabx/zlabx`](https://github.com/zlabx/zlabx)) meng-clone **tag tertentu**, dan Cloudflare Pages tidak terhubung ke repo ini. Jadi push ke sini tidak mengubah situs; perubahan baru tayang setelah **tag dibuat** *dan* **repo utama dinaikkan**. Ini berlaku sama untuk perbaikan bug, perubahan kecil, fitur, maupun merge dari upstream.

1. **Kerjakan di `main`** dan uji: `npm run test:run`, `npm run lint`, lalu build untuk subfolder (`VITE_BASE=/sipilframe/ npm run build`). Beberapa perubahan boleh dikumpulkan; satu tag cukup untuk semuanya.
2. **Perbarui README ini**: baris "Rilis" di bagian [Status](#status) dan tabel [Perubahan dari upstream](#perubahan-dari-upstream).
3. **Buat dan push tag baru:**
   ```bash
   git tag -a v1.2.0-sf.3 -m "Ringkasan perubahan"
   git push origin main v1.2.0-sf.3
   ```
4. **Naikkan repo utama:** `git pull` di `zlabx/zlabx`, ganti nilai bawaan `SIPILFRAME_REF` di `scripts/build-sipilframe.sh` ke tag baru, lalu push ke `main`. Push inilah yang memicu deploy produksi (sekitar 1–1,5 menit).
5. **Cek hasilnya:** `https://sipilstock.com/sipilframe/SOURCE.txt` harus menyebut tag dan commit baru. Buka lewat konsol (`fetch('/sipilframe/SOURCE.txt').then(r=>r.text()).then(console.log)`) atau jendela private, karena service worker PWA bisa menjawab navigasi langsung dengan halaman aplikasi.

**Penamaan tag:** `v<versi EduBeam basis>-sf.<N>`. Naikkan `N` tiap rilis (`sf.3`, `sf.4`, ...). Setelah menarik versi EduBeam baru, mulai lagi dari 1 (mis. `v1.3.0-sf.1`).

**Aturan**
- **Jangan memindahkan atau menimpa tag yang sudah di-push.** Selalu buat tag baru.
- **Jangan menghapus tag yang pernah tersaji ke pengguna.** Itu titik rollback dan jejak source untuk kewajiban GPL.
- **Rollback:** kembalikan `SIPILFRAME_REF` di repo utama ke tag sebelumnya, lalu push.
- Perubahan yang cuma menyentuh dokumentasi (seperti README ini) tidak perlu tag baru.

**Opsional, belum dicoba di Pages kami:** untuk melihat perubahan di preview sebelum membuat tag, isi env var `SIPILFRAME_REF=main` hanya pada environment **Preview** di Cloudflare Pages. Build preview (push ke branch non-produksi di repo utama) lalu memakai `main` repo ini, sementara produksi tetap terkunci ke tag. Kosongkan lagi setelah selesai, karena selama terisi preview tidak mengunci ke tag.

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
| `index.html` | Judul, deskripsi, `canonical`, dan tag `og:*`/`twitter:*` memakai identitas SipilFrame (`sipilstock.com/sipilframe/`); tidak lagi menunjuk ke `edubeam.app` | Tab dan pratinjau tautan menampilkan SipilFrame, bukan EduBeam |
| `public/favicon.ico`, `apple-touch-icon.png`, `pwa-192.png`, `pwa-512.png`, `pwa-maskable-512.png` | Diganti ikon SipilFrame (hijau). Versi iOS dan maskable berlatar penuh; maskable diperkecil ke zona aman lingkaran 40% | Identitas visual |
| `public/og-image.png` (baru) | Gambar pratinjau tautan 1200×630 (118 KB) | Pratinjau di WhatsApp dan media sosial |
| `vite.config.ts` (manifest PWA) | `name`, `short_name`, dan `description` menjadi SipilFrame; `theme_color` tetap `#111133` | Nama saat aplikasi dipasang |
| `src/App.vue` (logo) | Teks logo app bar "edubeam" menjadi "SipilFrame" (gaya Lobster tetap lewat kelas `.app-title`) | Identitas di UI |
| `src/locales/*.json` (11 file) | Judul dialog selamat datang memakai "SipilFrame" (nama kelas `.edubeam` pada `<span>` dipertahankan); di `cs.json` ditambah deskripsi panel ("Ústředí SipilFrame") | Identitas di UI semua bahasa |
| `src/components/dialogs/ExportImage.vue`, `src/utils/exportResults.ts` | Nama file unduhan: `sipilframe-<lebar>x<tinggi>.png`/`.svg` dan `sipilframe-results.csv` | Berkas yang diunduh pengguna |
| `vite.config.ts`, `src/vite-env.d.ts` | Nilai build baru `APP_SF_TAG` dari `git describe --tags --exact-match HEAD` (kosong bila build bukan dari tag) | Footer menampilkan tag rilis yang sebenarnya berjalan |
| `src/App.vue` (footer menu samping) | Footer memuat `SipilFrame <tag>`, `EduBeam v<versi> · Jan Vorisek`, tanggal dan commit build, serta tautan `GPL-3.0` dan `GitHub` yang menunjuk ke tag yang sedang berjalan; tanpa kunci terjemahan baru | Atribusi terlihat di dalam aplikasi dan jejak source persis untuk GPL |
| `src/App.vue` (flag `showUpstreamLinks`) | Flag `showUpstreamLinks = false` menyembunyikan tombol "What's New?" dan "Documentation" di app bar (`v-if`) dan mematikan popup changelog otomatis (`maybeShowChangelog`). Kode dialog dan tautan tetap ada; ubah flag ke `true` untuk menampilkannya lagi | Changelog dan situs docs milik EduBeam; popup otomatis menampilkan catatan rilis EduBeam kepada pengguna SipilFrame |
| `src/App.vue` (flag `showGithubButton`) | Flag `showGithubButton = false` menyembunyikan tombol ikon GitHub di app bar (`v-if`). Tautan source tetap ada di footer menu samping (`GPL-3.0` dan `GitHub` ke tag yang berjalan), sehingga kewajiban menyediakan source tetap terpenuhi | App bar lebih bersih; flag terpisah dari `showUpstreamLinks` karena tautannya ke repo ini, bukan ke upstream |
| `src/App.vue` (tombol Clear mesh dan Share model) | Dijadikan tombol ikon saja (`icon`), dengan `aria-label` dan tooltip (`v-tooltip`, `location: 'bottom'`) yang memakai kunci terjemahan yang sudah ada (`common.clearMesh`, `common.shareModel`); tidak ada kunci baru. Kedua aksi tetap ada dengan teks di menu hamburger | App bar lebih ringkas; label tetap tersedia untuk pembaca layar dan saat hover |
| `README.md` | Diganti | Atribusi dan panduan SipilFrame |

Hasil build tanpa env apa pun sudah diverifikasi: tidak ada DSN atau host Sentry di `dist/`, tidak ada source map, dan library Sentry ikut ter-tree-shake. Dengan `VITE_SENTRY_DSN` di-set, Sentry aktif kembali dengan DSN tersebut.

Verifikasi runtime (Chromium headless, build `/sipilframe/`): aplikasi hanya menghubungi host asalnya sendiri (nol request ke domain lain), font Barlow dan Lobster termuat dari file lokal, dan model contoh langsung terhitung. Subset cyrillic, greek, dan vietnamese tidak disertakan; teks di luar latin/latin-ext memakai font sans-serif sistem.

## Rebranding ke SipilFrame (bertahap)

- [x] **Tahap 1 (`sf.3`)**: judul tab, ikon (favicon, iOS, PWA, maskable), manifest PWA, deskripsi, `canonical`, dan gambar pratinjau tautan.
- [x] **Tahap 2 (`sf.4`)**: logo "edubeam" di app bar, judul dialog selamat datang di 11 file bahasa, dan nama file unduhan (`sipilframe-*.png`, `.svg`, `.csv`). Nama kelas CSS `.edubeam` dipertahankan (hanya gaya) agar merge dari upstream ringan.
- [x] **Tahap 3 (`sf.5`)**: footer di menu samping (ikon hamburger) menampilkan `SipilFrame <tag>`, `EduBeam v<versi> · Jan Vorisek`, tanggal dan commit build, serta tautan `GPL-3.0` dan `GitHub` ke tag yang sedang berjalan. Build yang bukan dari tag menampilkan `dev`.
- [x] **Tahap 4 (bahasa Indonesia): dibatalkan.** Tidak diperlukan; antarmuka tetap memakai 11 bahasa bawaan upstream. Rebranding dianggap selesai di tahap 3 (`sf.5`).

**Temuan yang belum ditangani:**
- Toolbar melebar melewati layar pada lebar 600–767 px adalah masalah bawaan upstream. Sejak `sf.6` tidak lagi terjadi karena tombol "What's New?" dan "Documentation" disembunyikan; bila `showUpstreamLinks` diaktifkan kembali, masalahnya muncul lagi (perbaikan sederhana: sembunyikan label tombol sampai breakpoint `md`).
- `suggestLanguage()` (`src/utils/index.ts`) mencocokkan `navigator.languages` secara persis dengan kode bahasa, jadi `cs-CZ` tidak otomatis memilih `cs`. Bawaan upstream dan tidak diubah; bahasa bisa dipilih lewat `?lang=<kode>` atau pemilih bahasa di Settings. Perlu diperhatikan bila suatu hari menambah bahasa.

**Catatan:** ikon bantuan "?" di dalam aplikasi tetap menautkan ke dokumentasi di `edubeam.app` (lewat `src/utils/docs.ts`), dan footer tetap memuat atribusi EduBeam, lisensi, dan source.

**Sengaja tidak diubah:** `APP_VERSION` (tetap versi EduBeam, 1.2.0; dipakai logika changelog dan tersimpan di berkas model), penanda `edubeam: true` di data model (bagian format berkas sesi, demi pertukaran dengan EduBeam asli), tautan dokumentasi ke `edubeam.app` beserta `utm_source`, nama paket di `package.json`, folder `docs/`, dan atribusi di README serta LICENSE.

## Checklist sebelum deploy

Hasil audit awal. Yang sudah dikerjakan ditandai centang.

- [x] **Sentry milik upstream** dinonaktifkan (lihat tabel di atas). Kalau nanti ingin memakai monitoring sendiri, isi `VITE_SENTRY_DSN` dengan DSN proyek sendiri, dan **pertimbangkan** mengubah `maskAllText: false` dan `blockAllMedia: false` pada session replay di `src/main.ts` menjadi `true`. Perbarui Kebijakan Privasi SipilStock bila monitoring diaktifkan.
- [x] **`sentryVitePlugin`** tidak lagi menunjuk ke org/project upstream.
- [x] **`.github/dependabot.yml`** disesuaikan ke branch `main`, dan pembaruan versi dimatikan. Dependensi dinaikkan lewat merge dari upstream; kerentanan keamanan tetap dilaporkan Dependabot.
- [x] **Google Analytics** hanya aktif jika `VITE_GANALYTICS_TAG_ID` diisi; biarkan kosong kecuali memang dipakai.
- [x] **Google Fonts** di-self-host (lihat tabel di atas). Sekarang tidak ada request ke pihak ketiga, sehingga tidak perlu menyebut Google di Kebijakan Privasi.
- [x] **Atribusi dan source.** Tombol GitHub di aplikasi menunjuk ke repo ini, yang README-nya memuat atribusi EduBeam (Jan Vorisek, GPL-3.0). Tautan "Documentation" tetap ke dokumentasi asli (`edubeam.app`).
- [x] **Branding tab, ikon, PWA, pratinjau tautan, logo app bar, dan judul selamat datang** sudah SipilFrame (tahap 1–3). Footer menu samping memuat tag SipilFrame, atribusi EduBeam, lisensi, dan tautan source.
- [ ] **`.github/FUNDING.yml`** masih menunjuk ke sponsor upstream. Sengaja dibiarkan agar dukungan mengalir ke penulis asli; ganti bila tidak diinginkan.

## Integrasi dengan SipilStock

**Aktif.** Repo utama [`zlabx/zlabx`](https://github.com/zlabx/zlabx) (privat) membangun repo ini saat build Cloudflare Pages: `scripts/build-sipilframe.sh` meng-clone **tag tertentu** (nilai `SIPILFRAME_REF`, bukan `main`), menjalankan `VITE_BASE=/sipilframe/ npm run build`, lalu menyalin `dist/` (ditambah `LICENSE` dan `SOURCE.txt` berisi repo, tag, dan commit) ke folder `sipilframe/`. Folder itu di-gitignore di repo utama dan dibuat ulang tiap deploy. Hasilnya tersaji di <https://sipilstock.com/sipilframe/>. Karena repo ini publik, clone tidak butuh token.

Aplikasi ini disajikan dari subfolder, jadi path berawalan `/` harus lewat `import.meta.env.BASE_URL` (lihat bagian [Aturan](#aturan-supaya-update-tetap-murah)).

## Lisensi

[GNU General Public License v3.0](LICENSE). Copyright pada kode EduBeam dimiliki penulis aslinya; modifikasi SipilFrame dirilis di bawah lisensi yang sama. Kode sumber lengkap tersedia di repo ini untuk siapa pun yang menggunakan SipilFrame.
