import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { readFile, unlink } from 'fs/promises';
import { extname } from 'path';

interface UploadedImageFile {
  path: string;
  filename: string;
  size: number;
  mimetype: string;
}

@Injectable()
export class MediaService {
  private r2Client?: S3Client;

  constructor(private readonly configService: ConfigService) {}

  getPublicUrl(filename: string, folder = 'settings') {
    const baseUrl =
      this.configService.get<string>('APP_URL') ||
      `http://localhost:${this.configService.get<string>('PORT') || '3000'}`;

    return `${baseUrl}/uploads/${folder}/${filename}`;
  }

  async persistImage(file: UploadedImageFile, folder = 'settings') {
    const driver = this.configService.get<string>('UPLOAD_DRIVER') || 'local';

    if (driver !== 'r2') {
      return {
        url: this.getPublicUrl(file.filename, folder),
        filename: file.filename,
        size: file.size,
        mimeType: file.mimetype,
        provider: 'local',
      };
    }

    const bucket = this.requiredConfig('R2_BUCKET');
    const publicBaseUrl = this.requiredConfig('R2_PUBLIC_BASE_URL').replace(/\/+$/, '');
    const key = this.buildObjectKey(folder, file.filename);
    const body = await readFile(file.path);

    try {
      await this.getR2Client().send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: body,
          ContentType: file.mimetype,
          CacheControl: 'public, max-age=31536000, immutable',
        }),
      );
    } catch {
      throw new InternalServerErrorException('Could not upload image to Cloudflare R2');
    } finally {
      await unlink(file.path).catch(() => undefined);
    }

    return {
      url: this.buildPublicUrl(publicBaseUrl, key),
      filename: file.filename,
      size: file.size,
      mimeType: file.mimetype,
      provider: 'r2',
      storageKey: key,
    };
  }

  private getR2Client() {
    if (this.r2Client) return this.r2Client;

    const accountId = this.requiredConfig('R2_ACCOUNT_ID');
    const accessKeyId = this.requiredConfig('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.requiredConfig('R2_SECRET_ACCESS_KEY');
    const sessionToken = this.configService.get<string>('R2_SESSION_TOKEN') || undefined;

    this.r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
        sessionToken,
      },
    });

    return this.r2Client;
  }

  private buildObjectKey(folder: string, filename: string) {
    const safeFolder =
      folder.replace(/[^a-zA-Z0-9/_-]/g, '').replace(/^\/+|\/+$/g, '') || 'uploads';
    const extension = extname(filename).toLowerCase();
    const name = filename
      .replace(extension, '')
      .replace(/\u0111/g, 'd')
      .replace(/\u0110/g, 'd')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 120);

    return `${safeFolder}/${name || Date.now()}${extension || '.jpg'}`;
  }

  private buildPublicUrl(publicBaseUrl: string, key: string) {
    const encodedKey = key
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/');

    return `${publicBaseUrl}/${encodedKey}`;
  }

  private requiredConfig(key: string) {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new Error(`${key} is required when UPLOAD_DRIVER=r2`);
    }

    return value;
  }
}
