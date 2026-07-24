const db = require('../config/db');

const WINDOW_SAMPLES = parseInt(process.env.BASELINE_WINDOW_SAMPLES || '30');
const MAX_STABLE_RANGE_PPM = parseFloat(process.env.BASELINE_MAX_STABLE_RANGE_PPM || '10');
const MAX_STABLE_SLOPE_PPM_MIN = parseFloat(process.env.BASELINE_MAX_STABLE_SLOPE_PPM_MIN || '3');
const MIN_BASELINE_PPM = parseFloat(process.env.BASELINE_MIN_PPM || '400');
const MAX_BASELINE_PPM = parseFloat(process.env.BASELINE_MAX_PPM || '2000');

let schemaReady = false;

const DEVICE_COLUMNS = {
  live_co2_ppm: 'DECIMAL(10,2) NULL',
  live_co2_percent: 'DECIMAL(8,4) NULL',
  live_previous_co2_ppm: 'DECIMAL(10,2) NULL',
  live_delta_co2_ppm: 'DECIMAL(10,2) NULL',
  live_co2_trend: 'VARCHAR(30) NULL',
  live_ngt_status: 'VARCHAR(80) NULL',
  live_risk_level: "ENUM('LOW', 'MEDIUM', 'HIGH') NULL",
  live_message: 'TEXT NULL',
  live_baseline_ppm: 'DECIMAL(10,2) NULL',
  live_deviation_ppm: 'DECIMAL(10,2) NULL',
  live_deviation_percent: 'DECIMAL(8,2) NULL',
  live_baseline_status: 'VARCHAR(32) NULL',
  live_baseline_valid: 'TINYINT(1) NOT NULL DEFAULT 0',
  live_baseline_state: 'VARCHAR(32) NULL',
  live_baseline_range_ppm: 'DECIMAL(10,2) NULL',
  live_baseline_stddev_ppm: 'DECIMAL(10,2) NULL',
  live_baseline_slope_ppm_min: 'DECIMAL(10,2) NULL',
};

const READING_COLUMNS = {
  baseline_ppm: 'DECIMAL(10,2) NULL',
  deviation_ppm: 'DECIMAL(10,2) NULL',
  deviation_percent: 'DECIMAL(8,2) NULL',
  baseline_status: 'VARCHAR(32) NULL',
  baseline_valid: 'TINYINT(1) NOT NULL DEFAULT 0',
  baseline_state: 'VARCHAR(32) NULL',
  baseline_range_ppm: 'DECIMAL(10,2) NULL',
  baseline_stddev_ppm: 'DECIMAL(10,2) NULL',
  baseline_slope_ppm_min: 'DECIMAL(10,2) NULL',
};

function toNullableNumber(value) {
  if (value === undefined || value === null || value === '') return null;
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeBoolean(value) {
  return value === true || value === 'true' || value === 1 || value === '1';
}

function statusFromDeviation(deviationPercent) {
  if (deviationPercent === null || deviationPercent === undefined || !Number.isFinite(deviationPercent)) {
    return 'MENUNGGU_BASELINE';
  }

  const absPercent = Math.abs(deviationPercent);
  if (absPercent <= 5) return 'SANGAT_STABIL';
  if (absPercent <= 10) return 'STABIL';
  if (absPercent <= 20) return 'PERLU_OBSERVASI';
  return 'DEVIASI_TINGGI';
}

function calculateDeviation(currentPpm, baselinePpm) {
  if (!baselinePpm || baselinePpm <= 0) {
    return {
      baseline_ppm: null,
      current_ppm: currentPpm,
      deviation_ppm: null,
      deviation_percent: null,
      baseline_stddev_ppm: null,
      baseline_status: 'MENUNGGU_BASELINE',
    };
  }

  const deviationPpm = currentPpm - baselinePpm;
  const deviationPercent = (deviationPpm / baselinePpm) * 100;

  return {
    baseline_ppm: baselinePpm,
    current_ppm: currentPpm,
    deviation_ppm: deviationPpm,
    deviation_percent: deviationPercent,
    baseline_stddev_ppm: null,
    baseline_status: statusFromDeviation(deviationPercent),
  };
}

class BaselineService {
  async ensureSchema() {
    if (schemaReady) return;

    await this.ensureColumns('devices', DEVICE_COLUMNS);
    await this.ensureColumns('readings', READING_COLUMNS);

    schemaReady = true;
  }

  async ensureColumns(tableName, columns) {
    const [existingColumns] = await db.execute(
      `SELECT COLUMN_NAME
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = ?
         AND COLUMN_NAME IN (${Object.keys(columns).map(() => '?').join(', ')})`,
      [tableName, ...Object.keys(columns)]
    );

    const existing = new Set(existingColumns.map((column) => column.COLUMN_NAME));

    for (const [columnName, definition] of Object.entries(columns)) {
      if (!existing.has(columnName)) {
        await db.execute(`ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${definition}`);
      }
    }
  }

  async calculate(deviceId, currentPpm, metadata = {}) {
    await this.ensureSchema();

    const sensorBaseline = toNullableNumber(metadata.baseline_ppm);
    const sensorDelta = toNullableNumber(metadata.delta_ppm);
    const sensorStddev = toNullableNumber(metadata.stddev_ppm ?? metadata.baseline_stddev_ppm);
    const baselineValid = normalizeBoolean(metadata.baseline_valid) && sensorBaseline !== null;

    if (sensorBaseline !== null) {
      const baseline = calculateDeviation(currentPpm, sensorBaseline);
      return {
        ...baseline,
        deviation_ppm: sensorDelta !== null ? sensorDelta : baseline.deviation_ppm,
        deviation_percent: sensorDelta !== null ? (sensorDelta / sensorBaseline) * 100 : baseline.deviation_percent,
        baseline_status: statusFromDeviation(sensorDelta !== null ? (sensorDelta / sensorBaseline) * 100 : baseline.deviation_percent),
        baseline_valid: baselineValid,
        baseline_state: metadata.bench_state || (baselineValid ? 'BASELINE_SET' : 'WAIT_STABLE'),
        baseline_range_ppm: toNullableNumber(metadata.range_ppm),
        baseline_stddev_ppm: sensorStddev,
        baseline_slope_ppm_min: toNullableNumber(metadata.slope_ppm_min),
      };
    }

    const [rows] = await db.execute(
      `SELECT co2_ppm
       FROM readings
       WHERE device_id = ?
         AND co2_ppm IS NOT NULL
         AND co2_ppm BETWEEN ? AND ?
         AND (baseline_status IS NULL OR baseline_status IN ('SANGAT_STABIL', 'STABIL'))
       ORDER BY created_at DESC, id DESC
       LIMIT ?`,
      [deviceId, MIN_BASELINE_PPM, MAX_BASELINE_PPM, WINDOW_SAMPLES]
    );

    if (rows.length < Math.min(10, WINDOW_SAMPLES)) {
      return {
        ...calculateDeviation(currentPpm, null),
        baseline_valid: false,
        baseline_state: metadata.bench_state || 'WINDOW_FILL',
        baseline_range_ppm: toNullableNumber(metadata.range_ppm),
        baseline_stddev_ppm: sensorStddev,
        baseline_slope_ppm_min: toNullableNumber(metadata.slope_ppm_min),
      };
    }

    const values = rows.map((row) => parseFloat(row.co2_ppm)).filter(Number.isFinite);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;

    const slope = toNullableNumber(metadata.slope_ppm_min);
    const slopeOk = slope === null || Math.abs(slope) <= MAX_STABLE_SLOPE_PPM_MIN;
    const rangeOk = range <= MAX_STABLE_RANGE_PPM || rows.length >= WINDOW_SAMPLES;
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
    const stddev = Math.sqrt(variance);
    const baseline = calculateDeviation(currentPpm, mean);

    return {
      ...baseline,
      baseline_valid: rangeOk && slopeOk,
      baseline_state: rangeOk && slopeOk ? 'BASELINE_SET' : 'WAIT_STABLE',
      baseline_range_ppm: toNullableNumber(metadata.range_ppm) ?? range,
      baseline_stddev_ppm: sensorStddev ?? stddev,
      baseline_slope_ppm_min: slope,
    };
  }
}

module.exports = new BaselineService();
