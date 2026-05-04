import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsNumber, IsBoolean, IsOptional, IsArray, IsInt, ValidateNested } from 'class-validator';
import { ProductOptionDto } from './product-option.dto';

export class PricingRuleDto {
  @ApiProperty({ example: 'Mùa hè', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: '2026-06-01', required: false })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ example: '2026-08-31', required: false })
  @IsString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ example: 3900000, required: false })
  @IsNumber()
  @IsOptional()
  adultPrice?: number;

  @ApiProperty({ example: 2600000, required: false })
  @IsNumber()
  @IsOptional()
  childPrice?: number;

  @ApiProperty({ example: 300000, required: false })
  @IsNumber()
  @IsOptional()
  extraFee?: number;
}

export class CreatePropertyDto {
  @ApiProperty({ example: 'Sofitel Legend Metropole' })
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  nameVi?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  nameEn?: string;

  @ApiProperty()
  @IsString()
  locationId: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  supplierId?: string;

  @ApiProperty({ example: 'hotel' })
  @IsString()
  type: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  descriptionVi?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  descriptionEn?: string;

  @ApiProperty({ example: 3500000 })
  @IsNumber()
  basePrice: number;

  @ApiProperty({ required: false, example: 3500000 })
  @IsNumber()
  @IsOptional()
  adultPrice?: number;

  @ApiProperty({ required: false, example: 2400000 })
  @IsNumber()
  @IsOptional()
  childPrice?: number;

  @ApiProperty({ required: false, example: 250000 })
  @IsNumber()
  @IsOptional()
  extraFee?: number;

  @ApiProperty({ required: false, type: [PricingRuleDto] })
  @IsArray()
  @IsOptional()
  pricingRules?: PricingRuleDto[];

  @ApiProperty({ required: false, example: 2200000 })
  @IsNumber()
  @IsOptional()
  costPrice?: number;

  @ApiProperty({ required: false, example: 2 })
  @IsInt()
  @IsOptional()
  durationDays?: number;

  @ApiProperty({ required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsOptional()
  images?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsOptional()
  amenities?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsOptional()
  amenitiesVi?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsOptional()
  amenitiesEn?: string[];

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  maxGuests?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  seoTitleVi?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  seoTitleEn?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  seoDescriptionVi?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  seoDescriptionEn?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  seoKeywordsVi?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  seoKeywordsEn?: string;

  @ApiProperty({ required: false, type: [ProductOptionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductOptionDto)
  @IsOptional()
  options?: ProductOptionDto[];
}
