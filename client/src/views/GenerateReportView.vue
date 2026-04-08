<script setup>
import { computed, ref } from 'vue';
import AppShell from '../components/AppShell.vue';
import SampleCasesPanel from '../components/SampleCasesPanel.vue';
import ReportOutputPanel from '../components/ReportOutputPanel.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import { useReportStore } from '../stores/reports';

const reports = useReportStore();

const rawInput = ref('');
const error = ref('');
const success = ref('');

const activeReport = computed(() => reports.editableReport || reports.generatedReport);
const activeMeta = computed(() => reports.generatedMeta);

function ensureValidInput() {
  if (rawInput.value.trim().length < 15) {
    error.value = 'Please provide at least 15 characters of bug details.';
    return false;
  }
  return true;
}

async function onGenerate() {
  error.value = '';
  success.value = '';

  if (!ensureValidInput()) return;

  try {
    await reports.generateReport(rawInput.value.trim());
    success.value = 'Report generated. You can edit fields before saving.';
  } catch (err) {
    error.value = err?.response?.data?.error?.message || 'AI generation failed. Please try again.';
  }
}

async function onRegenerateFields(fields) {
  error.value = '';
  success.value = '';

  if (!ensureValidInput()) return;

  if (!Array.isArray(fields) || !fields.length) {
    error.value = 'Select at least one section to regenerate.';
    return;
  }

  try {
    await reports.regenerateReportFields(rawInput.value.trim(), fields);
    success.value = `Regenerated ${fields.length} selected section(s). Other edits were preserved.`;
  } catch (err) {
    error.value = err?.response?.data?.error?.message || 'Unable to regenerate selected sections.';
  }
}

async function onSave() {
  error.value = '';
  success.value = '';

  if (!ensureValidInput()) return;

  try {
    await reports.saveGeneratedReport(rawInput.value.trim());
    success.value = 'Report saved successfully to history.';
  } catch (err) {
    error.value = err?.response?.data?.error?.message || 'Unable to save report.';
  }
}

function useSample(content) {
  rawInput.value = content;
}

function onUpdateField({ field, value }) {
  reports.updateEditableField(field, value);
}

function onResetEdits() {
  reports.resetEditableReport();
  success.value = 'Edits reset to latest AI-generated version.';
}
</script>

<template>
  <AppShell
    title="Generate Report"
    subtitle="Turn raw logs, messy notes, and incomplete repro details into a professional QA report."
  >
    <section class="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
      <div class="space-y-4">
        <article class="panel p-4">
          <div class="mb-2 flex items-center justify-between">
            <h2 class="font-display text-lg font-semibold text-ink">Raw Bug Input</h2>
            <p class="text-xs text-slate-500">Paste logs, errors, or tester notes</p>
          </div>

          <textarea
            v-model="rawInput"
            rows="16"
            class="w-full rounded-xl border border-slate-300 p-3 text-sm leading-6"
            placeholder="Example: After password reset, login returns 401 with Invalid Credentials..."
          />

          <div class="mt-3 flex flex-wrap gap-2">
            <button class="btn-primary" :disabled="reports.generating || reports.regenerating" @click="onGenerate">
              {{ reports.generating ? 'Generating...' : 'Generate Report' }}
            </button>
            <button class="btn-secondary" :disabled="!activeReport || reports.saving" @click="onSave">
              {{ reports.saving ? 'Saving...' : 'Save Report' }}
            </button>
          </div>

          <div class="mt-3 flex min-h-6 items-center">
            <LoadingSpinner v-if="reports.generating || reports.regenerating">
              {{ reports.regenerating ? 'Regenerating selected sections...' : 'AI is analyzing your bug input...' }}
            </LoadingSpinner>
            <p v-else-if="error" class="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{{ error }}</p>
            <p v-else-if="success" class="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{{ success }}</p>
          </div>
        </article>

        <SampleCasesPanel @choose="useSample" />
      </div>

      <ReportOutputPanel
        :report="activeReport"
        :editable="Boolean(activeReport)"
        :generation-meta="activeMeta"
        :regenerate-loading="reports.regenerating"
        @update-field="onUpdateField"
        @reset-edits="onResetEdits"
        @regenerate-fields="onRegenerateFields"
      />
    </section>
  </AppShell>
</template>
