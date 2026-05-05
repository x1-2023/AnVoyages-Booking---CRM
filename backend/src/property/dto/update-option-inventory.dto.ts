import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateOptionInventoryDto {
  @ApiProperty({ example: '2026-07-01' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 8 })
  @IsInt()
  @Min(0)
  totalUnits: number;

  @ApiProperty({ required: false, example: false })
  @IsBoolean()
  @IsOptional()
  closed?: boolean;

  @ApiProperty({ required: false, example: 'Peak season allotment' })
  @IsString()
  @IsOptional()
  note?: string;
}
