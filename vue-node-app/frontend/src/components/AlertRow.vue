<template>
  <div class="alert-row" :class="riskClass">
    <span class="status-dot" :class="riskClass"></span>
    <div>
      <strong>{{ alert.title }}</strong>
      <small style="display:block; color:var(--text-soft); font-size:12px; margin-top:2px;">
        {{ alert.device_name }} &middot; {{ formattedDate }}
      </small>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  alert: { type: Object, required: true }
})

const riskClass = computed(() => {
  const level = props.alert.level?.toUpperCase()
  if (level === 'HIGH') return 'risk-high'
  if (level === 'MEDIUM') return 'risk-medium'
  return 'risk-low'
})

const formattedDate = computed(() => {
  const date = new Date(props.alert.created_at)
  if (isNaN(date)) return props.alert.created_at
  return date.toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
})
</script>
