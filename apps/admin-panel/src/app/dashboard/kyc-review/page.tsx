'use client';

import { useState } from 'react';
import {
  ShieldCheck,
  FileText,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { mockKycQueue } from '@/lib/mockData';
import type { KycReviewItem } from '@/lib/mockData';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function KycReviewPage() {
  const [queue, setQueue] = useState(mockKycQueue);
  const [selected, setSelected] = useState<KycReviewItem | null>(queue[0] ?? null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  function handleApprove(id: string) {
    setQueue((prev) => prev.filter((k) => k.id !== id));
    if (selected?.id === id) setSelected(queue.find((k) => k.id !== id) ?? null);
    setShowRejectInput(false);
  }

  function handleReject(id: string) {
    if (!rejectReason.trim()) return;
    setQueue((prev) => prev.filter((k) => k.id !== id));
    if (selected?.id === id) setSelected(queue.find((k) => k.id !== id) ?? null);
    setRejectReason('');
    setShowRejectInput(false);
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Review KYC</h1>
        <p className="text-sm text-gray-500 mt-1">{queue.length} dokumen menunggu persetujuan</p>
      </div>

      {queue.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-gray-200 bg-white">
          <CheckCircle2 className="h-12 w-12 text-emerald-400 mb-3" />
          <p className="text-lg font-semibold text-gray-700">Antrian KYC Kosong</p>
          <p className="text-sm text-gray-400 mt-1">Semua pengajuan KYC sudah diproses.</p>
        </div>
      ) : (
        <div className="flex gap-5 min-h-[600px]">
          {/* Left: queue list */}
          <div className="w-72 flex-shrink-0 space-y-2">
            {queue.map((item) => (
              <button
                key={item.id}
                onClick={() => { setSelected(item); setShowRejectInput(false); }}
                className={`w-full text-left rounded-xl border p-4 transition-colors ${
                  selected?.id === item.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{item.schoolName}</p>
                    <p className="text-xs text-gray-500 truncate">{item.email}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      {formatDate(item.submittedAt)}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Right: detail */}
          {selected && (
            <div className="flex-1 rounded-xl border border-gray-200 bg-white p-6 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{selected.schoolName}</h2>
                  <p className="text-sm text-gray-500">{selected.email}</p>
                  <p className="text-xs text-gray-400 mt-1">Dikirim: {formatDate(selected.submittedAt)}</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                  <Clock className="h-3 w-3" /> Menunggu Review
                </span>
              </div>

              {/* Documents */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Dokumen yang Diajukan</p>
                <div className="grid grid-cols-2 gap-3">
                  {selected.documents.map((doc) => (
                    <a
                      key={doc.type}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 flex-shrink-0">
                        <FileText className="h-5 w-5 text-gray-500 group-hover:text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-800 truncate">{doc.label}</p>
                        <p className="text-xs text-gray-400">Lihat dokumen</p>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-gray-100 pt-4">
                {showRejectInput ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Alasan Penolakan
                      </label>
                      <textarea
                        rows={3}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Jelaskan alasan penolakan KYC ini..."
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent resize-none"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReject(selected.id)}
                        disabled={!rejectReason.trim()}
                        className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <XCircle className="h-4 w-4" /> Konfirmasi Tolak
                      </button>
                      <button
                        onClick={() => setShowRejectInput(false)}
                        className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleApprove(selected.id)}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Setujui KYC
                    </button>
                    <button
                      onClick={() => setShowRejectInput(true)}
                      className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <XCircle className="h-4 w-4" /> Tolak
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
