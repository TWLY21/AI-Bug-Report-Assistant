export function reportToMarkdown(report) {
  if (!report) return '';

  const lines = [
    `# ${report.bugTitle}`,
    '',
    `## Summary`,
    report.summary,
    '',
    `## Module / Feature Area`,
    report.module,
    '',
    `## Environment`,
    report.environment,
    '',
    `## Preconditions`,
    report.preconditions,
    '',
    `## Steps to Reproduce`,
    ...report.stepsToReproduce.map((step, index) => `${index + 1}. ${step}`),
    '',
    `## Expected Result`,
    report.expectedResult,
    '',
    `## Actual Result`,
    report.actualResult,
    '',
    `## Severity`,
    report.severity,
    '',
    `## Priority`,
    report.priority,
    '',
    `## Labels`,
    report.labels.join(', '),
    '',
    `## Possible Root Cause`,
    report.possibleRootCause,
    '',
    `## Additional Notes`,
    report.additionalNotes,
  ];

  return lines.join('\n');
}

export function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
