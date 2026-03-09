import { Sidebar } from '@/components/layout/Sidebar';
import { mockAdminStats } from '@/lib/mockData';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar pendingKycCount={mockAdminStats.pendingKyc} />
      <main className="flex-1 pl-64 min-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
