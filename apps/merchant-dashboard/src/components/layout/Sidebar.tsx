'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Landmark,
  Banknote,
  Key,
  Settings,
  GraduationCap,
  LogOut,
  BarChart3,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { logout as logoutApi } from '@/lib/api/auth';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transaksi', icon: ArrowLeftRight },
  { href: '/settlements', label: 'Settlement', icon: Landmark },
  { href: '/payouts', label: 'Pencairan', icon: Banknote },
  { href: '/reports', label: 'Laporan', icon: BarChart3 },
  { href: '/api-keys', label: 'API Keys', icon: Key },
  { href: '/settings', label: 'Pengaturan', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, refreshToken, logout } = useAuthStore();

  async function handleLogout() {
    try {
      if (refreshToken) await logoutApi(refreshToken);
    } catch {
      // lanjut logout meski API gagal
    } finally {
      logout();
      router.replace('/login');
    }
  }

  // Inisial avatar dari nama sekolah
  const initials = user?.schoolName
    ? user.schoolName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'SP';

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-gray-900">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-gray-700">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">School Pay</p>
          <p className="text-xs text-gray-400">Merchant Dashboard</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-700 p-4 space-y-3">
        <div className="flex items-center gap-3 px-3">
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-white truncate">{user?.schoolName ?? 'Sekolah'}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email ?? ''}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
