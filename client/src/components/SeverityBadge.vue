<script setup>
import { computed } from 'vue';

const props = defineProps({
  value: { type: String, required: true },
  kind: { type: String, default: 'severity' },
});

const classes = computed(() => {
  const map = {
    Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
    High: 'bg-orange-50 text-orange-700 border-orange-200',
    Critical: 'bg-rose-50 text-rose-700 border-rose-200',
    Urgent: 'bg-rose-100 text-rose-800 border-rose-300',
  };

  return map[props.value] || 'bg-slate-100 text-slate-700 border-slate-200';
});
</script>

<template>
  <span class="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold" :class="classes">
    {{ value }}
  </span>
</template>
