import { defineStore } from 'pinia';
import api from '../services/api';

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function cloneReport(report) {
  return report ? cloneValue(report) : null;
}

function defaultMeta() {
  return {
    fallbackUsed: false,
    retriesUsed: 0,
    source: null,
    fallbackReason: null,
  };
}

export const useReportStore = defineStore('reports', {
  state: () => ({
    generatedReport: null,
    editableReport: null,
    generatedMeta: defaultMeta(),
    generating: false,
    regenerating: false,
    saving: false,
    history: [],
    pagination: { page: 1, limit: 30, total: 0 },
    selectedReport: null,
    summary: {
      totalReports: 0,
      severityBreakdown: { Low: 0, Medium: 0, High: 0, Critical: 0 },
      recentReports: [],
    },
  }),
  actions: {
    async generateReport(rawInput) {
      this.generating = true;
      try {
        const { data } = await api.post('/reports/generate', { rawInput });
        this.generatedReport = data.report;
        this.editableReport = cloneReport(data.report);
        this.generatedMeta = data.meta || defaultMeta();
      } finally {
        this.generating = false;
      }
    },
    async regenerateReportFields(rawInput, fieldsToRefresh = []) {
      const currentGenerated = this.generatedReport ? cloneReport(this.generatedReport) : null;
      const currentEditable = this.editableReport ? cloneReport(this.editableReport) : currentGenerated;

      this.regenerating = true;
      try {
        const { data } = await api.post('/reports/generate', { rawInput });
        const nextReport = data.report;

        if (!currentGenerated || !currentEditable) {
          this.generatedReport = nextReport;
          this.editableReport = cloneReport(nextReport);
          this.generatedMeta = data.meta || defaultMeta();
          return;
        }

        const mergedGenerated = cloneReport(currentGenerated);
        const mergedEditable = cloneReport(currentEditable);

        const refreshFields = Array.isArray(fieldsToRefresh) && fieldsToRefresh.length
          ? fieldsToRefresh
          : Object.keys(nextReport);

        refreshFields.forEach((field) => {
          if (Object.prototype.hasOwnProperty.call(nextReport, field)) {
            mergedGenerated[field] = cloneValue(nextReport[field]);
            mergedEditable[field] = cloneValue(nextReport[field]);
          }
        });

        this.generatedReport = mergedGenerated;
        this.editableReport = mergedEditable;
        this.generatedMeta = data.meta || defaultMeta();
      } finally {
        this.regenerating = false;
      }
    },
    async saveGeneratedReport(rawInput) {
      const reportToSave = this.editableReport || this.generatedReport;
      if (!reportToSave) return;

      this.saving = true;
      try {
        const payload = { rawInput, ...reportToSave };
        const { data } = await api.post('/reports', payload);
        this.selectedReport = data.report;
      } finally {
        this.saving = false;
      }
    },
    updateEditableField(field, value) {
      if (!this.editableReport) {
        this.editableReport = cloneReport(this.generatedReport);
      }
      if (!this.editableReport) return;

      this.editableReport[field] = value;
    },
    resetEditableReport() {
      this.editableReport = cloneReport(this.generatedReport);
    },
    async fetchHistory(params = {}) {
      const { data } = await api.get('/reports', { params });
      this.history = data.items;
      this.pagination = data.pagination;
    },
    async fetchReportById(id) {
      const { data } = await api.get(`/reports/${id}`);
      this.selectedReport = data.report;
    },
    async deleteReport(id) {
      await api.delete(`/reports/${id}`);
      this.history = this.history.filter((item) => item.id !== id);
      if (this.selectedReport?.id === id) {
        this.selectedReport = null;
      }
    },
    async fetchSummary() {
      const { data } = await api.get('/dashboard/summary');
      this.summary = data;
    },
    clearGenerated() {
      this.generatedReport = null;
      this.editableReport = null;
      this.generatedMeta = defaultMeta();
    },
  },
});
