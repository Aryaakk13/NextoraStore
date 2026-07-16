# NextoraSMP Store — Panduan Menuju Launching

File `index.html` dan `style.css` kamu **tidak perlu diubah** — hanya `script.js` yang diganti (sudah saya perbarui), plus ada backend baru di folder `worker/`.

## Apa yang berubah dari versi lama

| Sebelumnya (demo) | Sekarang (production) |
|---|---|
| Discord Webhook URL tertulis langsung di `script.js` (bisa dicuri lewat View Source) | Webhook disimpan sebagai *secret* di server (Cloudflare Worker), tidak pernah dikirim ke browser |
| Leaderboard = array nama fiktif (ZephyrDrake, dll) | Leaderboard diambil dari API (`CONFIG.leaderboardApiUrl`) yang kamu isi sendiri dari data server asli |
| QRIS memakai gambar milik "ARVIE STORE" | Placeholder `GANTI_URL_GAMBAR_QRIS_MILIK_ANDA` — **wajib** diganti QRIS milikmu sendiri |
| Nomor e-wallet contoh | Placeholder `GANTI_NOMOR_EWALLET_ANDA` |
| Tidak ada peringatan kalau lupa isi konfigurasi | Ada banner merah otomatis di situs kalau ada `CONFIG` yang belum diisi |

## Langkah 1 — Deploy backend (Cloudflare Worker, gratis)

```bash
npm install -g wrangler
wrangler login

cd worker
wrangler kv namespace create ORDERS
wrangler kv namespace create LEADERBOARD
# copy "id" yang muncul ke wrangler.toml (dua tempat: binding ORDERS & LEADERBOARD)

wrangler secret put DISCORD_WEBHOOK_URL
# tempel webhook Discord kamu (Server Settings > Integrations > Webhooks)

wrangler secret put ADMIN_TOKEN
# buat token acak sendiri (mis. hasil dari `openssl rand -hex 24`) — dipakai
# untuk push data leaderboard asli, JANGAN dibagikan ke siapa pun

wrangler deploy
```

Setelah deploy, kamu akan dapat URL seperti:
`https://nextorasmp-api.<subdomainmu>.workers.dev`

## Langkah 2 — Isi CONFIG di `script.js`

Buka `script.js`, ganti semua nilai yang berawalan `GANTI_`:

```js
const CONFIG = {
  serverIp: 'play.nextorasmp.my.id',
  walletNumber: '08xx-xxxx-xxxx',              // nomor e-wallet ASLI kamu
  walletOwner: 'Nama sesuai rekening',
  qrisImage: 'https://...qris-punya-kamu.png', // QRIS statis MILIK KAMU
  qrisMerchant: 'Nama merchant QRIS kamu',
  orderApiUrl: 'https://nextorasmp-api.<subdomainmu>.workers.dev/api/order',
  leaderboardApiUrl: 'https://nextorasmp-api.<subdomainmu>.workers.dev/api/leaderboard',
};
```

Selama masih ada nilai `GANTI_...`, situs akan menampilkan banner merah peringatan otomatis — supaya kamu tidak lupa dan tidak sadar menerima pembayaran dengan data yang salah.

## Langkah 3 — Isi leaderboard dengan data ASLI

Leaderboard tidak lagi hardcode. Kamu kirim data asli lewat:

```bash
curl -X POST https://nextorasmp-api.<subdomainmu>.workers.dev/api/leaderboard \
  -H "X-Admin-Token: TOKEN_RAHASIA_YANG_KAMU_BUAT" \
  -H "Content-Type: application/json" \
  -d '{
    "vote":     [{"n":"NamaPemain1","v":12}],
    "donate":   [{"n":"NamaPemain2","v":50000}],
    "balance":  [{"n":"NamaPemain3","v":1000}],
    "playtime": [{"n":"NamaPemain4","v":10}]
  }'
```

Dua cara realistis untuk mengotomatiskan ini:
1. **Plugin Minecraft** (mis. pakai PlaceholderAPI + plugin scheduler) yang setiap X menit membaca data vote/balance/playtime dari server lalu POST ke endpoint di atas.
2. **Cron job sederhana** di VPS server Minecraft-mu yang query database plugin ekonomi/vote-mu, lalu POST ke endpoint yang sama.

Sebelum ini disambungkan, tab leaderboard akan menampilkan "Belum ada data" — jujur, bukan data palsu.

## Catatan penting soal keamanan pembayaran

Alur QRIS/E-Wallet di situs ini **manual/trust-based**: tombol "Saya Sudah Bayar" hanya mengirim notifikasi, staff tetap harus mencocokkan mutasi rekening secara manual. Ini wajar untuk server kecil, tapi risikonya:
- Pembeli bisa saja klik tombol tanpa benar-benar transfer.
- Tidak ada verifikasi otomatis bahwa uang benar-benar masuk.

Kalau kamu ingin verifikasi 100% otomatis (tanpa staff cek manual), langkah berikutnya adalah integrasi payment gateway lokal seperti **Tripay**, **Midtrans**, atau **Duitku** — mereka punya webhook resmi yang memberi tahu server kamu begitu pembayaran benar-benar dikonfirmasi bank/e-wallet. Itu di luar cakupan perubahan ini karena butuh akun merchant & kredensial API milikmu sendiri, tapi struktur backend (`worker/worker.js`) sudah disiapkan supaya kamu tinggal menambah endpoint baru untuk itu nanti.

## Checklist sebelum benar-benar live

- [ ] `wrangler deploy` sudah jalan, dan `orderApiUrl` / `leaderboardApiUrl` di `script.js` sudah diisi
- [ ] Discord webhook sudah di-set lewat `wrangler secret put`, dan sudah dites (order test masuk ke channel)
- [ ] QRIS image = milik kamu sendiri, sudah dites scan pakai HP
- [ ] Nomor e-wallet & nama pemilik = benar-benar milik kamu
- [ ] `ALLOWED_ORIGIN` di `wrangler.toml` sudah diganti dari `*` ke domain situs kamu (mengurangi abuse API dari situs lain)
- [ ] Tidak ada lagi banner merah "konfigurasi belum diisi" saat buka situs
- [ ] Leaderboard sudah tersambung ke data server asli (atau sengaja dibiarkan kosong dulu)