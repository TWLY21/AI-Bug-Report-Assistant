<script setup>
import { onMounted, ref } from 'vue';
import AppShell from '../components/AppShell.vue';
import SeverityBadge from '../components/SeverityBadge.vue';
import EmptyState from '../components/EmptyState.vue';
import { useReportStore } from '../stores/reports';

const reports = useReportStore();

const filters = ref({
  search: '',
  severity: '',
});

const loading = ref(false);
const error = ref('');

async function loadReports() {
  loading.value = true;
  error.value = '';

  try {
    const params = {
      search: filters.value.search || undefined,
      severity: filters.value.severity || undefined,
    };
    await reports.fetchHistory(params);
  } catch (err) {
    error.value = err?.response?.data?.error?.message || 'Unable to load report history.';
  } finally {
    loading.value = false;
  }
}

async function removeReport(id) {
  if (!window.confirm('Delete this report? This action cannot be undone.')) return;
  try {
    await reports.deleteReport(id);
  } catch (err) {
    error.value = err?.response?.data?.error?.message || 'Delete failed.';
  }
}

onMounted(loadReports);
</script>

<template>
  <AppShell title="History" subtitle="Search, reopen, and manage your generated bug reports.">
    <section class="panel p-4">
      <div class="grid gap-3 md:grid-cols-[1fr_180px_auto]">
        <input
          v-model="filters.search"
          placeholder="Search by title or summary"
          class="rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
        />

        <select v-model="filters.severity" class="rounded-xl border border-slate-300 px-3 py-2.5 text-sm">
          <option value="">All Severities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>

        <button class="btn-primary" @click="loadReports">Apply Filters</button>
      </div>

      <p v-if="error" class="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{{ error }}</p>
    </section>

    <section v-if="loading" class="panel p-8 text-sm text-slate-600">Loading history...</section>

    <section v-else-if="!reports.history.length">
      <EmptyState title="No matching reports" message="Try different filters or generate a new report." />
    </section>

    <section v-else class="space-y-3">
      <article v-for="item in reports.history" :key="item.id" class="panel p-4">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 class="font-display text-lg font-semibold text-ink">{{ item.bugTitle }}</h3>
            <p class="mt-1 line-clamp-2 text-sm text-slate-600">{{ item.summary }}</p>
            <p class="mt-2 text-xs text-slate-500">Saved {{ new Date(item.createdAt).toLocaleString() }}</p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <SeverityBadge :value="item.severity" />
            <SeverityBadge :value="item.priority" />
          </div>
        </div>

        <div class="mt-3 flex gap-2">
          <RouterLink class="btn-secondary" :to="`/history/${item.id}`">Open</RouterLink>
          <button class="btn-ghost text-rose-700 hover:bg-rose-50" @click="removeReport(item.id)">Delete</button>
        </div>
      </article>
    </section>
  </AppShell>
</template>
