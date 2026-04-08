<script setup>
import { ref } from 'vue';

const props = defineProps({
  title: { type: String, required: true },
  content: { type: [String, Array], required: true },
});

const copied = ref(false);

async function copyField() {
  const text = Array.isArray(props.content) ? props.content.join('\n') : String(props.content);
  await navigator.clipboard.writeText(text);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 1200);
}
</script>

<template>
  <section class="rounded-xl border border-slate-200 p-4">
    <div class="mb-2 flex items-center justify-between gap-3">
      <h3 class="field-title">{{ title }}</h3>
      <button class="btn-ghost text-xs" @click="copyField">{{ copied ? 'Copied' : 'Copy' }}</button>
    </div>

    <ul v-if="Array.isArray(content)" class="list-inside list-decimal space-y-1 text-sm text-slate-700">
      <li v-for="(item, index) in content" :key="`${title}-${index}`">{{ item }}</li>
    </ul>
    <p v-else class="text-sm leading-6 text-slate-700">{{ content }}</p>
  </section>
</template>
