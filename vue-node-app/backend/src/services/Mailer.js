const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: parseInt(process.env.SMTP_PORT || '587') === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.SMTP_FROM || process.env.SMTP_USER;

class Mailer {
  async sendOtp(toEmail, otp, purpose) {
    const subject = purpose === 'reset'
      ? 'Kode OTP Reset Password - Naspiontech'
      : 'Kode Verifikasi Email - Naspiontech';

    const intro = purpose === 'reset'
      ? 'Gunakan kode berikut untuk mereset password akun Naspiontech Anda:'
      : 'Gunakan kode berikut untuk memverifikasi email akun Naspiontech Anda:';

    await transporter.sendMail({
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
}

module.exports = new Mailer();
