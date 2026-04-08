<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
});

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const nav = [
  { name: 'Dashboard', to: '/dashboard' },
  { name: 'Generate', to: '/generate' },
  { name: 'History', to: '/history' },
];

const initials = computed(() => {
  const name = auth.user?.name || 'U';
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
});

function logout() {
  auth.logout();
  router.push('/login');
}
</script>

<template>
  <div class="min-h-screen">
    <div class="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8">
      <aside class="panel h-fit p-4">
        <div class="mb-8">
          <p class="font-display text-2xl font-semibold text-ink">BugSense</p>
          <p class="text-xs text-slate-500">AI Bug Report Assistant</p>
        </div>

        <nav class="space-y-1">
          <RouterLink
            v-for="item in nav"
            :key="item.to"
            :to="item.to"
            class="block rounded-xl px-3 py-2 text-sm font-medium transition"
            :class="route.path === item.to ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'"
          >
            {{ item.name }}
          </RouterLink>
        </nav>

        <div class="mt-10 border-t border-slate-200 pt-4">
          <div class="mb-3 flex items-center gap-3">
            <div class="flex h-9 w-9 items-center justify-center rounded-full bg-accentSoft text-sm font-bold text-accent">
              {{ initials }}
            </div>
            <div>
              <p class="text-sm font-semibold">{{ auth.user?.name }}</p>
              <p class="text-xs text-slate-500">{{ auth.user?.email }}</p>
            </div>
          </div>
          <button class="btn-secondary w-full" @click="logout">Logout</button>
        </div>
      </aside>

      <main class="space-y-6">
        <header class="panel p-5">
          <p class="text-xs font-semibold uppercase tracking-wider text-accent">Workspace</p>
          <h1 class="font-display text-2xl font-semibold text-ink">{{ title }}</h1>
          <p class="mt-1 text-sm text-slate-600">{{ subtitle }}</p>
        </header>

        <slot />
      </main>
    </div>
  </div>
</template>
