USE ngt_safe_co2;

ALTER TABLE devices
  ADD COLUMN live_co2_ppm DECIMAL(10,2) NULL AFTER last_seen_at,
  ADD COLUMN live_co2_percent DECIMAL(8,4) NULL AFTER live_co2_ppm,
  ADD COLUMN live_previous_co2_ppm DECIMAL(10,2) NULL AFTER live_co2_percent,
  ADD COLUMN live_delta_co2_ppm DECIMAL(10,2) NULL AFTER live_previous_co2_ppm,
  ADD COLUMN live_co2_trend VARCHAR(30) NULL AFTER live_delta_co2_ppm,
  ADD COLUMN live_ngt_status VARCHAR(80) NULL AFTER live_co2_trend,
  ADD COLUMN live_risk_level VARCHAR(20) NULL AFTER live_ngt_status,
  ADD COLUMN live_message TEXT NULL AFTER live_risk_level;
