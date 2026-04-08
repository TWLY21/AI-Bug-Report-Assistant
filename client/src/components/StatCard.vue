<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  caption: { type: String, default: '' },
});
</script>

<template>
  <article class="panel p-5">
    <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">{{ label }}</p>
    <p class="mt-2 font-display text-3xl font-semibold text-ink">{{ value }}</p>
    <p v-if="caption" class="mt-1 text-sm text-slate-500">{{ caption }}</p>
  </article>
</template>
