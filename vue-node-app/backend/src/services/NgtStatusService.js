/**
 * Port dari PHP NgtStatusService.php
 * Mengevaluasi CO2 PPM dan mengembalikan status NGT, risk level, dan pesan klinis
 */
class NgtStatusService {
  evaluate(co2Ppm) {
    if (co2Ppm < 5000) {
      return {
        ngt_status: 'TERINDIKASI_NON_RESPIRATORIK',
        risk_level: 'LOW',
        message:
          'CO2 tidak menunjukkan indikasi kuat masuk saluran napas. Tetap lakukan verifikasi sesuai prosedur klinis.',
      };
    }

    if (co2Ppm < 20000) {
      return {
        ngt_status: 'PERLU_VERIFIKASI',
        risk_level: 'MEDIUM',
        message:
          'CO2 terdeteksi pada rentang menengah. Perlu verifikasi ulang posisi selang NGT sesuai prosedur klinis.',
      };
    }

    return {
      ngt_status: 'RISIKO_MALPOSISI_RESPIRATORIK',
      risk_level: 'HIGH',
      message:
        'CO2 tinggi terdeteksi. Terdapat indikasi risiko selang NGT masuk ke saluran napas. Hentikan penggunaan dan lakukan verifikasi klinis.',
    };
  }
}

module.exports = new NgtStatusService();
