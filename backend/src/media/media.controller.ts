import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { readFile, unlink } from 'fs/promises';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MediaService } from './media.service';

const settingsUploadDir = join(process.cwd(), 'uploads', 'settings');
const blogUploadDir = join(process.cwd(), 'uploads', 'blog');
const productUploadDir = join(process.cwd(), 'uploads', 'products');

interface UploadedImageFile {
  path: string;
  filename: string;
  size: number;
  mimetype: string;
}

for (const uploadDir of [settingsUploadDir, blogUploadDir, productUploadDir]) {
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }
}

const allowedImageMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

async function assertSafeImage(file: UploadedImageFile) {
  const header = await readFile(file.path).then((buffer) => buffer.subarray(0, 16));
  const isJpeg = header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
  const isPng = header.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  const isGif = header.subarray(0, 6).toString('ascii') === 'GIF87a' || header.subarray(0, 6).toString('ascii') === 'GIF89a';
  const isWebp = header.subarray(0, 4).toString('ascii') === 'RIFF' && header.subarray(8, 12).toString('ascii') === 'WEBP';

  if (!allowedImageMimeTypes.has(file.mimetype) || !(isJpeg || isPng || isGif || isWebp)) {
    await unlink(file.path).catch(() => undefined);
    throw new BadRequestException('Invalid image file');
  }
}

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get('files/:folder/:filename')
  sendPublicFile(
    @Param('folder') folder: string,
    @Param('filename') filename: string,
    @Res() response: Response,
  ) {
    if (!['settings', 'blog', 'products'].includes(folder) || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      throw new NotFoundException('File not found');
    }

    return response.sendFile(join(process.cwd(), 'uploads', folder, filename), (error) => {
      if (error && !response.headersSent) {
        response.status(404).send('File not found');
      }
    });
  }

  @Get('files/:folder/:namespace/:filename')
  sendPublicNestedFile(
    @Param('folder') folder: string,
    @Param('namespace') namespace: string,
    @Param('filename') filename: string,
    @Res() response: Response,
  ) {
    const safeSegment = (value: string) => /^[a-zA-Z0-9._-]+$/.test(value);
    if (!['products'].includes(folder) || !safeSegment(namespace) || !safeSegment(filename)) {
      throw new NotFoundException('File not found');
    }

    return response.sendFile(join(process.cwd(), 'uploads', folder, namespace, filename), (error) => {
      if (error && !response.headersSent) {
        response.status(404).send('File not found');
      }
    });
  }

  @Post('hero-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: settingsUploadDir,
        filename: (_, file, callback) => {
          const timestamp = Date.now();
          const random = Math.round(Math.random() * 1e9);
          callback(null, `hero-${timestamp}-${random}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (_, file, callback) => {
        if (!allowedImageMimeTypes.has(file.mimetype)) {
          callback(new BadRequestException('Only image files are allowed'), false);
          return;
        }

        callback(null, true);
      },
    }),
  )
  async uploadHeroImage(@UploadedFile() file: UploadedImageFile) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    await assertSafeImage(file);

    return this.mediaService.persistImage(file);
  }

  @Post('blog-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: blogUploadDir,
        filename: (_, file, callback) => {
          const timestamp = Date.now();
          const random = Math.round(Math.random() * 1e9);
          callback(null, `blog-${timestamp}-${random}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 8 * 1024 * 1024,
      },
      fileFilter: (_, file, callback) => {
        if (!allowedImageMimeTypes.has(file.mimetype)) {
          callback(new BadRequestException('Only image files are allowed'), false);
          return;
        }

        callback(null, true);
      },
    }),
  )
  async uploadBlogImage(@UploadedFile() file: UploadedImageFile) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    await assertSafeImage(file);

    return this.mediaService.persistImage(file, 'blog');
  }

  @Post('product-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: productUploadDir,
        filename: (_, file, callback) => {
          const timestamp = Date.now();
          const random = Math.round(Math.random() * 1e9);
          callback(null, `product-${timestamp}-${random}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 8 * 1024 * 1024,
      },
      fileFilter: (_, file, callback) => {
        if (!allowedImageMimeTypes.has(file.mimetype)) {
          callback(new BadRequestException('Only image files are allowed'), false);
          return;
        }

        callback(null, true);
      },
    }),
  )
  async uploadProductImage(@UploadedFile() file: UploadedImageFile) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    await assertSafeImage(file);

    return this.mediaService.persistImage(file, 'products');
  }
}
