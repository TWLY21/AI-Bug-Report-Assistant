<script setup>
</script>

<template>
  <div class="min-h-screen">
    <div class="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-14 lg:px-8">
      <section class="panel overflow-hidden">
        <div class="grid gap-0 lg:grid-cols-2">
          <div class="p-10 lg:p-14">
            <p class="mb-3 inline-flex rounded-full bg-accentSoft px-3 py-1 text-xs font-semibold text-accent">
              AI-powered QA Workflow Tool
            </p>
            <h1 class="font-display text-4xl font-semibold leading-tight text-ink">
              BugSense helps teams turn messy bug notes into clear, actionable reports.
            </h1>
            <p class="mt-4 max-w-xl text-base leading-7 text-slate-600">
              Transform raw logs, incomplete repro steps, and fragmented tester notes into professional bug reports with structured fields, severity suggestions, and searchable history.
            </p>

            <div class="mt-8 flex flex-wrap gap-3">
              <RouterLink class="btn-primary" to="/register">Get Started</RouterLink>
              <RouterLink class="btn-secondary" to="/login">Login</RouterLink>
            </div>

            <dl class="mt-10 grid grid-cols-2 gap-4 text-sm">
              <div class="rounded-xl border border-slate-200 p-4">
                <dt class="text-slate-500">AI Report Generation</dt>
                <dd class="mt-1 font-semibold text-ink">Structured JSON + QA prose</dd>
              </div>
              <div class="rounded-xl border border-slate-200 p-4">
                <dt class="text-slate-500">History Tracking</dt>
                <dd class="mt-1 font-semibold text-ink">Search and reopen reports</dd>
              </div>
              <div class="rounded-xl border border-slate-200 p-4">
                <dt class="text-slate-500">Secure Accounts</dt>
                <dd class="mt-1 font-semibold text-ink">JWT + hashed passwords</dd>
              </div>
              <div class="rounded-xl border border-slate-200 p-4">
                <dt class="text-slate-500">Export Ready</dt>
                <dd class="mt-1 font-semibold text-ink">Markdown and JSON outputs</dd>
              </div>
            </dl>
          </div>

          <div class="relative bg-slate-900 p-10 text-slate-100 lg:p-14">
            <div class="absolute inset-0 bg-gradient-to-br from-teal-500/20 via-transparent to-cyan-500/10" />
            <div class="relative space-y-6">
              <h2 class="font-display text-2xl font-semibold">Built for real QA workflows</h2>
              <p class="text-sm leading-7 text-slate-300">
                Use BugSense when bug reports arrive with missing context, mixed expected vs actual behavior, and inconsistent severity labels. The system standardizes quality before triage.
              </p>
              <ul class="space-y-3 text-sm text-slate-300">
                <li class="rounded-lg border border-slate-700 bg-slate-800/70 p-3">Extracts reproducible steps from noisy notes</li>
                <li class="rounded-lg border border-slate-700 bg-slate-800/70 p-3">Flags likely severity and priority based on impact</li>
                <li class="rounded-lg border border-slate-700 bg-slate-800/70 p-3">Preserves technical meaning without unsupported assumptions</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
