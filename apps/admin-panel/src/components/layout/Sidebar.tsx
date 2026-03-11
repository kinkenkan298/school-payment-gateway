'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  Building2,
  ArrowLeftRight,
  ShieldCheck,
  BarChart3,
  Settings,
  LogOut,
  Users,
  Landmark,
  AlertTriangle,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { adminLogout } from '@/lib/api/auth';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/merchants', label: 'Merchant', icon: Building2 },
  { href: '/kyc-review', label: 'Review KYC', icon: ShieldCheck, badge: 'kyc' },
  { href: '/transactions', label: 'Transaksi', icon: ArrowLeftRight },
  { href: '/settlements', label: 'Settlement', icon: Landmark },
  { href: '/reports', label: 'Laporan', icon: BarChart3 },
  { href: '/fraud', label: 'Fraud Detection', icon: AlertTriangle },
  { href: '/users', label: 'Admin Users', icon: Users },
  { href: '/settings', label: 'Pengaturan', icon: Settings },
];

interface SidebarProps {
  pendingKycCount?: number;
}

export function Sidebar({ pendingKycCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, refreshToken, logout } = useAuthStore();

  async function handleLogout() {
    try {
      if (refreshToken) await adminLogout(refreshToken);
    } catch {
      // continue regardless
    } finally {
      logout();
      router.replace('/login');
    }
  }

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'SA';

  const roleLabel = user?.role === 'superadmin' ? 'Super Admin' :
    user?.role === 'admin' ? 'Admin' : 'Support';

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-700">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-600">
          <ShieldCheck className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">School Pay</p>
          <p className="text-xs text-slate-400">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          const showBadge = badge === 'kyc' && pendingKycCount > 0;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-slate-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {showBadge && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                  {pendingKycCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-700 p-4 space-y-3">
        <div className="flex items-center gap-3 px-3">
          <div className="h-8 w-8 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-white truncate">{user?.name ?? 'Admin'}</p>
            <p className="text-xs text-slate-400 truncate">{roleLabel}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
