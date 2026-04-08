<script setup>
import { computed, ref } from 'vue';
import ReportFieldCard from './ReportFieldCard.vue';
import SeverityBadge from './SeverityBadge.vue';
import { downloadFile, reportToMarkdown } from '../utils/exporters';

const props = defineProps({
  report: { type: Object, default: null },
  editable: { type: Boolean, default: false },
  generationMeta: { type: Object, default: () => ({}) },
  regenerateLoading: { type: Boolean, default: false },
});

const emit = defineEmits(['update-field', 'reset-edits', 'regenerate-fields']);

const copiedAll = ref(false);
const isEditing = ref(false);

const refreshFieldOptions = [
  { key: 'bugTitle', label: 'Bug Title' },
  { key: 'summary', label: 'Summary' },
  { key: 'module', label: 'Module' },
  { key: 'environment', label: 'Environment' },
  { key: 'preconditions', label: 'Preconditions' },
  { key: 'stepsToReproduce', label: 'Steps' },
  { key: 'expectedResult', label: 'Expected Result' },
  { key: 'actualResult', label: 'Actual Result' },
  { key: 'severity', label: 'Severity' },
  { key: 'priority', label: 'Priority' },
  { key: 'labels', label: 'Labels' },
  { key: 'possibleRootCause', label: 'Root Cause' },
  { key: 'additionalNotes', label: 'Additional Notes' },
];

const selectedRefreshFields = ref(refreshFieldOptions.map((item) => item.key));

const reportJson = computed(() => (props.report ? JSON.stringify(props.report, null, 2) : ''));
const stepsText = computed(() => (props.report?.stepsToReproduce || []).join('\n'));
const labelsText = computed(() => (props.report?.labels || []).join(', '));

const fallbackMessage = computed(() => {
  if (!props.generationMeta?.fallbackUsed) return '';
  const reason = props.generationMeta?.fallbackReason;
  return reason ? `Fallback report generated. Reason: ${reason}` : 'Fallback report generated.';
});

async function copyFullReport() {
  if (!props.report) return;
  await navigator.clipboard.writeText(reportJson.value);
  copiedAll.value = true;
  setTimeout(() => {
    copiedAll.value = false;
  }, 1200);
}

function exportMarkdown() {
  if (!props.report) return;
  const content = reportToMarkdown(props.report);
  downloadFile(content, 'bugsense-report.md', 'text/markdown;charset=utf-8');
}

function exportJson() {
  if (!props.report) return;
  downloadFile(reportJson.value, 'bugsense-report.json', 'application/json;charset=utf-8');
}

function updateText(field, event) {
  emit('update-field', { field, value: event.target.value });
}

function updateArrayFromLines(field, event) {
  const items = event.target.value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

  emit('update-field', { field, value: items.length ? items : ['Not specified'] });
}

function updateLabels(event) {
  const items = event.target.value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  emit('update-field', { field: 'labels', value: items.length ? items : ['Not specified'] });
}

function toggleAllFields() {
  selectedRefreshFields.value = refreshFieldOptions.map((item) => item.key);
}

function clearAllFields() {
  selectedRefreshFields.value = [];
}

function regenerateSelected() {
  emit('regenerate-fields', selectedRefreshFields.value);
}
</script>

<template>
  <div class="panel h-full p-4">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h2 class="font-display text-lg font-semibold text-ink">Structured Output</h2>
      <div class="flex flex-wrap gap-2">
        <button v-if="editable" class="btn-secondary" @click="isEditing = !isEditing">
          {{ isEditing ? 'Preview Mode' : 'Edit Mode' }}
        </button>
        <button v-if="editable && isEditing" class="btn-secondary" @click="emit('reset-edits')">Reset Edits</button>
        <button class="btn-secondary" @click="copyFullReport">{{ copiedAll ? 'Copied' : 'Copy Full Report' }}</button>
        <button class="btn-secondary" @click="exportMarkdown">Export Markdown</button>
        <button class="btn-secondary" @click="exportJson">Export JSON</button>
      </div>
    </div>

    <div v-if="generationMeta?.fallbackUsed" class="mb-3 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
      {{ fallbackMessage }}
    </div>

    <div v-if="!report" class="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
      Generated report will appear here after AI processing.
    </div>

    <div v-else class="mb-3 rounded-xl border border-slate-200 p-3">
      <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p class="field-title">Regenerate Selected Sections</p>
        <div class="flex gap-2">
          <button class="btn-ghost text-xs" @click="toggleAllFields">Select All</button>
          <button class="btn-ghost text-xs" @click="clearAllFields">Clear</button>
        </div>
      </div>
      <div class="grid gap-2 sm:grid-cols-2">
        <label v-for="option in refreshFieldOptions" :key="option.key" class="inline-flex items-center gap-2 text-sm text-slate-700">
          <input v-model="selectedRefreshFields" type="checkbox" :value="option.key" class="rounded border-slate-300" />
          <span>{{ option.label }}</span>
        </label>
      </div>
      <button class="btn-secondary mt-3" :disabled="!selectedRefreshFields.length || regenerateLoading" @click="regenerateSelected">
        {{ regenerateLoading ? 'Regenerating...' : 'Regenerate Selected Sections' }}
      </button>
    </div>

    <div v-if="report && isEditing" class="space-y-3">
      <div class="grid gap-3 md:grid-cols-2">
        <label class="block rounded-xl border border-slate-200 p-3">
          <span class="field-title">Severity</span>
          <select class="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2 text-sm" :value="report.severity" @change="updateText('severity', $event)">
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>
        </label>

        <label class="block rounded-xl border border-slate-200 p-3">
          <span class="field-title">Priority</span>
          <select class="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2 text-sm" :value="report.priority" @change="updateText('priority', $event)">
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Urgent</option>
          </select>
        </label>
      </div>

      <label class="block rounded-xl border border-slate-200 p-3">
        <span class="field-title">Bug Title</span>
        <input class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" :value="report.bugTitle" @input="updateText('bugTitle', $event)" />
      </label>

      <label class="block rounded-xl border border-slate-200 p-3">
        <span class="field-title">Summary</span>
        <textarea rows="3" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" :value="report.summary" @input="updateText('summary', $event)" />
      </label>

      <label class="block rounded-xl border border-slate-200 p-3">
        <span class="field-title">Module / Feature Area</span>
        <input class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" :value="report.module" @input="updateText('module', $event)" />
      </label>

      <label class="block rounded-xl border border-slate-200 p-3">
        <span class="field-title">Environment</span>
        <textarea rows="3" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" :value="report.environment" @input="updateText('environment', $event)" />
      </label>

      <label class="block rounded-xl border border-slate-200 p-3">
        <span class="field-title">Preconditions</span>
        <textarea rows="3" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" :value="report.preconditions" @input="updateText('preconditions', $event)" />
      </label>

      <label class="block rounded-xl border border-slate-200 p-3">
        <span class="field-title">Steps to Reproduce (one step per line)</span>
        <textarea rows="6" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" :value="stepsText" @input="updateArrayFromLines('stepsToReproduce', $event)" />
      </label>

      <label class="block rounded-xl border border-slate-200 p-3">
        <span class="field-title">Expected Result</span>
        <textarea rows="3" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" :value="report.expectedResult" @input="updateText('expectedResult', $event)" />
      </label>

      <label class="block rounded-xl border border-slate-200 p-3">
        <span class="field-title">Actual Result</span>
        <textarea rows="3" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" :value="report.actualResult" @input="updateText('actualResult', $event)" />
      </label>

      <label class="block rounded-xl border border-slate-200 p-3">
        <span class="field-title">Suggested Labels / Tags (comma separated)</span>
        <input class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" :value="labelsText" @input="updateLabels" />
      </label>

      <label class="block rounded-xl border border-slate-200 p-3">
        <span class="field-title">Possible Root Cause</span>
        <textarea rows="3" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" :value="report.possibleRootCause" @input="updateText('possibleRootCause', $event)" />
      </label>

      <label class="block rounded-xl border border-slate-200 p-3">
        <span class="field-title">Additional Notes</span>
        <textarea rows="3" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" :value="report.additionalNotes" @input="updateText('additionalNotes', $event)" />
      </label>
    </div>

    <div v-else-if="report" class="space-y-3">
      <div class="flex flex-wrap items-center gap-2">
        <SeverityBadge :value="report.severity" />
        <SeverityBadge :value="report.priority" />
      </div>

      <ReportFieldCard title="Bug Title" :content="report.bugTitle" />
      <ReportFieldCard title="Summary" :content="report.summary" />
      <ReportFieldCard title="Module / Feature Area" :content="report.module" />
      <ReportFieldCard title="Environment" :content="report.environment" />
      <ReportFieldCard title="Preconditions" :content="report.preconditions" />
      <ReportFieldCard title="Steps to Reproduce" :content="report.stepsToReproduce" />
      <ReportFieldCard title="Expected Result" :content="report.expectedResult" />
      <ReportFieldCard title="Actual Result" :content="report.actualResult" />
      <ReportFieldCard title="Suggested Labels / Tags" :content="report.labels" />
      <ReportFieldCard title="Possible Root Cause" :content="report.possibleRootCause" />
      <ReportFieldCard title="Additional Notes" :content="report.additionalNotes" />
    </div>
  </div>
</template>
