// ─── Logger ───────────────────────────────────────────────────────────────────
// Centralised console helpers used by every scripts/lib module.
// All output is written to stdout/stderr so npm swallows nothing.

const logger = {
  /** Heading that visually separates major phases */
  section: (msg) => console.log(`\n── ${msg} ──`),

  /** An in-progress action inside a section */
  step: (msg) => console.log(`  ▸ ${msg}`),

  /** A successfully completed action */
  success: (msg) => console.log(`  ✓ ${msg}`),

  /** Non-fatal advisory (e.g. record already exists) */
  warn: (msg) => console.warn(`  ⚠ ${msg}`),

  /** Fatal error — caller is responsible for exiting the process */
  error: (msg) => console.error(`  ✗ ${msg}`),
};

module.exports = logger;
