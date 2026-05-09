import { PutObjectCommand } from '@aws-sdk/client-s3';
import { createR2Client, getPublicR2Url, loadBackendEnv, requiredEnv } from './r2-env';

async function main() {
  loadBackendEnv();

  const bucket = requiredEnv('R2_BUCKET');
  const key = `smoke-tests/r2-smoke-${Date.now()}.txt`;
  const body = `An Voyages R2 smoke test ${new Date().toISOString()}\n`;

  await createR2Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: 'text/plain; charset=utf-8',
      CacheControl: 'no-store',
    }),
  );

  const url = getPublicR2Url(key);
  console.log(`Uploaded: ${url}`);

  if (typeof fetch === 'function') {
    const response = await fetch(url);
    console.log(`Public GET: ${response.status} ${response.statusText}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
