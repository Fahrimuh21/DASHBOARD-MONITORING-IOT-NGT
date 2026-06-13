<template>
  <article class="metric-card" :class="colorClass">
    <span>{{ label }}</span>
    <strong>{{ value }}</strong>
    <small :class="badgeClass">{{ subtext }}</small>
  </article>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  subtext: { type: String, default: '' },
  colorClass: { type: String, default: '' },
  badgeClass: { type: String, default: '' }
})
</script>
