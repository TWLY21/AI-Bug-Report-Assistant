<script setup>
defineProps({
  title: { type: String, required: true },
  message: { type: String, required: true },
});
</script>

<template>
  <div class="panel p-10 text-center">
    <p class="font-display text-xl font-semibold text-ink">{{ title }}</p>
    <p class="mx-auto mt-2 max-w-md text-sm text-slate-600">{{ message }}</p>
    <div class="mt-4">
      <slot />
    </div>
  </div>
</template>
