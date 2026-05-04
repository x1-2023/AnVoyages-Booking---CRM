import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateSettingDto {
  @ApiProperty({ example: 'https://example.com/image.jpg' })
  @IsString()
  value: string;
}
