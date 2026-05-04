import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateLocationDto {
  @ApiProperty({ example: 'Ha Long' })
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

  @ApiProperty({ example: 'ha-long' })
  @IsString()
  slug: string;

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

  @ApiProperty({ required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  seoTitle?: string;

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
  seoDescription?: string;

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
  imageUrl?: string;
}
