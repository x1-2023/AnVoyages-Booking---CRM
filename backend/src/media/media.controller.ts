import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MediaService } from './media.service';

const settingsUploadDir = join(process.cwd(), 'uploads', 'settings');
const blogUploadDir = join(process.cwd(), 'uploads', 'blog');
const productUploadDir = join(process.cwd(), 'uploads', 'products');

for (const uploadDir of [settingsUploadDir, blogUploadDir, productUploadDir]) {
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }
}

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

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
        if (!file.mimetype.startsWith('image/')) {
          callback(new BadRequestException('Only image files are allowed'), false);
          return;
        }

        callback(null, true);
      },
    }),
  )
  uploadHeroImage(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    return {
      url: this.mediaService.getPublicUrl(file.filename),
      filename: file.filename,
      size: file.size,
      mimeType: file.mimetype,
    };
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
        if (!file.mimetype.startsWith('image/')) {
          callback(new BadRequestException('Only image files are allowed'), false);
          return;
        }

        callback(null, true);
      },
    }),
  )
  uploadBlogImage(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    return {
      url: this.mediaService.getPublicUrl(file.filename, 'blog'),
      filename: file.filename,
      size: file.size,
      mimeType: file.mimetype,
    };
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
        if (!file.mimetype.startsWith('image/')) {
          callback(new BadRequestException('Only image files are allowed'), false);
          return;
        }

        callback(null, true);
      },
    }),
  )
  uploadProductImage(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    return {
      url: this.mediaService.getPublicUrl(file.filename, 'products'),
      filename: file.filename,
      size: file.size,
      mimeType: file.mimetype,
    };
  }
}
