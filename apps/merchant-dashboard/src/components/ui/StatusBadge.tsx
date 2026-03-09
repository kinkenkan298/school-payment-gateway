import { Badge } from './Badge';

type PaymentStatus = 'pending' | 'processing' | 'success' | 'failed' | 'cancelled' | 'refunded' | 'expired';

const statusConfig: Record<PaymentStatus, { label: string; variant: 'success' | 'error' | 'warning' | 'info' | 'neutral' }> = {
  pending: { label: 'Menunggu', variant: 'warning' },
  processing: { label: 'Diproses', variant: 'info' },
  success: { label: 'Berhasil', variant: 'success' },
  failed: { label: 'Gagal', variant: 'error' },
  cancelled: { label: 'Dibatalkan', variant: 'neutral' },
  refunded: { label: 'Dikembalikan', variant: 'info' },
  expired: { label: 'Kedaluwarsa', variant: 'neutral' },
};

interface StatusBadgeProps {
  status: PaymentStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, variant: 'neutral' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
