import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class UpdateMultipleSettingsDto {
  @ApiProperty({
    example: {
      hero_background_image: 'https://example.com/image.jpg',
      site_name: 'My Travel Site'
    }
  })
  @IsObject()
  settings: Record<string, string>;
}
