<script setup>
import { computed } from 'vue'

const props = defineProps({
  co2: {
    type: Number,
    default: null
  },
  isOnline: {
    type: Boolean,
    default: false
  }
})

const co2Status = computed(() => {
  if (!props.isOnline || props.co2 === null) {
    return {
      label: 'Device Offline',
      badgeClass: 'status-offline',
      gaugeColor: '#64748b'
    }
  }

  if (props.co2 < 1000) {
    return {
      label: 'Status Aman',
      badgeClass: 'badge-safe',
      gaugeColor: '#22c55e'
    }
  }

  if (props.co2 <= 2000) {
    return {
      label: 'Status Waspada',
      badgeClass: 'badge-warning',
      gaugeColor: '#f59e0b'
    }
  }

  return {
    label: 'Status Bahaya',
    badgeClass: 'badge-danger',
    gaugeColor: '#ef4444'
  }
})
</script>

<template>
  <span class="status-badge" :class="co2Status.badgeClass">
    {{ co2Status.label }}
  </span>
</template>
