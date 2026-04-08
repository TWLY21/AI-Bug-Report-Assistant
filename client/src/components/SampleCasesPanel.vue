<script setup>
import { sampleBugInputs } from '../constants/sample-inputs';

const emit = defineEmits(['choose']);
</script>

<template>
  <aside class="panel p-4">
    <h2 class="font-display text-lg font-semibold text-ink">Example Cases</h2>
    <p class="mt-1 text-sm text-slate-600">Use these to demo the generation flow instantly.</p>

    <div class="mt-4 space-y-2">
      <button
        v-for="item in sampleBugInputs"
        :key="item.id"
        class="w-full rounded-xl border border-slate-200 bg-white p-3 text-left text-sm transition hover:border-slate-400 hover:bg-slate-50"
        @click="emit('choose', item.content)"
      >
        <p class="font-semibold text-slate-800">{{ item.title }}</p>
        <p class="mt-1 line-clamp-2 text-xs text-slate-500">{{ item.content }}</p>
      </button>
    </div>
  </aside>
</template>
