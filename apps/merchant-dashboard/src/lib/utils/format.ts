export function formatCurrency(amount: number, currency = 'IDR'): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatPaymentMethod(method: string): string {
  const labels: Record<string, string> = {
    credit_card: 'Kartu Kredit',
    bank_transfer: 'Transfer Bank',
    ewallet: 'E-Wallet',
    qris: 'QRIS',
    virtual_account: 'Virtual Account',
  };
  return labels[method] ?? method;
}

export function formatWorkflow(workflow: string): string {
  const labels: Record<string, string> = {
    provider_to_platform: 'Via Platform (Markup)',
    platform_direct: 'Direct (Komisi)',
    bank_direct: 'H2H Bank',
  };
  return labels[workflow] ?? workflow;
}

export function shortenId(id: string, chars = 8): string {
  return `#${id.slice(-chars).toUpperCase()}`;
}
