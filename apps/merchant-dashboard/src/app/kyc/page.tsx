'use client';

import { useState, useRef, useCallback } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  X,
  ChevronRight,
  Info,
} from 'lucide-react';
import { clsx } from 'clsx';
import { mockKycData } from '@/lib/mockData';
import type { KycData, KycDocument, KycDocumentType, KycStatus } from '@/lib/mockData';

// ─── Helpers ────────────────────────────────────────────────────────────────

const MAX_FILE_SIZE_MB = 5;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const ACCEPTED_LABEL = 'JPG, PNG, atau PDF (maks. 5 MB)';

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Status Banner ───────────────────────────────────────────────────────────

interface StatusConfig {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  bg: string;
  border: string;
}

function getStatusConfig(status: KycStatus, rejectionReason: string | null): StatusConfig {
  switch (status) {
    case 'verified':
      return {
        icon: <ShieldCheck className="h-6 w-6" />,
        title: 'Akun Terverifikasi',
        description: 'Dokumen KYC Anda telah diverifikasi. Semua fitur dapat digunakan.',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
      };
    case 'pending':
      return {
        icon: <Clock className="h-6 w-6" />,
        title: 'Menunggu Verifikasi',
        description: 'Dokumen Anda telah dikirim dan sedang dalam antrian review. Estimasi 1–3 hari kerja.',
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
      };
    case 'under_review':
      return {
        icon: <Clock className="h-6 w-6 animate-pulse" />,
        title: 'Sedang Direview',
        description: 'Tim kami sedang memeriksa dokumen Anda. Harap tunggu.',
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
      };
    case 'rejected':
      return {
        icon: <ShieldAlert className="h-6 w-6" />,
        title: 'Verifikasi Ditolak',
        description: rejectionReason ?? 'Dokumen tidak memenuhi syarat. Unggah ulang dokumen yang sesuai.',
        color: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-200',
      };
    default:
      return {
        icon: <ShieldAlert className="h-6 w-6" />,
        title: 'Belum Terverifikasi',
        description: 'Unggah dokumen KYC untuk mengaktifkan fitur transaksi dan penarikan dana.',
        color: 'text-gray-700',
        bg: 'bg-gray-50',
        border: 'border-gray-200',
      };
  }
}

// ─── Document Card ───────────────────────────────────────────────────────────

interface DocCardProps {
  doc: KycDocument;
  selectedFile: File | null;
  uploading: boolean;
  onFileSelect: (type: KycDocumentType, file: File) => void;
  onRemoveSelected: (type: KycDocumentType) => void;
  kycStatus: KycStatus;
}

function DocumentCard({ doc, selectedFile, uploading, onFileSelect, onRemoveSelected, kycStatus }: DocCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLocked = kycStatus === 'verified' || kycStatus === 'pending' || kycStatus === 'under_review';
  const hasUploadedDoc = doc.status === 'uploaded' || doc.status === 'approved';

  function validateFile(file: File): string | null {
    if (!ACCEPTED_TYPES.includes(file.type)) return 'Format tidak didukung. Gunakan JPG, PNG, atau PDF.';
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) return `Ukuran file terlalu besar. Maks. ${MAX_FILE_SIZE_MB} MB.`;
    return null;
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    const validationError = validateFile(file);
    if (validationError) { setError(validationError); return; }
    setError(null);
    onFileSelect(doc.type, file);
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, []); // eslint-disable-line

  const docStatusBadge = () => {
    if (selectedFile) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
          <Upload className="h-3 w-3" /> Siap diunggah
        </span>
      );
    }
    switch (doc.status) {
      case 'approved':
        return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700"><CheckCircle2 className="h-3 w-3" /> Disetujui</span>;
      case 'uploaded':
        return <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700"><Clock className="h-3 w-3" /> Sedang direview</span>;
      case 'rejected':
        return <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700"><XCircle className="h-3 w-3" /> Ditolak</span>;
      default:
        return <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500"><AlertCircle className="h-3 w-3" /> Belum diunggah</span>;
    }
  };

  return (
    <div className={clsx(
      'rounded-xl border bg-white p-5 transition-shadow',
      doc.status === 'rejected' && !selectedFile ? 'border-red-300' : 'border-gray-200',
      !isLocked && 'hover:shadow-sm'
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3">
          <div className={clsx(
            'mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg',
            doc.status === 'approved' ? 'bg-emerald-100' :
            doc.status === 'rejected' ? 'bg-red-100' :
            selectedFile ? 'bg-blue-100' : 'bg-gray-100'
          )}>
            <FileText className={clsx(
              'h-5 w-5',
              doc.status === 'approved' ? 'text-emerald-600' :
              doc.status === 'rejected' ? 'text-red-600' :
              selectedFile ? 'text-blue-600' : 'text-gray-500'
            )} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{doc.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{doc.description}</p>
          </div>
        </div>
        {docStatusBadge()}
      </div>

      {/* Rejection reason */}
      {doc.status === 'rejected' && doc.rejectionReason && (
        <div className="mb-3 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          <XCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
          <span>{doc.rejectionReason}</span>
        </div>
      )}

      {/* File already uploaded display */}
      {hasUploadedDoc && !selectedFile && !isLocked && (
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
          <FileText className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
          <span className="truncate flex-1">{doc.fileName ?? 'Dokumen telah diunggah'}</span>
          {doc.fileSize && <span className="text-gray-400 flex-shrink-0">{formatBytes(doc.fileSize)}</span>}
        </div>
      )}

      {/* Selected file preview */}
      {selectedFile && (
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs">
          <FileText className="h-3.5 w-3.5 flex-shrink-0 text-blue-500" />
          <span className="truncate flex-1 text-blue-700 font-medium">{selectedFile.name}</span>
          <span className="text-blue-500 flex-shrink-0">{formatBytes(selectedFile.size)}</span>
          <button
            onClick={() => onRemoveSelected(doc.type)}
            className="flex-shrink-0 rounded p-0.5 text-blue-400 hover:text-blue-700 hover:bg-blue-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Dropzone */}
      {!isLocked && (
        <>
          <div
            onClick={() => !uploading && inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={clsx(
              'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-4 px-3 text-center transition-colors',
              dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50',
              uploading && 'pointer-events-none opacity-60'
            )}
          >
            <Upload className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs font-medium text-gray-700">
                {selectedFile || hasUploadedDoc ? 'Ganti dokumen' : 'Klik atau seret file ke sini'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{ACCEPTED_LABEL}</p>
            </div>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          {error && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="h-3 w-3 flex-shrink-0" /> {error}
            </p>
          )}
        </>
      )}

      {/* Locked state with existing file */}
      {isLocked && hasUploadedDoc && (
        <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
          <FileText className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
          <span className="truncate flex-1">{doc.fileName ?? 'Dokumen telah diunggah'}</span>
          {doc.fileSize && <span className="text-gray-400 flex-shrink-0">{formatBytes(doc.fileSize)}</span>}
        </div>
      )}
    </div>
  );
}

// ─── Steps indicator ─────────────────────────────────────────────────────────

const STEPS = [
  { label: 'Unggah Dokumen', desc: 'Pilih & upload 4 dokumen' },
  { label: 'Kirim untuk Review', desc: 'Submit semua dokumen' },
  { label: 'Verifikasi', desc: 'Tim kami mereview dokumen' },
];

function getActiveStep(status: KycStatus): number {
  if (status === 'unverified') return 0;
  if (status === 'pending' || status === 'under_review') return 1;
  return 2;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function KycPage() {
  const [kyc, setKyc] = useState<KycData>(mockKycData);
  const [selectedFiles, setSelectedFiles] = useState<Partial<Record<KycDocumentType, File>>>({});
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const statusConfig = getStatusConfig(kyc.status, kyc.rejectionReason);
  const activeStep = getActiveStep(kyc.status);
  const isLocked = kyc.status === 'verified' || kyc.status === 'pending' || kyc.status === 'under_review';

  const hasNewFiles = Object.keys(selectedFiles).length > 0;
  const allUploaded = kyc.documents.every(
    (d) => d.status === 'uploaded' || d.status === 'approved' || selectedFiles[d.type]
  );
  const canSubmit = !isLocked && allUploaded;

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  }

  function handleFileSelect(type: KycDocumentType, file: File) {
    setSelectedFiles((prev) => ({ ...prev, [type]: file }));
  }

  function handleRemoveSelected(type: KycDocumentType) {
    setSelectedFiles((prev) => {
      const next = { ...prev };
      delete next[type];
      return next;
    });
  }

  async function handleUploadAll() {
    if (!hasNewFiles) return;
    setUploading(true);

    // Simulate sequential uploads (replace with real API calls)
    await new Promise((r) => setTimeout(r, 1800));

    setKyc((prev) => ({
      ...prev,
      documents: prev.documents.map((d) => {
        const file = selectedFiles[d.type];
        if (!file) return d;
        return {
          ...d,
          status: 'uploaded',
          fileName: file.name,
          fileSize: file.size,
          uploadedAt: new Date().toISOString(),
          rejectionReason: null,
        };
      }),
    }));
    setSelectedFiles({});
    setUploading(false);
    showToast('success', `${Object.keys(selectedFiles).length} dokumen berhasil diunggah.`);
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setKyc((prev) => ({
      ...prev,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    }));
    setSubmitting(false);
    showToast('success', 'Dokumen berhasil dikirim. Tim kami akan mereview dalam 1–3 hari kerja.');
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div className={clsx(
          'fixed top-6 right-6 z-50 flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg text-sm font-medium transition-all',
          toast.type === 'success'
            ? 'bg-white border-emerald-200 text-emerald-700'
            : 'bg-white border-red-200 text-red-700'
        )}>
          {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Verifikasi Akun (KYC)</h1>
        <p className="text-sm text-gray-500 mt-1">
          Unggah dokumen resmi sekolah untuk mengaktifkan fitur transaksi dan penarikan dana.
        </p>
      </div>

      {/* Status Banner */}
      <div className={clsx('flex items-start gap-4 rounded-xl border p-4', statusConfig.bg, statusConfig.border)}>
        <div className={clsx('mt-0.5 flex-shrink-0', statusConfig.color)}>{statusConfig.icon}</div>
        <div>
          <p className={clsx('font-semibold', statusConfig.color)}>{statusConfig.title}</p>
          <p className={clsx('text-sm mt-0.5', statusConfig.color, 'opacity-80')}>{statusConfig.description}</p>
          {kyc.submittedAt && (
            <p className={clsx('text-xs mt-1 opacity-60', statusConfig.color)}>
              Dikirim: {new Date(kyc.submittedAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          )}
        </div>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-0">
        {STEPS.map((step, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className={clsx(
                'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors',
                i < activeStep
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : i === activeStep
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-200 text-gray-400 bg-white'
              )}>
                {i < activeStep ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <div className="hidden sm:block">
                <p className={clsx('text-xs font-semibold', i <= activeStep ? 'text-gray-900' : 'text-gray-400')}>
                  {step.label}
                </p>
                <p className="text-xs text-gray-400">{step.desc}</p>
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div className={clsx('flex-1 mx-3 h-0.5', i < activeStep ? 'bg-emerald-400' : 'bg-gray-200')} />
            )}
          </div>
        ))}
      </div>

      {/* Info box when locked */}
      {isLocked && kyc.status !== 'verified' && (
        <div className="flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>Dokumen sedang dalam proses review. Anda tidak dapat mengubah dokumen saat ini.</span>
        </div>
      )}

      {/* Document Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">
            Dokumen yang diperlukan
            <span className="ml-2 text-xs font-normal text-gray-500">
              ({kyc.documents.filter((d) => d.status === 'uploaded' || d.status === 'approved').length}/{kyc.documents.length} diunggah)
            </span>
          </h2>
          {hasNewFiles && !uploading && (
            <button
              onClick={handleUploadAll}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <Upload className="h-3.5 w-3.5" />
              Unggah {Object.keys(selectedFiles).length} file
            </button>
          )}
          {uploading && (
            <span className="inline-flex items-center gap-1.5 text-xs text-blue-600">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Mengunggah...
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {kyc.documents.map((doc) => (
            <DocumentCard
              key={doc.type}
              doc={doc}
              selectedFile={selectedFiles[doc.type] ?? null}
              uploading={uploading}
              onFileSelect={handleFileSelect}
              onRemoveSelected={handleRemoveSelected}
              kycStatus={kyc.status}
            />
          ))}
        </div>
      </div>

      {/* Progress summary */}
      {!isLocked && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Ringkasan Dokumen</h3>
          <div className="space-y-2">
            {kyc.documents.map((doc) => {
              const file = selectedFiles[doc.type];
              const isOk = doc.status === 'uploaded' || doc.status === 'approved' || !!file;
              return (
                <div key={doc.type} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    {isOk
                      ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      : <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                    }
                    {doc.label}
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    {file
                      ? <span className="text-blue-600 font-medium">{file.name}</span>
                      : doc.status === 'approved'
                      ? <span className="text-emerald-600">Disetujui</span>
                      : doc.status === 'uploaded'
                      ? <span className="text-amber-600">Direview</span>
                      : doc.status === 'rejected'
                      ? <span className="text-red-600">Ditolak — perlu diunggah ulang</span>
                      : <span className="text-gray-400">Belum diunggah</span>
                    }
                    {(isOk && !file) && <ChevronRight className="h-3 w-3 text-gray-300" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit button */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            {!allUploaded && (
              <p className="text-xs text-amber-600 mb-3 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                Semua {kyc.documents.length} dokumen harus diunggah sebelum dapat dikirim.
              </p>
            )}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className={clsx(
                'w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-colors',
                canSubmit && !submitting
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              )}
            >
              {submitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Mengirim...</>
              ) : (
                <><ShieldCheck className="h-4 w-4" /> Kirim untuk Verifikasi</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Verified final state */}
      {kyc.status === 'verified' && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <ShieldCheck className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
          <p className="font-semibold text-emerald-800 text-lg">Akun Terverifikasi</p>
          <p className="text-sm text-emerald-700 mt-1 max-w-sm mx-auto">
            Sekolah Anda telah terverifikasi. Semua fitur pembayaran, penarikan, dan laporan dapat digunakan penuh.
          </p>
          {kyc.reviewedAt && (
            <p className="text-xs text-emerald-600 mt-2 opacity-70">
              Diverifikasi pada {new Date(kyc.reviewedAt).toLocaleString('id-ID', { dateStyle: 'long' })}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
