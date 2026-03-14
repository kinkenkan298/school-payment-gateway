# School Payment Gateway

Platform pembayaran sekolah berbasis microservice yang menghubungkan sekolah, siswa, dan penyedia payment gateway. Mendukung tiga model bisnis: markup fee, komisi per transaksi, dan integrasi H2H bank.

---

## Daftar Isi

- [Arsitektur](#arsitektur)
- [Model Bisnis](#model-bisnis)
- [Struktur Monorepo](#struktur-monorepo)
- [Prasyarat](#prasyarat)
- [Instalasi](#instalasi)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Apps Frontend](#apps-frontend)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Build & Deploy](#build--deploy)

---

## Arsitektur

```
school-payment-gateway/
├── apps/
│   ├── merchant-dashboard/   # Portal sekolah/merchant (port 4000)
│   └── admin-panel/          # Panel operator platform (port 5000)
├── packages/
│   └── types/                # Shared TypeScript types
├── services/                 # Backend microservices (future)
├── turbo.json
└── pnpm-workspace.yaml
```

**Stack:**

| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| UI | React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| Data Fetching | TanStack React Query + Axios |
| Charts | Recharts |
| Icons | Lucide React |
| Monorepo | Turborepo |
| Package Manager | pnpm |

---

## Model Bisnis

| Workflow | Deskripsi |
|----------|-----------|
| **A** | Vendor PG → School Pay (Platform) → Sekolah — platform mengambil markup fee |
| **B** | Vendor PG → Sekolah — platform mendapat komisi per transaksi |
| **C** | H2H Bank Sekolah → Sekolah — integrasi langsung, gratis |

---

## Struktur Monorepo

```
apps/
  merchant-dashboard/   Portal untuk sekolah (merchant)
  admin-panel/          Panel manajemen operator platform

packages/
  types/                Interface dan type yang dipakai semua app
```

---

## Prasyarat

- **Node.js** >= 18.x
- **pnpm** >= 9.x
- **Git**

```bash
# Install pnpm jika belum ada
npm install -g pnpm
```

---

## Instalasi

```bash
# Clone repository
git clone <repo-url>
cd school-payment-gateway

# Install semua dependencies
pnpm install
```

---

## Menjalankan Aplikasi

### Semua app sekaligus

```bash
pnpm dev
```

### Per app (recommended saat development)

```bash
# Merchant Dashboard (port 4000)
pnpm --filter merchant-dashboard dev

# Admin Panel (port 5000)
pnpm --filter admin-panel dev
```

---

## Apps Frontend

| App | URL | Deskripsi |
|-----|-----|-----------|
| Merchant Dashboard | http://localhost:4000 | Portal sekolah: buat tagihan, lihat transaksi, settlement |
| Admin Panel | http://localhost:5000 | Panel operator: kelola merchant, KYC, fraud, laporan |

Detail lengkap masing-masing app:

- [Merchant Dashboard →](apps/merchant-dashboard/README.md)
- [Admin Panel →](apps/admin-panel/README.md)

---

## Konfigurasi Environment

Buat file `.env.local` di masing-masing app:

```bash
# apps/merchant-dashboard/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# apps/admin-panel/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## Build & Deploy

```bash
# Build semua app
pnpm build

# Build spesifik app
pnpm --filter merchant-dashboard build
pnpm --filter admin-panel build

# Type check semua
pnpm --filter merchant-dashboard exec tsc --noEmit
pnpm --filter admin-panel exec tsc --noEmit
```

> Saat ini semua halaman menggunakan **mock data**. Ganti dengan API call via Axios + React Query setelah backend siap.
