const SEED_TAG = 'default';

function seedKey(type, id) {
  return `seed_${type}_${id}`;
}

function isMissingSeedMetadataError(error) {
  const message = error?.message ?? '';
  return (
    error?.code === '42703' ||
    error?.code === 'PGRST204' ||
    message.includes('seed_tag') ||
    message.includes('seed_key')
  );
}

function stripSeedMetadata(row) {
  const { seed_tag, seed_key, ...rest } = row;
  return rest;
}

function stripSeedMetadataRows(rows) {
  return Array.isArray(rows) ? rows.map(stripSeedMetadata) : stripSeedMetadata(rows);
}

module.exports = {
  SEED_TAG,
  isMissingSeedMetadataError,
  seedKey,
  stripSeedMetadataRows,
};
