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
- **Belum ada modifikasi kode.** Isi repo ini masih identik dengan upstream, selain `README.md` ini.
- **Belum dideploy.** Baca [Checklist sebelum deploy](#checklist-sebelum-deploy) dulu.

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
- Jangan menghapus file upstream yang tidak dipakai (mis. `docs/`); menghapusnya memicu konflik merge di kemudian hari. Cukup jangan di-build.
- Tambahan besar (mis. terjemahan Indonesia) sebaiknya dikirim juga sebagai PR ke upstream agar tidak perlu dirawat sendiri.
- Untuk deploy, kunci ke tag atau commit `main` tertentu, jangan ke `HEAD`, supaya merge upstream yang bermasalah tidak langsung naik ke produksi.

## Perubahan dari upstream

Belum ada. Catat setiap perubahan di sini agar mudah ditinjau saat merge.

## Checklist sebelum deploy

Temuan dari audit awal — **jangan dideploy ke sipilstock.com sebelum ini beres**:

- [ ] **Sentry.** `src/main.ts` menginisialisasi Sentry dengan **DSN milik upstream** pada build produksi, dengan session replay (`maskAllText: false`) dan `tracesSampleRate: 1.0`. Jika dideploy apa adanya, laporan error dan rekaman sesi pengguna SipilStock akan terkirim ke proyek Sentry milik upstream. Nonaktifkan, atau ganti dengan DSN milik sendiri yang dibaca dari env var, dan perbarui Kebijakan Privasi bila memakai analytics/monitoring.
- [ ] **`sentryVitePlugin`** di `vite.config.ts` (org/project upstream). Hapus atau nonaktifkan agar build tidak mencoba mengunggah source map ke proyek upstream.
- [ ] **Google Analytics.** Hanya aktif jika `VITE_GANALYTICS_TAG_ID` diisi. Biarkan kosong kecuali memang dipakai.
- [ ] **`.github/dependabot.yml`** menargetkan branch `dev` yang tidak ada di repo ini (bisa memicu PR bertumpuk / error). Sesuaikan target atau nonaktifkan.
- [ ] **`.github/FUNDING.yml`** masih menunjuk ke sponsor upstream. Biarkan jika ingin mengarahkan dukungan ke penulis asli, atau ganti.
- [ ] **Halaman "Tentang/Lisensi"** di dalam aplikasi: sebut EduBeam oleh Jan Vorisek, lisensi GPL-3.0, dan tautan ke repo ini.
- [ ] Ganti branding dan tautan (`README`, judul halaman, ikon PWA, `https://edubeam.app`, `run.edubeam.app`) sesuai kebutuhan, dan tetap sertakan atribusi.

## Integrasi dengan SipilStock

Direncanakan: repo utama [`zlabx/zlabx`](https://github.com/zlabx/zlabx) (privat) akan meng-clone repo ini saat build Cloudflare Pages, menjalankan `VITE_BASE=/sipilframe/ npm run build`, lalu menyalin `dist/` ke `sipilframe/`, dengan pola yang sama seperti SipilCAD. Karena repo ini publik, tidak diperlukan token untuk clone.

## Lisensi

[GNU General Public License v3.0](LICENSE). Copyright pada kode EduBeam dimiliki penulis aslinya; modifikasi SipilFrame dirilis di bawah lisensi yang sama. Kode sumber lengkap tersedia di repo ini untuk siapa pun yang menggunakan SipilFrame.
