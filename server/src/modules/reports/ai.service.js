import OpenAI from 'openai';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/api-error.js';

const client = new OpenAI({
  apiKey: env.geminiApiKey,
  baseURL: env.geminiBaseUrl,
});

const systemPrompt = `You are a professional QA analyst.
Your task is to convert raw, messy bug descriptions into a structured bug report.
Rules:
- Preserve technical meaning from input.
- Do not invent precise facts that are not supported.
- Use "Not specified" when details are missing.
- Infer severity and priority conservatively based on evidence.
- Severity must be one of: Low, Medium, High, Critical.
- Priority must be one of: Low, Medium, High, Urgent.
- Return STRICT JSON only with exact keys.
- stepsToReproduce must be an array of concise strings.
- labels must be an array of short tags.`;

const userTemplate = `Analyze the following raw bug input and return structured JSON.

RAW_INPUT:
{{RAW_INPUT}}

JSON_SCHEMA:
{
  "bugTitle": "",
  "summary": "",
  "module": "",
  "environment": "",
  "preconditions": "",
  "stepsToReproduce": [],
  "expectedResult": "",
  "actualResult": "",
  "severity": "",
  "priority": "",
  "labels": [],
  "possibleRootCause": "",
  "additionalNotes": ""
}`;

function normalizeResponse(data) {
  const safeString = (value) => (typeof value === 'string' && value.trim() ? value.trim() : 'Not specified');
  const safeArray = (value) =>
    Array.isArray(value) && value.length ? value.map((v) => String(v).trim()).filter(Boolean) : ['Not specified'];

  const severityOptions = ['Low', 'Medium', 'High', 'Critical'];
  const priorityOptions = ['Low', 'Medium', 'High', 'Urgent'];

  const severity = severityOptions.includes(data.severity) ? data.severity : 'Medium';
  const priority = priorityOptions.includes(data.priority) ? data.priority : 'Medium';

  return {
    bugTitle: safeString(data.bugTitle),
    summary: safeString(data.summary),
    module: safeString(data.module),
    environment: safeString(data.environment),
    preconditions: safeString(data.preconditions),
    stepsToReproduce: safeArray(data.stepsToReproduce),
    expectedResult: safeString(data.expectedResult),
    actualResult: safeString(data.actualResult),
    severity,
    priority,
    labels: safeArray(data.labels),
    possibleRootCause: safeString(data.possibleRootCause),
    additionalNotes: safeString(data.additionalNotes),
  };
}

function toTextContent(content) {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item?.type === 'text' && item?.text) return item.text;
        return '';
      })
      .join('')
      .trim();
  }
  return '';
}

async function withTimeout(promise, timeoutMs) {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new ApiError(504, `AI request timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId);
  }
}

function isRetryableError(error) {
  const status = error?.status || error?.response?.status || error?.statusCode;
  if ([408, 429, 500, 502, 503, 504].includes(status)) return true;

  const message = String(error?.message || '').toLowerCase();
  const retryableTokens = ['timeout', 'timed out', 'rate limit', 'temporar', 'network', 'econnreset'];
  return retryableTokens.some((token) => message.includes(token));
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sanitizeLine(raw, fallback = 'Not specified') {
  const clean = String(raw || '').replace(/\s+/g, ' ').trim();
  return clean || fallback;
}

function truncate(text, max = 180) {
  const value = sanitizeLine(text, 'Not specified');
  return value.length > max ? `${value.slice(0, max - 3)}...` : value;
}

function extractField(rawInput, aliases) {
  const lines = rawInput.split('\n');
  for (const line of lines) {
    for (const alias of aliases) {
      const regex = new RegExp(`^\\s*${alias}\\s*[:\\-]\\s*(.+)$`, 'i');
      const match = line.match(regex);
      if (match?.[1]) {
        return sanitizeLine(match[1]);
      }
    }
  }
  return 'Not specified';
}

function extractSteps(rawInput) {
  const lines = rawInput.split('\n');
  const steps = lines
    .map((line) => line.trim())
    .filter((line) => /^\d+[.)\-]\s+/.test(line) || /^[-*]\s+/.test(line))
    .map((line) => line.replace(/^\d+[.)\-]\s+/, '').replace(/^[-*]\s+/, '').trim())
    .filter(Boolean);

  return steps.length ? steps : ['Not specified'];
}

function inferSeverityPriority(rawInput) {
  const text = rawInput.toLowerCase();

  const criticalSignals = ['data loss', 'security breach', 'payment blocked', 'payment failed'];
  if (criticalSignals.some((signal) => text.includes(signal))) {
    return { severity: 'Critical', priority: 'Urgent' };
  }

  const highSignals = ['cannot login', 'login blocked', 'crash', 'service down', 'blocked', 'cannot submit'];
  if (highSignals.some((signal) => text.includes(signal))) {
    return { severity: 'High', priority: 'High' };
  }

  const lowSignals = ['typo', 'misalignment', 'ui layout', 'cosmetic', 'spacing issue'];
  if (lowSignals.some((signal) => text.includes(signal))) {
    return { severity: 'Low', priority: 'Low' };
  }

  const mediumSignals = ['slow', 'performance', 'timeout', 'workaround'];
  if (mediumSignals.some((signal) => text.includes(signal))) {
    return { severity: 'Medium', priority: 'Medium' };
  }

  return { severity: 'Medium', priority: 'Medium' };
}

function inferLabels(rawInput) {
  const text = rawInput.toLowerCase();
  const labels = [];

  const pairs = [
    ['auth', ['login', 'password', 'authentication', '401']],
    ['api', ['api', 'endpoint', 'request', 'response']],
    ['ui', ['layout', 'button', 'mobile', 'display', 'css']],
    ['performance', ['slow', 'latency', 'timeout', 'loading']],
    ['data-integrity', ['mismatch', 'incorrect', 'wrong value']],
  ];

  for (const [label, signals] of pairs) {
    if (signals.some((signal) => text.includes(signal))) {
      labels.push(label);
    }
  }

  return labels.length ? labels : ['triage-needed'];
}

function buildFallbackReport(rawInput, lastError) {
  const { severity, priority } = inferSeverityPriority(rawInput);
  const module = extractField(rawInput, ['module', 'feature area', 'feature', 'area']);
  const environment = extractField(rawInput, ['environment', 'env', 'browser', 'device']);
  const preconditions = extractField(rawInput, ['preconditions', 'precondition']);
  const expectedResult = extractField(rawInput, ['expected result', 'expected']);
  const actualResult = extractField(rawInput, ['actual result', 'actual']);

  const firstLine = rawInput.split('\n').map((line) => line.trim()).find(Boolean) || 'Issue reported from raw input';
  const summary = truncate(firstLine, 220);
  const context = module !== 'Not specified' ? module : 'General';

  return {
    bugTitle: truncate(`${context}: ${summary}`, 120),
    summary,
    module,
    environment,
    preconditions,
    stepsToReproduce: extractSteps(rawInput),
    expectedResult,
    actualResult,
    severity,
    priority,
    labels: inferLabels(rawInput),
    possibleRootCause:
      'Not enough evidence from input. Review server logs, request payloads, and recent code changes in the affected module.',
    additionalNotes: `Generated using fallback mode because AI service was unavailable (${truncate(
      lastError?.message || 'unknown error',
      140
    )}). Please review and refine fields before saving.`,
  };
}

async function requestStructuredReport(prompt) {
  const response = await withTimeout(
    client.chat.completions.create({
      model: env.geminiModel,
      response_format: { type: 'json_object' },
      temperature: 0.2,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
    }),
    env.geminiTimeoutMs
  );

  const content = toTextContent(response.choices?.[0]?.message?.content);
  if (!content) {
    throw new ApiError(502, 'AI response was empty');
  }

  try {
    const parsed = JSON.parse(content);
    return normalizeResponse(parsed);
  } catch {
    throw new ApiError(502, 'AI returned invalid JSON format');
  }
}

export async function generateStructuredReport(rawInput) {
  const prompt = userTemplate.replace('{{RAW_INPUT}}', rawInput);
  let lastError = null;

  for (let attempt = 0; attempt <= env.geminiMaxRetries; attempt += 1) {
    try {
      const report = await requestStructuredReport(prompt);
      return {
        report,
        meta: {
          fallbackUsed: false,
          retriesUsed: attempt,
          source: 'gemini',
          fallbackReason: null,
        },
      };
    } catch (error) {
      lastError = error;

      const canRetry = attempt < env.geminiMaxRetries && isRetryableError(error);
      if (canRetry) {
        await wait(400 * (attempt + 1));
        continue;
      }
      break;
    }
  }

  if (env.aiFallbackMode === 'heuristic') {
    const report = buildFallbackReport(rawInput, lastError);
    return {
      report,
      meta: {
        fallbackUsed: true,
        retriesUsed: env.geminiMaxRetries,
        source: 'heuristic-fallback',
        fallbackReason: lastError?.message || 'Unknown AI generation failure',
      },
    };
  }

  throw new ApiError(502, 'AI generation failed after retries', {
    cause: lastError?.message || 'Unknown error',
  });
}
