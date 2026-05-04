import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MediaService {
  constructor(private readonly configService: ConfigService) {}

  getPublicUrl(filename: string, folder = 'settings') {
    const baseUrl =
      this.configService.get<string>('APP_URL') ||
      `http://localhost:${this.configService.get<string>('PORT') || '3000'}`;

    return `${baseUrl}/uploads/${folder}/${filename}`;
  }
}
