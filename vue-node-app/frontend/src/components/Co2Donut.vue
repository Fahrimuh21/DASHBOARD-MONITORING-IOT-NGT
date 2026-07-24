<template>
  <div
    class="co2-donut"
    :class="riskClass"
    :style="{
      '--co2-fill': gaugeProgress
    }"
  >
    <div class="co2-donut-center">
      <strong>{{ ppmLabel }}</strong>
      <small>ppm</small>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  ppm: { type: [Number, String], default: null },
  percent: { type: [Number, String], default: null },
  riskClass: { type: String, default: '' },
  isOnline: { type: Boolean, default: true }
})

const ppmLabel = computed(() => {
  if (props.ppm === null || props.ppm === undefined) return '-'
  return Number(props.ppm).toLocaleString('id-ID', { maximumFractionDigits: 0 })
})

const co2Status = computed(() => {
  if (!props.isOnline || props.ppm === null || props.riskClass === 'risk-offline') {
    return { gaugeColor: '#64748b' }
  }
  if (props.riskClass === 'risk-high') {
    return { gaugeColor: '#ef4444' }
  }
  if (props.riskClass === 'risk-medium') {
    return { gaugeColor: '#f59e0b' }
  }
  return { gaugeColor: '#22c55e' }
})

const MAX_PPM = 3000
const gaugeProgress = computed(() => {
  const value = Math.min(Math.max(Number(props.ppm) || 0, 0), MAX_PPM)
  return `${(value / MAX_PPM) * 100}%`
})
</script>
