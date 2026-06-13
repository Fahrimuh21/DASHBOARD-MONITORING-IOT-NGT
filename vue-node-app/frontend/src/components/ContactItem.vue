<template>
  <article class="contact-item">
    <div class="contact-avatar">{{ initial }}</div>
    <div style="flex: 1;">
      <strong style="display:block; font-size:14px;">{{ contact.name || '-' }}</strong>
      <span style="font-size:12px; color:var(--text-soft);">{{ contact.position || 'Perawat' }}</span>
    </div>
    <a :href="`tel:${contact.phone || ''}`" style="font-size:13px; font-weight:600;">
      {{ contact.phone || '-' }}
    </a>
  </article>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  contact: { type: Object, required: true }
})

const initial = computed(() => {
  return (props.contact.name || 'P').charAt(0).toUpperCase()
})
</script>
