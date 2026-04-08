<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppShell from '../components/AppShell.vue';
import ReportOutputPanel from '../components/ReportOutputPanel.vue';
import { useReportStore } from '../stores/reports';

const route = useRoute();
const router = useRouter();
const reports = useReportStore();

const loading = ref(false);
const error = ref('');

async function loadReport() {
  loading.value = true;
  error.value = '';
  try {
    await reports.fetchReportById(route.params.id);
  } catch (err) {
    error.value = err?.response?.data?.error?.message || 'Unable to load report.';
  } finally {
    loading.value = false;
  }
}

async function removeCurrentReport() {
  if (!reports.selectedReport?.id) return;
  if (!window.confirm('Delete this report?')) return;

  try {
    await reports.deleteReport(reports.selectedReport.id);
    router.push('/history');
  } catch (err) {
    error.value = err?.response?.data?.error?.message || 'Delete failed.';
  }
}

onMounted(loadReport);
</script>

<template>
  <AppShell title="Report Detail" subtitle="Review generated output and original raw context.">
    <section v-if="loading" class="panel p-8 text-sm text-slate-600">Loading report...</section>

    <section v-else-if="error" class="panel p-6">
      <p class="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{{ error }}</p>
      <RouterLink to="/history" class="btn-secondary mt-4 inline-flex">Back to History</RouterLink>
    </section>

    <section v-else-if="reports.selectedReport" class="grid gap-4 xl:grid-cols-[1fr_1fr]">
      <article class="panel p-4">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="font-display text-lg font-semibold text-ink">Original Input</h2>
          <button class="btn-ghost text-rose-700 hover:bg-rose-50" @click="removeCurrentReport">Delete Report</button>
        </div>
        <p class="whitespace-pre-wrap rounded-xl border border-slate-200 p-3 text-sm leading-6 text-slate-700">
          {{ reports.selectedReport.rawInput }}
        </p>
      </article>

      <ReportOutputPanel :report="reports.selectedReport" />
    </section>
  </AppShell>
</template>
