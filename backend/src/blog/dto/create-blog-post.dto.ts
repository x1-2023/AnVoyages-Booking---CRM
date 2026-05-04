import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

const statusValues = ['draft', 'published', 'archived'];

export class CreateBlogPostDto {
  @IsString()
  @MaxLength(180)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  titleVi?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  titleEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(220)
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(220)
  slugVi?: string;

  @IsOptional()
  @IsString()
  @MaxLength(220)
  slugEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(320)
  excerpt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(320)
  excerptVi?: string;

  @IsOptional()
  @IsString()
  @MaxLength(320)
  excerptEn?: string;

  @IsString()
  contentHtml: string;

  @IsOptional()
  @IsString()
  contentHtmlVi?: string;

  @IsOptional()
  @IsString()
  contentHtmlEn?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  categoryVi?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  categoryEn?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagsVi?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagsEn?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(120)
  authorName?: string;

  @IsOptional()
  @IsIn(statusValues)
  status?: string;

  @IsOptional()
  @IsIn(statusValues)
  statusVi?: string;

  @IsOptional()
  @IsIn(statusValues)
  statusEn?: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  readingMinutes?: number;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  seoTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  seoTitleVi?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  seoTitleEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(320)
  seoDescription?: string;

  @IsOptional()
  @IsString()
  @MaxLength(320)
  seoDescriptionVi?: string;

  @IsOptional()
  @IsString()
  @MaxLength(320)
  seoDescriptionEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  seoKeywords?: string;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  seoKeywordsVi?: string;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  seoKeywordsEn?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  canonicalUrl?: string;

  @IsOptional()
  @IsString()
  ogImage?: string;
}
