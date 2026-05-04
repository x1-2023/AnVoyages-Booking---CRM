import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateSepayCheckoutDto {
  @ApiProperty({ example: '0912345678' })
  @IsString()
  phone: string;

  @ApiProperty({ required: false, example: 'AV-20260503-001' })
  @IsString()
  @IsOptional()
  bookingCode?: string;
}
