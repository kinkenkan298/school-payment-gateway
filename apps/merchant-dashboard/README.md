# Merchant Dashboard

Portal web untuk sekolah (merchant) dalam platform School Payment Gateway. Sekolah dapat membuat tagihan pembayaran, memantau transaksi, mengelola settlement, dan mengonfigurasi integrasi API.

---

## Daftar Isi

- [Menjalankan](#menjalankan)
- [Struktur Folder](#struktur-folder)
- [Halaman & Fitur](#halaman--fitur)
- [Auth Flow](#auth-flow)
- [Komponen UI](#komponen-ui)
- [State Management](#state-management)
- [API Layer](#api-layer)
- [Mengganti Mock Data](#mengganti-mock-data)
- [Environment Variables](#environment-variables)

---

## Menjalankan

```bash
# Dari root monorepo
pnpm --filter merchant-dashboard dev

# Atau masuk ke folder app
cd apps/merchant-dashboard
pnpm dev
```

Akses di: **http://localhost:4000**

**Akun demo (mock):**

| Field | Value |
|-------|-------|
| Email | `admin@sekolah.sch.id` |
| Password | `password` |

---

## Struktur Folder

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout + providers
│   ├── page.tsx                  # Redirect ke /dashboard
│   ├── providers.tsx             # QueryClientProvider
│   ├── (auth)/                   # Route group — tanpa layout dashboard
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   ├── dashboard/page.tsx
│   ├── create-payment/page.tsx
│   ├── payment-links/page.tsx
│   ├── kyc/page.tsx
│   ├── transactions/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── settlements/page.tsx
│   ├── payouts/page.tsx
│   ├── reports/page.tsx
│   ├── webhooks/page.tsx
│   ├── api-keys/page.tsx
│   └── settings/page.tsx
├── components/
│   ├── ui/                       # Komponen dasar (Button, Card, Input, dll)
│   ├── layout/                   # Sidebar, Navbar, DashboardLayout
│   └── charts/                   # RevenueChart, PaymentMethodChart
├── store/
│   └── authStore.ts              # Zustand auth store
├── lib/
│   ├── api/                      # client.ts, auth.ts, transactions.ts
│   ├── utils/                    # format.ts (currency, date)
│   └── mockData.ts               # Data dummy untuk development
└── middleware.ts                 # Proteksi route via cookie
```

---

## Halaman & Fitur

### Autentikasi

| Route | Deskripsi |
|-------|-----------|
| `/login` | Login dengan email + password |
| `/register` | Registrasi merchant baru dengan validasi form |
| `/forgot-password` | Kirim link reset password ke email |
| `/reset-password` | Set password baru via token dari email |

Route diproteksi oleh `middleware.ts` — redirect otomatis ke `/login` jika belum autentikasi.

---

### Dashboard (`/dashboard`)

- Ringkasan statistik: total transaksi, revenue, pending settlement, success rate
- Grafik revenue 30 hari terakhir (line chart)
- Distribusi metode pembayaran (pie chart)
- Tabel 5 transaksi terbaru
- Status verifikasi KYC

---

### Buat Pembayaran (`/create-payment`)

- Form: nama siswa, kelas, kategori, deskripsi, nominal, metode, batas waktu
- Preview ringkasan sebelum konfirmasi
- Metode yang didukung: Virtual Account, QRIS, E-Wallet, Transfer Bank
- Setelah dibuat, nomor VA atau ID tagihan dapat disalin dan dibagikan ke siswa

---

### Payment Links (`/payment-links`)

- Daftar semua tagihan yang pernah dibuat
- Filter: Aktif / Lunas / Kadaluarsa / Dibatalkan
- Salin nomor Virtual Account atau ID tagihan
- Batalkan tagihan aktif dengan konfirmasi
- Countdown sisa waktu kadaluarsa
- Statistik singkat: aktif, sudah dibayar, total terkumpul

---

### Verifikasi KYC (`/kyc`)

- Upload 4 dokumen: Akta Pendirian, SK Kemendikbud, NPWP, Rekening Koran
- Drag & drop atau browse file (validasi ukuran & format)
- Status: Belum Terverifikasi → Menunggu → Dalam Review → Disetujui / Ditolak
- Tampil alasan penolakan jika ada
- Progress indicator multi-step

---

### Transaksi

| Route | Deskripsi |
|-------|-----------|
| `/transactions` | Daftar transaksi dengan filter status & pencarian, pagination |
| `/transactions/[id]` | Detail: nominal, metode, status, waktu, fee breakdown, info bank |

---

### Settlement (`/settlements`)

- Riwayat periode settlement dengan status
- Ringkasan: total settled, pending, jumlah periode
- Tabel: periode, jumlah transaksi, gross, fee admin, net

---

### Pencairan (`/payouts`)

- Info rekening bank terdaftar
- Saldo tersedia dengan tombol "Tarik Dana"
- Riwayat pencairan: bank tujuan, nominal, referensi, status

---

### Laporan (`/reports`)

- Filter rentang tanggal kustom
- KPI: total transaksi, revenue, success rate, rata-rata nominal
- Grafik tren revenue (bar chart) & distribusi metode (pie chart)
- Export CSV

---

### Webhook (`/webhooks`)

- Tambah / edit / hapus endpoint webhook
- Subscribe ke event tertentu (payment.success, payment.failed, dll)
- Statistik pengiriman per endpoint
- Log pengiriman dengan detail request & response payload
- Fitur test kirim manual

---

### API Keys (`/api-keys`)

- Buat API key dengan label kustom
- Toggle tampilkan / sembunyikan key
- Salin key ke clipboard
- Hapus key
- Label environment (Production / Sandbox)

---

### Pengaturan (`/settings`)

| Tab | Konten |
|-----|--------|
| Profil | Nama sekolah, NPSN, email, telepon, alamat |
| Rekening Bank | Verifikasi bank, ubah rekening penerima |
| Webhook | URL endpoint global dan konfigurasi |
| Notifikasi | Toggle email / WhatsApp / in-app |
| Keamanan | Ganti password, setup 2FA (TOTP) |

---

## Auth Flow

```
User buka halaman
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
  └─ Set cookie access_token (dibaca middleware)
       ↓
Redirect ke /dashboard
       ↓
Logout
  ├─ Hapus cookie access_token
  └─ Reset Zustand store → redirect /login
```

**Halaman publik** (tidak perlu token):
`/login`, `/register`, `/forgot-password`, `/reset-password`

---

## Komponen UI

Lokasi: `src/components/ui/`

| Komponen | Props Utama |
|----------|-------------|
| `Button` | `variant` (primary/secondary/danger/ghost), `size` (sm/md/lg), `loading` |
| `Card` | `className`, children |
| `Input` | `leftIcon`, `error`, `disabled`, semua HTML input props |
| `Select` | `options`, `value`, `onChange`, `placeholder` |
| `Badge` | `color`, children |
| `StatusBadge` | `status` (success/pending/failed/expired) |
| `StatCard` | `title`, `value`, `icon`, `change`, `changeType` |

**Layout Components** (`src/components/layout/`):

| Komponen | Deskripsi |
|----------|-----------|
| `DashboardLayout` | Wrapper halaman dengan `title` + `subtitle` prop |
| `Sidebar` | Navigasi kiri, highlight route aktif, tombol logout |
| `Navbar` | Header dengan nama user |

---

## State Management

```ts
// src/store/authStore.ts

interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void  // dipanggil saat login
  logout: () => void                            // clear semua state
}
```

Menggunakan Zustand dengan `persist` middleware — state otomatis disimpan di `localStorage`.

---

## API Layer

```
src/lib/api/
├── client.ts         # Axios instance: base URL + interceptor Authorization header
├── auth.ts           # login(), register(), logout(), forgotPassword(), resetPassword()
└── transactions.ts   # getTransactions(), getTransactionById(), createPayment()
```

Token disertakan otomatis di setiap request via Axios request interceptor:

```ts
// client.ts
axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

---

## Mengganti Mock Data

Semua halaman saat ini menggunakan data dari `src/lib/mockData.ts`. Langkah migrasi ke API nyata:

1. Buat atau lengkapi function di `src/lib/api/`
2. Gunakan `useQuery` / `useMutation` dari TanStack React Query di halaman
3. Hapus import dari `mockData.ts`

**Contoh:**

```ts
// Sebelum (mock)
import { mockTransactions } from '@/lib/mockData';
const transactions = mockTransactions;

// Sesudah (API)
import { getTransactions } from '@/lib/api/transactions';
import { useQuery } from '@tanstack/react-query';

const { data: transactions, isLoading } = useQuery({
  queryKey: ['transactions'],
  queryFn: getTransactions,
});
```

---

## Environment Variables

Buat file `.env.local` di folder `apps/merchant-dashboard/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```
