import apiClient from './client';
import type { KycDocumentType } from '@/lib/mockData';

export interface SubmitKycDto {
  documents: {
    type: KycDocumentType;
    file: File;
  }[];
}

export async function getKycStatus() {
  const { data } = await apiClient.get('/api/v1/merchants/me/kyc');
  return data;
}

/**
 * Upload satu dokumen KYC via multipart/form-data.
 * Backend endpoint: POST /api/v1/merchants/me/kyc
 * Field form: documentType (string) + file (binary)
 */
export async function uploadKycDocument(type: KycDocumentType, file: File) {
  const formData = new FormData();
  formData.append('documentType', type);
  formData.append('file', file);
  const { data } = await apiClient.post('/api/v1/merchants/me/kyc', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function submitKyc() {
  const { data } = await apiClient.post('/api/v1/merchants/me/kyc/submit');
  return data;
}
