/**
 * Re-export authStore dari store root agar import dari slices/ tetap bekerja.
 * Lokasi canonical: src/store/authStore.ts
 */
export { useAuthStore } from '@/store/authStore';
export type { AuthUser } from '@/store/authStore';
