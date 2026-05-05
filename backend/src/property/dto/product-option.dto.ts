import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class ProductOptionDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ example: 'room', required: false })
  @IsString()
  @IsOptional()
  optionType?: string;

  @ApiProperty({ example: 'Deluxe Room' })
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

  @ApiProperty({ example: 1500000 })
  @IsNumber()
  basePrice: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  adultPrice?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  childPrice?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  costPrice?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  maxGuests?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  maxAdults?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  maxChildren?: number;

  @ApiProperty({ required: false, description: 'Total sellable rooms/cabins/vehicles for this option' })
  @IsInt()
  @IsOptional()
  inventoryQuantity?: number;

  @ApiProperty({ required: false, description: 'Fixed itinerary duration in days, useful for tour packages' })
  @IsInt()
  @IsOptional()
  durationDays?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  bedType?: string;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  bedCount?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  areaSqm?: number;

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

  @ApiProperty({ required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ required: false, default: 0 })
  @IsInt()
  @IsOptional()
  sortOrder?: number;
}
