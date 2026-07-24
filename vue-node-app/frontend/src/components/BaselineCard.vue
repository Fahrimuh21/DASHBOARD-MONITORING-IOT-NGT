<script setup>
import { computed } from 'vue'

const props = defineProps({
  baselinePpm: { type: [Number, String], default: null },
  currentPpm: { type: [Number, String], default: null },
  deviationPpm: { type: [Number, String], default: null },
  deviationPercent: { type: [Number, String], default: null },
  baselineStatus: { type: String, default: null },
  baselineValid: { type: [Boolean, Number], default: false },
  baselineState: { type: String, default: null },
})

const isValid = computed(() => {
  return props.baselineValid === true || props.baselineValid === 1 || props.baselineValid === '1'
})

const baselineLabel = computed(() => {
  if (!isValid.value || props.baselinePpm === null || props.baselinePpm === undefined) return '—'
  return Number(props.baselinePpm).toLocaleString('id-ID', { maximumFractionDigits: 0 })
})

const currentLabel = computed(() => {
  if (props.currentPpm === null || props.currentPpm === undefined) return '—'
  return Number(props.currentPpm).toLocaleString('id-ID', { maximumFractionDigits: 0 })
})

const deviationLabel = computed(() => {
  if (!isValid.value || props.deviationPpm === null || props.deviationPpm === undefined) return null
  const val = Number(props.deviationPpm)
  const sign = val > 0 ? '+' : ''
  return `${sign}${val.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`
})

const deviationPercentLabel = computed(() => {
  if (!isValid.value || props.deviationPercent === null || props.deviationPercent === undefined) return null
  const val = Number(props.deviationPercent)
  const sign = val > 0 ? '+' : ''
  return `${sign}${val.toFixed(1)}%`
})

const absDeviationPercent = computed(() => {
  if (props.deviationPercent === null || props.deviationPercent === undefined) return 0
  return Math.abs(Number(props.deviationPercent))
})

const progressWidth = computed(() => {
  // Cap at 30% for visual display
  return Math.min(absDeviationPercent.value / 30 * 100, 100)
})

const statusConfig = computed(() => {
  const status = props.baselineStatus

  if (!isValid.value || !status || status === 'MENUNGGU_BASELINE') {
    return {
      label: 'Menunggu Baseline',
      icon: '⏳',
      cssClass: 'baseline-waiting',
      colorVar: '--muted',
    }
  }

  switch (status) {
    case 'SANGAT_STABIL':
      return { label: 'Sangat Stabil', icon: '🟢', cssClass: 'baseline-sangat-stabil', colorVar: '--ok' }
    case 'STABIL':
      return { label: 'Stabil', icon: '🟢', cssClass: 'baseline-stabil', colorVar: '--ok' }
    case 'PERLU_OBSERVASI':
      return { label: 'Perlu Observasi', icon: '🟡', cssClass: 'baseline-observasi', colorVar: '--warn' }
    case 'DEVIASI_TINGGI':
      return { label: 'Deviasi Tinggi', icon: '🔴', cssClass: 'baseline-deviasi', colorVar: '--danger' }
    default:
      return { label: status.replace(/_/g, ' '), icon: '⚪', cssClass: 'baseline-waiting', colorVar: '--muted' }
  }
})

const stateHumanLabel = computed(() => {
  const state = props.baselineState
  if (!state) return null
  const map = {
    'STARTING': 'Memulai...',
    'SETTLING': 'Settling...',
    'WINDOW_FILL': 'Mengumpulkan data...',
    'WAIT_STABLE': 'Menunggu stabil...',
    'AUTO_HOLD': 'Hold stabil...',
    'FLUSH_AMBIENT': 'Flush ambient...',
    'BASELINE_SET': null,  // don't show when set
    'BASELINE_TIMEOUT': 'Timeout',
    'ENV_OUT_SPEC': 'Lingkungan di luar spec',
    'SENSOR_ERROR': 'Sensor error',
  }
  return map[state] !== undefined ? map[state] : state.replace(/_/g, ' ')
})
</script>

<template>
  <article class="metric-card baseline-card" :class="statusConfig.cssClass">
    <div class="stat-card-header">
      <small class="field-label">Nilai Awal PPM</small>
      <svg viewBox="0 0 24 24" class="icon-baseline">
        <path d="M2 20h20" />
        <path d="M5 20v-4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v4" />
        <path d="M11 20V8a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v12" />
        <path d="M17 20V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v16" />
      </svg>
    </div>

    <!-- Waiting state -->
    <div v-if="!isValid" class="baseline-waiting-state">
      <div class="baseline-waiting-pulse"></div>
      <span class="baseline-waiting-text">{{ stateHumanLabel || 'Menunggu baseline...' }}</span>
    </div>

    <!-- Active baseline state -->
    <div v-else class="baseline-active-state">
      <div class="baseline-main-value">
        <strong>{{ baselineLabel }}</strong>
        <span class="baseline-unit">ppm</span>
      </div>

      <div class="baseline-detail-row">
        <div class="baseline-detail-item">
          <span class="baseline-detail-label">Current</span>
          <span class="baseline-detail-value">{{ currentLabel }} <small>ppm</small></span>
        </div>
        <div class="baseline-detail-item deviation" :class="statusConfig.cssClass">
          <span class="baseline-detail-label">Deviasi</span>
          <span class="baseline-detail-value">
            <template v-if="deviationLabel">
              Δ {{ deviationLabel }} <small>({{ deviationPercentLabel }})</small>
            </template>
            <template v-else>—</template>
          </span>
        </div>
      </div>

      <div class="baseline-progress-wrap">
        <div class="baseline-progress-track">
          <div
            class="baseline-progress-fill"
            :class="statusConfig.cssClass"
            :style="{ width: progressWidth + '%' }"
          ></div>
        </div>
        <span class="baseline-progress-label">{{ absDeviationPercent.toFixed(1) }}%</span>
      </div>

      <div class="baseline-status-row" :class="statusConfig.cssClass">
        <span class="baseline-status-icon">{{ statusConfig.icon }}</span>
        <span class="baseline-status-label">{{ statusConfig.label }}</span>
      </div>
    </div>
  </article>
</template>
