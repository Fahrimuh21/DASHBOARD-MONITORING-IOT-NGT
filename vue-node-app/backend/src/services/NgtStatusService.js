class NgtStatusService {
  evaluate(co2Ppm) {
    if (co2Ppm < 5000) {
      return {
        ngt_status: 'NORMAL',
        risk_level: 'LOW',
        message: 'CO2 normal'
      };
    }

    if (co2Ppm < 20000) {
      return {
        ngt_status: 'WARNING',
        risk_level: 'MEDIUM',
        message: 'Perlu verifikasi NGT'
      };
    }

    return {
      ngt_status: 'DANGER',
      risk_level: 'HIGH',
      message: 'Risiko tinggi NGT'
    };
  }
}

module.exports = new NgtStatusService();