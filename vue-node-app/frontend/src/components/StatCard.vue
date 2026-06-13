<script setup>
defineProps({
  title: String,
  value: [String, Number],
  unit: String,
  type: {
    type: String,
    default: 'co2'
  }
})
</script>

<template>
  <article class="metric-card" :class="type">
    <div class="stat-card-header">
      <small class="field-label">{{ title }}</small>
      <slot name="icon" />
    </div>

    <div class="stat-value-wrap">
      <strong>{{ value }} <span style="font-size:14px;">{{ unit }}</span></strong>
    </div>
  </article>
</template>
