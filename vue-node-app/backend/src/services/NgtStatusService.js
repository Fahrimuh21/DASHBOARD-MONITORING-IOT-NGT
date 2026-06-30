class NgtStatusService {
  evaluate(co2Ppm) {
    if (co2Ppm < 250) {
      return {
        ngt_status: 'NORMAL',
        risk_level: 'LOW',
        message: 'CO2 normal'
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