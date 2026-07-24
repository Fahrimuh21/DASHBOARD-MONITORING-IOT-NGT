class NgtStatusService {
  /**
   * Evaluasi status NGT berdasarkan pembacaan CO2 dan nilai baseline.
   * - Ketika baseline = 0 / belum terbentuk: dianggap selang belum dipasang,
   *   sehingga CO2 dievaluasi sebagai 0 ppm (Status NORMAL / LOW risk).
   * - Ketika baseline > 0 (sudah terpasang & baseline valid):
   *   Batasan dari aman ke bahaya adalah (baseline_ppm + 800 ppm).
   */
  evaluate(co2Ppm, baseline = null) {
    const baselinePpm = baseline && baseline.baseline_ppm !== null && baseline.baseline_ppm !== undefined
      ? Number(baseline.baseline_ppm)
      : 0;

    const baselineValid = baseline && (baseline.baseline_valid === true || baseline.baseline_valid === 1 || baseline.baseline_valid === '1');

    // Jika baseline = 0 atau belum valid, selang dianggap belum terpasang (CO2 dianggap 0 ppm)
    if (!baselineValid || baselinePpm <= 0) {
      return {
        ngt_status: 'NORMAL',
        risk_level: 'LOW',
        message: 'Menunggu baseline'
      };
    }

    const dangerOffset = parseFloat(process.env.DANGER_THRESHOLD_OFFSET_PPM || '800');
    const threshold = baselinePpm + dangerOffset;

    if (co2Ppm < threshold) {
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
