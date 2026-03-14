# Admin Panel

Panel manajemen untuk operator platform School Payment Gateway. Operator dapat mengelola merchant, mereview KYC, memantau transaksi lintas merchant, menangani fraud, dan mengonfigurasi sistem.

---

## Daftar Isi

- [Menjalankan](#menjalankan)
- [Struktur Folder](#struktur-folder)
- [Halaman & Fitur](#halaman--fitur)
- [Auth Flow](#auth-flow)
- [Komponen UI](#komponen-ui)
- [State Management](#state-management)
- [Environment Variables](#environment-variables)

---

## Menjalankan

```bash
# Dari root monorepo
pnpm --filter admin-panel dev

# Atau masuk ke folder app
cd apps/admin-panel
pnpm dev
```

Akses di: **http://localhost:5000**

**Akun demo (mock):**

| Field | Value |
|-------|-------|
| Email | `admin@schoolpay.id` |
| Password | `password` |

---

## Struktur Folder

```
src/
├── app/                              # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx                      # Redirect ke /dashboard
│   ├── login/page.tsx                # Halaman login admin
│   └── dashboard/                   # Protected routes
│       ├── layout.tsx               # Layout dengan Sidebar + Navbar
│       ├── page.tsx                 # Dashboard utama
│       ├── merchants/
│       │   ├── page.tsx             # Daftar merchant
│       │   └── [id]/page.tsx        # Detail merchant
│       ├── kyc-review/page.tsx      # Antrian review KYC
│       ├── transactions/
│       │   ├── page.tsx             # Semua transaksi
│       │   └── [id]/page.tsx        # Detail transaksi
│       ├── settlements/page.tsx     # Settlement lintas merchant
│       ├── reports/page.tsx         # Laporan & analitik platform
│       ├── fraud/
│       │   ├── page.tsx             # Alert & monitoring fraud
│       │   └── blacklist/page.tsx   # Manajemen blacklist
│       ├── users/page.tsx           # Manajemen pengguna admin
│       └── settings/page.tsx        # Konfigurasi sistem
├── components/
│   ├── ui/                          # Badge, Card, Button, Input, Select
│   └── layout/                      # Sidebar, Navbar, AdminLayout
├── store/
│   └── authStore.ts                 # Zustand auth store
├── lib/
│   ├── api/                         # API client + endpoint functions
│   ├── utils/                       # format.ts
│   └── mockData.ts                  # Data dummy untuk development
└── middleware.ts                    # Proteksi route via cookie
```

---

## Halaman & Fitur

### Login (`/login`)

- Form login khusus operator
- Redirect ke `/dashboard` jika sudah login
- Semua route `/dashboard/**` diproteksi middleware

---

### Dashboard (`/dashboard`)

- KPI platform: total merchant aktif, transaksi hari ini, revenue platform, pending KYC
- Grafik pertumbuhan transaksi (line chart)
- Distribusi metode pembayaran (pie chart)
- Tabel merchant dengan volume tertinggi
- Alert fraud terbaru

---

### Merchant (`/dashboard/merchants`, `/dashboard/merchants/[id]`)

**Daftar:**
- Cari & filter berdasarkan status (Aktif / Pending / Suspended / Rejected)
- Tabel: nama merchant, email, model bisnis, jumlah transaksi, revenue, status KYC
- Tombol aksi cepat: Setujui / Suspend / Lihat Detail

**Detail Merchant (`/dashboard/merchants/[id]`):**
- Informasi lengkap: kontak, NPSN, tanggal bergabung, model bisnis
- Statistik: total transaksi, revenue, success rate, rata-rata nominal
- Status KYC dengan timeline
- Tab dokumen KYC yang diupload
- Tab riwayat transaksi merchant tersebut
- Aksi admin: Setujui, Suspend, Reject dengan konfirmasi

---

### Review KYC (`/dashboard/kyc-review`)

- Antrian dokumen yang menunggu review
- Filter: Menunggu / Dalam Review / Disetujui / Ditolak
- Statistik: total pending, dalam review, disetujui hari ini
- Per item: preview dokumen, nama merchant, tanggal submit
- Aksi: Mulai Review → Setujui atau Tolak (wajib isi alasan jika ditolak)

---

### Transaksi (`/dashboard/transactions`, `/dashboard/transactions/[id]`)

**Daftar:**
- Semua transaksi lintas seluruh merchant
- Filter status, pencarian multi-field (merchant, siswa, ID)
- Kolom: ID/Waktu, Merchant, Siswa, Metode, Jumlah, Status, tombol Detail

**Detail Transaksi (`/dashboard/transactions/[id]`):**
- Header status dengan ikon dan warna
- Info transaksi: ID, merchant, siswa, metode pembayaran, waktu
- Rincian biaya: nominal, fee platform, fee %, net ke merchant
- Notifikasi kontekstual (penjelasan status failed/expired/pending)
- Aksi admin: Lihat Merchant, Tandai untuk Review

---

### Settlement (`/dashboard/settlements`)

- Settlement semua merchant dalam satu tampilan
- Filter status: Selesai / Diproses / Dijadwalkan / Gagal
- Tabel: merchant, periode, jumlah transaksi, gross, fee, net, bank tujuan, status
- Statistik: total terbayar, sedang diproses, dijadwalkan, gagal

---

### Laporan (`/dashboard/reports`)

- Filter rentang tanggal kustom
- KPI: total revenue platform, transaksi sukses, merchant aktif, rata-rata fee
- Grafik revenue platform (bar chart)
- Breakdown per merchant
- Export CSV laporan periode

---

### Fraud (`/dashboard/fraud`, `/dashboard/fraud/blacklist`)

**Monitoring (`/dashboard/fraud`):**
- Alert aktif yang perlu ditangani (High / Medium / Low risk)
- Statistik: alert hari ini, ditangani, false positive, total diblokir
- Filter berdasarkan level risiko
- Detail per alert: jenis fraud, merchant terkait, nominal, aksi yang tersedia
- Aksi: Blokir Transaksi, Investigasi, Tandai False Positive

**Blacklist (`/dashboard/fraud/blacklist`):**
- Daftar entitas yang diblokir: nomor rekening, email, nomor telepon, IP
- Tambah entitas ke blacklist (isi tipe, nilai, alasan)
- Hapus entitas dari blacklist dengan konfirmasi
- Statistik: total diblokir, transaksi dicegah, nilai transaksi dicegah

---

### Pengguna Admin (`/dashboard/users`)

- Daftar akun operator admin
- Role: Super Admin, Admin, Finance, Support
- Aksi: Tambah pengguna, Edit role, Aktifkan/Nonaktifkan akun
- Riwayat login terakhir

---

### Pengaturan Sistem (`/dashboard/settings`)

| Tab | Konten |
|-----|--------|
| Umum | Nama platform, URL, kontak support, timezone |
| Payment Gateway | Konfigurasi provider PG (Midtrans/Xendit), API key per environment |
| Fee & Komisi | Setting fee default per metode pembayaran, model bisnis |
| Notifikasi | Template email/webhook notifikasi sistem |
| Keamanan | Kebijakan password, whitelist IP admin, session timeout |

---

## Auth Flow

```
Operator buka URL
        ↓
middleware.ts baca cookie access_token
        ↓
Tidak ada token ──→ redirect /login
Ada token        ──→ lanjut ke halaman yang dituju
        ↓
Login berhasil
        ↓
authStore.setAuth()
  ├─ Simpan user + token di Zustand (persist ke localStorage)
  └─ Set cookie access_token
        ↓
Redirect ke /dashboard
        ↓
Logout
  ├─ Hapus cookie access_token
  └─ Reset Zustand store → redirect /login
```

**Halaman publik:** `/login`

Semua route di bawah `/dashboard/**` memerlukan autentikasi.

---

## Komponen UI

Lokasi: `src/components/ui/`

| Komponen | Props Utama |
|----------|-------------|
| `Button` | `variant` (primary/secondary/danger/ghost), `size`, `loading` |
| `Card` | `className`, children |
| `Input` | `leftIcon`, `error`, `disabled` |
| `Select` | `options`, `value`, `onChange` |
| `Badge` | `color`, children |

**Layout Components** (`src/components/layout/`):

| Komponen | Deskripsi |
|----------|-----------|
| `AdminLayout` | Layout utama dengan Sidebar + Navbar, hanya aktif di `/dashboard/**` |
| `Sidebar` | Navigasi kiri dengan highlight route aktif |
| `Navbar` | Header dengan nama operator dan tombol logout |

---

## State Management

```ts
// src/store/authStore.ts

interface AuthStore {
  user: AdminUser | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: AdminUser, token: string) => void
  logout: () => void
}
```

Menggunakan Zustand dengan `persist` middleware.

---

## Environment Variables

Buat file `.env.local` di folder `apps/admin-panel/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```
