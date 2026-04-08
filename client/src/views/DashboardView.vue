<script setup>
import { computed, onMounted } from 'vue';
import AppShell from '../components/AppShell.vue';
import StatCard from '../components/StatCard.vue';
import SeverityBadge from '../components/SeverityBadge.vue';
import EmptyState from '../components/EmptyState.vue';
import { useReportStore } from '../stores/reports';

const reports = useReportStore();

onMounted(async () => {
  await reports.fetchSummary();
});

const severityCards = computed(() => Object.entries(reports.summary.severityBreakdown || {}));
</script>

<template>
  <AppShell title="Dashboard" subtitle="Track bug report activity and triage load at a glance.">
    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Total Reports" :value="reports.summary.totalReports" caption="Saved in your workspace" />
      <StatCard label="Critical" :value="reports.summary.severityBreakdown.Critical" caption="High-impact issues" />
      <StatCard label="High" :value="reports.summary.severityBreakdown.High" caption="Core workflow problems" />
      <div class="panel flex items-center justify-center p-5">
        <RouterLink class="btn-primary" to="/generate">Generate New Report</RouterLink>
      </div>
    </section>

    <section class="grid gap-4 lg:grid-cols-2">
      <article class="panel p-5">
        <h2 class="font-display text-xl font-semibold text-ink">Reports by Severity</h2>
        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          <div v-for="entry in severityCards" :key="entry[0]" class="rounded-xl border border-slate-200 p-3">
            <div class="flex items-center justify-between">
              <SeverityBadge :value="entry[0]" />
              <span class="font-display text-2xl font-semibold">{{ entry[1] }}</span>
            </div>
          </div>
        </div>
      </article>

      <article class="panel p-5">
        <h2 class="font-display text-xl font-semibold text-ink">Recent Reports</h2>
        <div v-if="!reports.summary.recentReports?.length" class="mt-4">
          <EmptyState title="No reports yet" message="Generate and save your first AI bug report to populate dashboard insights." />
        </div>

        <div v-else class="mt-4 space-y-3">
          <RouterLink
            v-for="item in reports.summary.recentReports"
            :key="item.id"
            :to="`/history/${item.id}`"
            class="block rounded-xl border border-slate-200 p-3 transition hover:border-slate-400"
          >
            <div class="flex items-center justify-between gap-3">
              <p class="font-semibold text-slate-800">{{ item.bug_title }}</p>
              <SeverityBadge :value="item.severity" />
            </div>
            <p class="mt-1 text-xs text-slate-500">{{ new Date(item.created_at).toLocaleString() }}</p>
          </RouterLink>
        </div>
      </article>
    </section>
  </AppShell>
</template>
