# KosKita — Manajemen Kamar Kos

**Proyek UTS Pemrograman Web | Sistem Informasi Manajemen Kos**

- **Nama Mahasiswa  :** Farhan Bagas Firmansyah
- **NIM             :** 25091397039
- **Kelompok        :** B08
- **Mata Kuliah     :** Pemrograman Web
- **Jenis Tugas     :** Ujian Tengah Semester (UTS)

## Deskripsi proyek

**KosKita** adalah website simulasi untuk membantu pemilik kos mengelola informasi kamar pada beberapa tempat kos. Pengguna dapat melihat ringkasan jumlah kamar, memilih kos untuk menampilkan kamar yang sesuai, menambahkan kamar, mencari dan menyaring kamar berdasarkan status, serta memperbarui status kamar dari daftar.

Website ini merupakan **bagian Manajemen Kamar** dari proposal Sistem Informasi Manajemen Kos Kelompok 8. Modul Farhan berbeda dari modul **Manajemen Informasi Kos** (Dava) dan **Ulasan/Pelaporan Kos** (Gerald).

## Teknologi

- **HTML5:** kerangka halaman utama dan konten setiap menu.
- **CSS3 murni:** desain dashboard, tabel, form, dan tampilan responsif. **Tidak memakai Bootstrap atau Tailwind.**
- **JavaScript murni (vanilla JS):** navigasi Ajax dengan `fetch()`, perubahan tampilan DOM, pencarian/filter, validasi form, tambah kamar, dan ubah status. **Tidak memakai jQuery.**
- **Web Storage (`localStorage`):** menyimpan perubahan kamar di browser pengguna.

**Versi ini tidak memakai PHP, folder `api`, MySQL, atau backend server untuk menyimpan data.** Apache di XAMPP hanya digunakan sebagai server HTTP untuk menyajikan file HTML/CSS/JS agar pemuatan halaman dengan `fetch()` berjalan.

## Struktur folder

```text
PWUTS_B08_25091397039/
├── index.html               # Homepage dan layout utama
├── README.md                # Dokumentasi project ini
├── assets/
│   ├── css/
│   │   └── style.css        # Gaya CSS tanpa framework
│   └── js/
│       └── app.js           # Navigasi Ajax, data, dan logika kamar
└── pages/
    ├── beranda.html         # Dashboard
    ├── kamar.html           # Daftar kamar dan edit status
    └── tambah-kamar.html    # Form tambah kamar
```

## Fitur website

### 1. Dashboard — item 2.a

- Layout halaman utama (`index.html`) dengan sidebar dan navigasi responsif.
- Menampilkan total kamar serta jumlah kamar berstatus **Tersedia, Terisi, dan Perbaikan**.
- Ringkasan dihitung dari data kamar yang ada di browser, bukan angka gambar/statis.
- Navigasi ke halaman konten menggunakan **Ajax melalui `fetch()`**, sehingga layout utama tidak dimuat ulang.

### 2. Daftar Kamar — item 2.b

- Memilih nama kos **terlebih dahulu** sebelum daftar kamar ditampilkan.
- Pilihan kos: **Kos Mawar, Kos Melati, Kos Anggrek, dan Kos Kenanga** (data demonstrasi).
- Menampilkan hanya kamar yang terdaftar di kos terpilih.
- Mencari kamar berdasarkan nomor dan memfilter status.
- Mengubah status kamar menjadi **Tersedia / Terisi / Perbaikan** menggunakan pilihan status dan tombol **Simpan** di baris kamar.
- Pilihan kos dapat dipertahankan ketika halaman Daftar Kamar di-refresh melalui parameter URL `kos`.

### 3. Tambah Kamar — item 2.c

Form berisi:

1. **Nama kos** (wajib dipilih).
2. **Nomor kamar** (wajib diisi; unik di dalam kos yang sama).
3. **Harga sewa per bulan** (bilangan bulat positif).

Validasi menggunakan JavaScript. Saat berhasil disimpan, **status kamar baru otomatis Tersedia**, lalu pengguna diarahkan ke Daftar Kamar pada kos yang dipilih. Perubahan akan tersimpan di browser yang sama.

> **Batasan terhadap soal UTS 2.c:** Versi frontend-only ini menggunakan `localStorage` sehingga **tidak mengirim form dengan HTTP POST ke server**. Soal UTS menyebutkan pengiriman form ke server HTTP. Artinya, poin tersebut **belum sepenuhnya terpenuhi** pada versi tanpa backend ini. Untuk memenuhi syarat pengiriman HTTP diperlukan backend/endpoint penerima, misalnya PHP atau Node.js.

## Cara menjalankan dengan XAMPP

1. Jadikan file 1 folder lalu taruh folder itu ke `C:\xampp\htdocs\`.
2. Buka XAMPP Control Panel dan jalankan **Apache**. **MySQL tidak perlu dinyalakan.**
3. Buka browser dan kunjungi:
   http://localhost/(NAMA FOLDER)/

**Jangan jalankan `index.html` dengan mengklik file secara langsung (`file://`)**, karena navigasi Ajax dengan `fetch()` memerlukan alamat HTTP.

## Cara menguji fitur

1. **Dashboard:** periksa statistik kamar yang tampil.
2. **Daftar Kamar:** pilih **Kos Melati**; seharusnya hanya kamar Melati yang tampil.
3. **Tambah Kamar:** pilih Kos Melati, isi nomor misalnya `M-999`, lalu harga `650000`; klik **Simpan Kamar**.
4. **Daftar Kamar:** kamar `M-999` seharusnya muncul pada Kos Melati dengan status **Tersedia**.
5. Ubah status `M-999` ke **Terisi**, kemudian klik **Simpan**.
6. Refresh halaman dan buka lagi Kos Melati; status yang dipilih seharusnya tetap tersimpan.
7. Coba nomor kamar yang sama pada kos yang sama; form seharusnya menampilkan validasi duplikat.

## Cara kerja penyimpanan data

- Data awal terdiri atas **4 kos dan 15 kamar contoh**, didefinisikan di `assets/js/app.js`.
- Saat pertama dibuka, data kamar awal disalin ke `localStorage` menggunakan kunci:

  ```text
  kosKitaFarhan.kamar.v1
  ```

- Penambahan kamar dan perubahan status disimpan kembali ke kunci tersebut.
- Data tersimpan **hanya pada browser dan origin/alamat situs yang sama**. Data tidak tersinkron ke laptop, browser, atau akun GitHub lain.
- Menghapus data situs atau penyimpanan browser dapat menghapus perubahan; membuka `localhost` dan `127.0.0.1` dapat menggunakan penyimpanan berbeda.
- Belum tersedia login/autentikasi asli maupun database terpusat.

## Kesesuaian dengan tugas UTS

| Ketentuan UTS | Implementasi | Keterangan |
|---|---|---|
| 2.a Homepage, responsif, HTML/CSS/JS | `index.html`, `assets/css/style.css`, `assets/js/app.js` | Ada |
| 2.a Navigasi Ajax | `fetch()` halaman dari folder `pages` | Ada |
| 2.b Minimal 1 halaman konten interaktif | `pages/kamar.html`, pencarian/filter/status | Ada |
| 2.c Form dan validasi JavaScript | `pages/tambah-kamar.html` | Ada |
| 2.c Submit ke server HTTP | Penyimpanan hanya lewat `localStorage` | **Belum terpenuhi karena backend belum dibuat** |
| 2.d Individu, pekerjaan tidak sama | Fokus modul Manajemen Kamar | Sesuai pembagian yang direncanakan; pastikan disepakati kelompok |
| 2.e README | `README.md` ini | Ada |
| Larangan Bootstrap dari dosen | Menggunakan CSS murni | Tidak memakai Bootstrap |

## Troubleshooting

- **404 Not Found:** periksa nama folder dalam `C:\xampp\htdocs` dan pastikan `index.html` ada tepat di dalamnya.
- **Konten halaman tidak muncul:** jalankan Apache, lalu akses melalui `http://localhost/...`, bukan `file://`.
- **Kamar baru tidak terlihat:** pastikan nama kos yang dipilih di Daftar Kamar sama dengan yang dipilih pada form Tambah Kamar; periksa juga filter status/pencarian.
- **Data terasa hilang:** pastikan browser dan alamat (`localhost` atau `127.0.0.1`) yang dipakai tidak berubah, dan data situs belum dibersihkan.
- **CSS tidak muncul pada grafik Languages GitHub:** stylesheet tetap dapat bekerja. File `.gitattributes` membantu mengatur pengenalan bahasa, tetapi grafik GitHub bukan bukti berfungsi atau tidaknya CSS.

---