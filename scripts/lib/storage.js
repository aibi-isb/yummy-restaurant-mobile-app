const fs = require("fs/promises");
const path = require("path");

const { supabase } = require("./supabase");
const logger = require("./logger");

const FOOD_BUCKET = "food-images";
const CATEGORY_BUCKET = "category-images";
const AVATAR_BUCKET = "avatars";
const OPTIONAL_BUCKETS = [
  "banner-images",
  "profile-images",
  "restaurant-assets",
  "payment-proofs",
];
const SEED_FOODS_DIR = path.resolve(process.cwd(), "assets/seed/foods");
const SEED_UPLOAD_CONCURRENCY = Math.max(1, Number(process.env.SEED_UPLOAD_CONCURRENCY || 4));
const SEED_UPLOAD_ATTEMPTS = Math.max(1, Number(process.env.SEED_UPLOAD_ATTEMPTS || 4));

function getContentType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "image/jpeg";
}

async function readSeedImageBuffer(imageFile) {
  const filePath = path.join(SEED_FOODS_DIR, imageFile);
  try {
    return await fs.readFile(filePath);
  } catch {
    throw new Error(`Missing seed image file: ${filePath}`);
  }
}

async function uploadSeedImage({ bucketPath, imageFile }, bucketName = FOOD_BUCKET) {
  const file = await readSeedImageBuffer(imageFile);

  let lastError = null;
  for (let attempt = 1; attempt <= SEED_UPLOAD_ATTEMPTS; attempt += 1) {
    try {
      const { error } = await supabase.storage.from(bucketName).upload(bucketPath, file, {
        contentType: getContentType(imageFile),
        upsert: true,
      });

      if (!error) {
        const { data } = supabase.storage.from(bucketName).getPublicUrl(bucketPath);
        return data.publicUrl;
      }

      lastError = new Error(error.message);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }

    if (attempt < SEED_UPLOAD_ATTEMPTS) {
      const delayMs = 1000 * 2 ** (attempt - 1);
      logger.warn(`Upload retry ${attempt}/${SEED_UPLOAD_ATTEMPTS - 1} for ${imageFile} in ${delayMs}ms.`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw new Error(`Could not upload ${imageFile} after ${SEED_UPLOAD_ATTEMPTS} attempts: ${lastError?.message ?? "unknown error"}`);
}

async function uploadSeedBatch(items, bucketName, label) {
  if (!items.length) return;

  const workerCount = Math.min(SEED_UPLOAD_CONCURRENCY, items.length);
  logger.step(`Uploading ${items.length} ${label} with ${workerCount} concurrent workers…`);

  let nextIndex = 0;
  const failures = [];
  const worker = async () => {
    while (true) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= items.length) return;

      const item = items[index];
      try {
        await uploadSeedImage(item, bucketName);
        logger.success(`Uploaded ${item.bucketPath}`);
      } catch (error) {
        failures.push(error instanceof Error ? error.message : String(error));
      }
    }
  };

  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  if (failures.length) {
    throw new Error(`Seed upload failed for ${failures.length} file(s):\n${failures.map((failure) => `- ${failure}`).join("\n")}`);
  }
}

async function ensureBucket(bucketName, { public: isPublic = true } = {}) {
  const { data, error } = await supabase.storage.listBuckets();
  if (error) {
    throw new Error(`Could not list storage buckets: ${error.message}`);
  }

  if (data.some((bucket) => bucket.name === bucketName)) {
    return;
  }

  const { error: createError } = await supabase.storage.createBucket(bucketName, {
    public: isPublic,
  });
  if (createError) {
    throw new Error(`Could not create bucket "${bucketName}": ${createError.message}`);
  }
}

async function seedStorage({ uploadFoods = true } = {}) {
  const { seedProducts } = require('../data/products');
  const { seedCategories } = require('../data/categories');

  logger.step(`Ensuring bucket exists: ${FOOD_BUCKET}`);
  await ensureBucket(FOOD_BUCKET);
  logger.step(`Ensuring bucket exists: ${CATEGORY_BUCKET}`);
  await ensureBucket(CATEGORY_BUCKET);
  logger.step(`Ensuring bucket exists: ${AVATAR_BUCKET}`);
  await ensureBucket(AVATAR_BUCKET);

  for (const bucketName of OPTIONAL_BUCKETS) {
    logger.step(`Optional bucket configured for future use: ${bucketName}`);
  }

  if (!uploadFoods) return;

  await uploadSeedBatch(seedProducts, FOOD_BUCKET, "food images");
  await uploadSeedBatch(seedCategories, CATEGORY_BUCKET, "category images");
}

async function removeSeedImages(bucketPaths, bucketName = FOOD_BUCKET) {
  const uniquePaths = [...new Set(bucketPaths.filter(Boolean))];
  if (uniquePaths.length === 0) return;

  const { error } = await supabase.storage.from(bucketName).remove(uniquePaths);
  if (error) {
    throw new Error(`Could not remove seed images: ${error.message}`);
  }
}

module.exports = {
  CATEGORY_BUCKET,
  AVATAR_BUCKET,
  FOOD_BUCKET,
  OPTIONAL_BUCKETS,
  SEED_FOODS_DIR,
  ensureBucket,
  getContentType,
  readSeedImageBuffer,
  removeSeedImages,
  seedStorage,
  uploadSeedImage,
};
