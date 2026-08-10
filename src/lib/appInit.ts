let initPromise: Promise<void> | null = null;

async function initializeFonts() {
  // No custom font files are registered yet; keep this step explicit for launch bootstrap.
}

async function initializeAssets() {
  // Image assets are bundled by Metro and first rendered on their screens.
}

export function initializeApp() {
  initPromise ??= Promise.all([
    initializeFonts(),
    initializeAssets(),
  ]).then(() => undefined);

  return initPromise;
}
