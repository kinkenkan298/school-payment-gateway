export const paymentSuccessEmail = (data: {
  studentName: string;
  parentName: string;
  amount: number;
  month: number;
  year: number;
  paymentId: string;
  paidAt: string;
}) => ({
  subject: `✅ Pembayaran SPP Berhasil - ${data.studentName}`,
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: #16a34a; color: white; padding: 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 22px; }
        .body { padding: 24px; }
        .detail-box { background: #f9fafb; border-radius: 8px; padding: 16px; margin: 16px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-row:last-child { border-bottom: none; }
        .label { color: #6b7280; }
        .value { font-weight: bold; color: #111827; }
        .footer { background: #f9fafb; padding: 16px; text-align: center; color: #6b7280; font-size: 12px; }
        .badge { background: #dcfce7; color: #16a34a; padding: 4px 12px; border-radius: 999px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Pembayaran SPP Berhasil</h1>
        </div>
        <div class="body">
          <p>Yth. <strong>${data.parentName}</strong>,</p>
          <p>Pembayaran SPP atas nama <strong>${data.studentName}</strong> telah berhasil dikonfirmasi.</p>

          <div class="detail-box">
            <div class="detail-row">
              <span class="label">Nama Siswa</span>
              <span class="value">${data.studentName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Periode</span>
              <span class="value">${data.month}/${data.year}</span>
            </div>
            <div class="detail-row">
              <span class="label">Jumlah</span>
              <span class="value">Rp ${data.amount.toLocaleString('id-ID')}</span>
            </div>
            <div class="detail-row">
              <span class="label">Tanggal Bayar</span>
              <span class="value">${new Date(data.paidAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <div class="detail-row">
              <span class="label">ID Transaksi</span>
              <span class="value">${data.paymentId}</span>
            </div>
            <div class="detail-row">
              <span class="label">Status</span>
              <span class="value"><span class="badge">LUNAS</span></span>
            </div>
          </div>

          <p>Terima kasih telah melakukan pembayaran tepat waktu.</p>
        </div>
        <div class="footer">
          <p>Email ini dikirim otomatis, mohon tidak membalas email ini.</p>
          <p>&copy; ${new Date().getFullYear()} School Payment Gateway</p>
        </div>
      </div>
    </body>
    </html>
  `,
});

export const paymentFailedEmail = (data: {
  studentName: string;
  parentName: string;
  amount: number;
  month: number;
  year: number;
}) => ({
  subject: `❌ Pembayaran SPP Gagal - ${data.studentName}`,
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: #dc2626; color: white; padding: 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 22px; }
        .body { padding: 24px; }
        .detail-box { background: #f9fafb; border-radius: 8px; padding: 16px; margin: 16px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-row:last-child { border-bottom: none; }
        .label { color: #6b7280; }
        .value { font-weight: bold; color: #111827; }
        .footer { background: #f9fafb; padding: 16px; text-align: center; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ Pembayaran SPP Gagal</h1>
        </div>
        <div class="body">
          <p>Yth. <strong>${data.parentName}</strong>,</p>
          <p>Mohon maaf, pembayaran SPP atas nama <strong>${data.studentName}</strong> gagal diproses.</p>

          <div class="detail-box">
            <div class="detail-row">
              <span class="label">Nama Siswa</span>
              <span class="value">${data.studentName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Periode</span>
              <span class="value">${data.month}/${data.year}</span>
            </div>
            <div class="detail-row">
              <span class="label">Jumlah</span>
              <span class="value">Rp ${data.amount.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <p>Silakan coba lakukan pembayaran kembali atau hubungi pihak sekolah jika membutuhkan bantuan.</p>
        </div>
        <div class="footer">
          <p>Email ini dikirim otomatis, mohon tidak membalas email ini.</p>
          <p>&copy; ${new Date().getFullYear()} School Payment Gateway</p>
        </div>
      </div>
    </body>
    </html>
  `,
});
