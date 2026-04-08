export const sampleBugInputs = [
  {
    id: 'login-reset-failure',
    title: 'Login failure after password reset',
    content: `User reset password from Forgot Password flow and gets confirmation email. After setting a new password, login returns "Invalid credentials". Happened on Chrome 123 and Edge 123. Tried with two test users. No account lock in DB. Console shows 401 from /api/auth/login.`
  },
  {
    id: 'report-preview-slow',
    title: 'Report preview loads too slowly',
    content: `In payroll reports module, preview takes around 35-45 seconds for March dataset (~12k rows). Sometimes spinner never disappears. Network tab shows /api/reports/preview took 41.2s and one request timed out after 30s. User can still download PDF eventually.`
  },
  {
    id: 'payroll-mismatch',
    title: 'Payroll calculation mismatch',
    content: `Employee overtime total in UI does not match exported CSV for same date range. Example: Employee ID EMP-4421 shows 18.5 hours in dashboard but 16.5 hours in export. Reproduced in staging using April 1-15 data. No obvious errors in console.`
  },
  {
    id: 'mobile-layout-issue',
    title: 'UI layout issue on mobile',
    content: `On iPhone 13 viewport, settings page action buttons overlap with footer and Save button is partially hidden. Reproduced on Safari mobile emulation and real device. Desktop view looks normal.`
  },
];
