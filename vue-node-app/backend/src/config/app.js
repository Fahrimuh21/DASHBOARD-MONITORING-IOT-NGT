require('dotenv').config();

module.exports = {
  APP_NAME: 'NGT-Safe CO2',
  APP_TITLE: 'Monitoring Selang NGT Berbasis CO2',
  OFFLINE_SECONDS: parseInt(process.env.OFFLINE_SECONDS || '15'),
  CLINICAL_DISCLAIMER:
    'Alat ini merupakan prototipe skrining awal dan tidak menggantikan prosedur verifikasi klinis seperti pH aspirat, radiografi, atau prosedur rumah sakit. Threshold memerlukan kalibrasi dan validasi lebih lanjut.',
};
