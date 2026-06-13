/**
 * Port dari PHP TrendService.php
 */
class TrendService {
  calculate(currentPpm, previousPpm) {
    if (previousPpm === null || previousPpm === undefined) {
      return { previous_co2_ppm: null, delta_co2_ppm: null, co2_trend: 'STABIL' };
    }

    const delta = currentPpm - previousPpm;
    let trend = 'STABIL';
    if (delta > 1000) trend = 'NAIK';
    else if (delta < -1000) trend = 'TURUN';

    return {
      previous_co2_ppm: previousPpm,
      delta_co2_ppm: delta,
      co2_trend: trend,
    };
  }
}

module.exports = new TrendService();
