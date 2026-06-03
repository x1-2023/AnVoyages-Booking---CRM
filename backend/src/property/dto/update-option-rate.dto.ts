import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsInt, IsNumber, IsOptional } from 'class-validator';

export class UpdateOptionRateDto {
  @ApiProperty({ required: false, example: 1800000 })
  @IsNumber()
  @IsOptional()
  basePrice?: number;

  @ApiProperty({ required: false, example: 1800000 })
  @IsNumber()
  @IsOptional()
  adultPrice?: number;

  @ApiProperty({ required: false, example: 1200000 })
  @IsNumber()
  @IsOptional()
  childPrice?: number;

  @ApiProperty({ required: false, example: 950000 })
  @IsNumber()
  @IsOptional()
  costPrice?: number;

  @ApiProperty({ required: false, example: 12 })
  @IsInt()
  @IsOptional()
  inventoryQuantity?: number;

  @ApiProperty({ required: false, type: [Object] })
  @IsArray()
  @IsOptional()
  pricingRules?: unknown[];

  @ApiProperty({ required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
