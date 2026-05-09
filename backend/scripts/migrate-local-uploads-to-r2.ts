import { createReadStream, existsSync, readdirSync, statSync } from 'fs';
import { extname, join, relative, resolve } from 'path';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { createR2Client, getPublicR2Url, loadBackendEnv } from './r2-env';

const contentTypes: Record<string, string> = {
  '.gif': 'image/gif',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    const stats = statSync(path);
    if (stats.isDirectory()) return walk(path);
    if (!stats.isFile()) return [];
    return [path];
  });
}

async function main() {
  loadBackendEnv();

  const dryRun = process.argv.includes('--dry-run');
  const bucket = process.env.R2_BUCKET || 'anvoyages-media';
  const uploadsDir = resolve(__dirname, '..', 'uploads');

  if (!existsSync(uploadsDir)) {
    console.log('No backend/uploads directory found.');
    return;
  }

  const files = walk(uploadsDir).filter((file) => contentTypes[extname(file).toLowerCase()]);
  const client = dryRun ? undefined : createR2Client();

  for (const file of files) {
    const key = relative(uploadsDir, file).replace(/\\/g, '/');
    const contentType = contentTypes[extname(file).toLowerCase()] || 'application/octet-stream';

    if (!dryRun) {
      await client!.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: createReadStream(file),
          ContentType: contentType,
          CacheControl: 'public, max-age=31536000, immutable',
        }),
      );
    }

    console.log(`${dryRun ? 'Would upload' : 'Uploaded'} ${key} -> ${getPublicR2Url(key)}`);
  }

  console.log(`${dryRun ? 'Dry run complete' : 'Migration complete'}: ${files.length} file(s).`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
