<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const router = useRouter();

const form = ref({ email: '', password: '' });
const error = ref('');

async function onSubmit() {
  error.value = '';
  try {
    await auth.login(form.value);
    router.push('/dashboard');
  } catch (err) {
    error.value = err?.response?.data?.error?.message || 'Unable to login. Please try again.';
  }
}
</script>

<template>
  <div class="mx-auto flex min-h-screen max-w-md items-center px-6">
    <div class="panel w-full p-8">
      <p class="font-display text-3xl font-semibold text-ink">Welcome Back</p>
      <p class="mt-1 text-sm text-slate-600">Login to continue to your BugSense workspace.</p>

      <form class="mt-6 space-y-4" @submit.prevent="onSubmit">
        <label class="block">
          <span class="field-title">Email</span>
          <input v-model="form.email" type="email" required class="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
        </label>

        <label class="block">
          <span class="field-title">Password</span>
          <input v-model="form.password" type="password" required class="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
        </label>

        <p v-if="error" class="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{{ error }}</p>

        <button type="submit" class="btn-primary w-full" :disabled="auth.loading">
          {{ auth.loading ? 'Signing in...' : 'Login' }}
        </button>
      </form>

      <p class="mt-4 text-sm text-slate-600">
        New to BugSense?
        <RouterLink to="/register" class="font-semibold text-slate-900">Create account</RouterLink>
      </p>
    </div>
  </div>
</template>
