const nodemailer = require('nodemailer');

const hasSmtpConfig = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

const transporter = hasSmtpConfig ? nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: parseInt(process.env.SMTP_PORT || '587') === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
}) : null;

const FROM = process.env.SMTP_FROM || process.env.SMTP_USER;

class Mailer {
  async sendMail(message) {
    if (!transporter) {
      console.warn('[MAIL] SMTP_USER/SMTP_PASS belum diatur. Email dilewati.');
      return null;
    }

    return transporter.sendMail(message);
  }

  async sendOtp(toEmail, otp, purpose) {
    const subject = purpose === 'reset'
      ? 'Kode OTP Reset Password - Naspiontech'
      : 'Kode Verifikasi Email - Naspiontech';

    const intro = purpose === 'reset'
      ? 'Gunakan kode berikut untuk mereset password akun Naspiontech Anda:'
      : 'Gunakan kode berikut untuk memverifikasi email akun Naspiontech Anda:';

    await this.sendMail({
      from: `"Naspiontech" <${FROM}>`,
      to: toEmail,
      subject,
      text: `${intro}\n\n${otp}\n\nKode berlaku selama 15 menit. Jangan bagikan kode ini ke siapa pun.`,
      html: `
        <div style="font-family:sans-serif; max-width:420px; margin:0 auto;">
          <h2 style="color:#10b981;">Naspiontech</h2>
          <p>${intro}</p>
          <p style="font-size:28px; font-weight:700; letter-spacing:6px; color:#047857;">${otp}</p>
          <p style="color:#666; font-size:13px;">Kode berlaku selama 15 menit. Jangan bagikan kode ini ke siapa pun.</p>
        </div>
      `,
    });
  }

  async sendDangerAlert(toEmail, { recipientName, deviceName, ppm, message, occurredAt }) {
    const subject = `Posisi selang kemungkinan berada di saluran pernapasan - ${deviceName}`;
    const greeting = recipientName ? `Yth. ${recipientName},` : 'Yth. Bapak/Ibu,';
    const dangerGuidanceText = [
      'Risiko: Makanan atau obat dapat masuk ke paru-paru (aspirasi).',
      '',
      'Tindakan Segera',
      '- Hentikan pemberian nutrisi dan obat melalui selang.',
      '- Jangan menggeser atau melepas selang secara mandiri.',
      '- Posisikan pasien setengah duduk.',
      '- Hubungi tenaga kesehatan untuk memastikan posisi selang.',
      '- Bila pasien sesak napas berat, kebiruan, atau tidak sadar, segera ke IGD.',
    ].join('\n');

    await this.sendMail({
      from: `"Naspiontech" <${FROM}>`,
      to: toEmail,
      subject,
      text: `${greeting}\n\nAlat "${deviceName}" mendeteksi kondisi berbahaya.\n\nKadar CO2: ${ppm} ppm\nStatus: ${message}\nWaktu: ${occurredAt}\n\n${dangerGuidanceText}`,
      html: `
        <div style="font-family:sans-serif; max-width:480px; margin:0 auto;">
          <h2 style="color:#dc2626;">Posisi selang kemungkinan berada di saluran pernapasan</h2>
          <p>${greeting}</p>
          <p>Alat <strong>${deviceName}</strong> mendeteksi kondisi <strong style="color:#dc2626;">berbahaya</strong>.</p>
          <table style="width:100%; border-collapse:collapse; margin:12px 0;">
            <tr><td style="padding:4px 0; color:#666;">Kadar CO2</td><td style="font-weight:700;">${ppm} ppm</td></tr>
            <tr><td style="padding:4px 0; color:#666;">Status</td><td>${message}</td></tr>
            <tr><td style="padding:4px 0; color:#666;">Waktu</td><td>${occurredAt}</td></tr>
          </table>
          <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:12px; padding:14px 16px; margin-top:16px;">
            <p style="margin:0 0 10px; color:#991b1b;"><strong>Risiko:</strong> Makanan atau obat dapat masuk ke paru-paru (aspirasi).</p>
            <p style="margin:0 0 8px; color:#7f1d1d; font-weight:700;">Tindakan Segera</p>
            <ul style="margin:0; padding-left:20px; color:#7f1d1d; line-height:1.6;">
              <li>Hentikan pemberian nutrisi dan obat melalui selang.</li>
              <li>Jangan menggeser atau melepas selang secara mandiri.</li>
              <li>Posisikan pasien setengah duduk.</li>
              <li>Hubungi tenaga kesehatan untuk memastikan posisi selang.</li>
              <li>Bila pasien sesak napas berat, kebiruan, atau tidak sadar, segera ke IGD.</li>
            </ul>
          </div>
        </div>
      `,
    });
  }
}

module.exports = new Mailer();
