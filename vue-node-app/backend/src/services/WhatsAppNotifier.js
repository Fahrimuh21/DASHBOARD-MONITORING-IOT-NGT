const FONNTE_API_URL = process.env.FONNTE_API_URL || 'https://api.fonnte.com/send';
const FONNTE_TOKEN = process.env.FONNTE_TOKEN;

function normalizePhone(phone) {
  if (!phone) return null;

  const digits = String(phone).replace(/\D/g, '');
  if (!digits) return null;

  if (digits.startsWith('62')) return digits;
  if (digits.startsWith('0')) return `62${digits.slice(1)}`;

  return digits;
}

class WhatsAppNotifier {
  async sendMessage(phone, message) {
    const target = normalizePhone(phone);

    if (!target) {
      console.warn('[WA] Nomor WhatsApp kosong/tidak valid. Pesan dilewati.');
      return null;
    }

    if (!FONNTE_TOKEN) {
      console.warn('[WA] FONNTE_TOKEN belum diatur. WhatsApp dilewati.');
      return null;
    }

    const body = new URLSearchParams();
    body.set('target', target);
    body.set('message', message);

    const response = await fetch(FONNTE_API_URL, {
      method: 'POST',
      headers: {
        Authorization: FONNTE_TOKEN,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(`Fonnte HTTP ${response.status}: ${responseText}`);
    }

    console.log(`[WA] Notifikasi terkirim ke ${target}`);
    return responseText;
  }

  async sendDangerAlert(phone, { recipientName, deviceName, ppm, message, occurredAt }) {
    const greeting = recipientName ? `Yth. ${recipientName},` : 'Yth. Bapak/Ibu,';
    const text = [
      '*🔴Posisi selang kemungkinan berada di saluran pernapasan - Naspiontech*',
      '',
      greeting,
      `Alat "${deviceName}" mendeteksi kondisi berbahaya.`,
      '',
      `Kadar CO2: ${ppm} ppm`,
      `Status: ${message}`,
      `Waktu: ${occurredAt}`,
      ' ',
      'Risiko: Makanan atau obat dapat masuk ke paru-paru (aspirasi).',
      ' ',
      '*Tindakan Segera*',
      ` `,
      '- Hentikan pemberian nutrisi dan obat melalui selang.',
      '- Jangan menggeser atau melepas selang secara mandiri.',
      '- Posisikan pasien setengah duduk.',
      '- Hubungi tenaga kesehatan untuk memastikan posisi selang.',
      '- Bila pasien sesak napas berat, kebiruan, atau tidak sadar, segera ke IGD.',
    ].join('\n');

    return this.sendMessage(phone, text);
  }
}

module.exports = new WhatsAppNotifier();
