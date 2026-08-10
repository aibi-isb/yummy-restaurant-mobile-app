// ─── Reset ────────────────────────────────────────────────────────────────────
// Wipes all seeded data then re-populates the database from scratch.
// Equivalent to running `npm run clear-seed && npm run setup-yummy` in a single command.
//
// Usage:
//   npm run reset
//   node scripts/reset.js
//
// This is the recommended command when you want a guaranteed clean slate —
// e.g. before a demo, after a schema change, or at the start of a test run.

const { clearSeed } = require('./clearSeed');
const { setupYummy }  = require('./setupYummy');
const logger = require('./lib/logger');

// ─── Main ─────────────────────────────────────────────────────────────────────

async function reset() {
  console.log('🔄 Resetting database…');

  // Step 1 — clear all seed-tagged rows and auth users.
  await clearSeed();

  // Step 2 — set up the YUMMY demo data from scratch.
  await setupYummy();

  console.log('✅ Database reset complete\n');
}

// ─── Entry point ──────────────────────────────────────────────────────────────

reset().catch((err) => {
  logger.error(err.message);
  process.exit(1);
});
