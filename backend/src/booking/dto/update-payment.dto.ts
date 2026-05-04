import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdatePaymentDto {
  @ApiProperty({ example: 3500000 })
  @IsNumber()
  @Min(0)
  paidAmount: number;

  @ApiProperty({ required: false, example: 1750000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;

  @ApiProperty({ required: false, example: 'deposit' })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({ required: false, example: 'bank_transfer' })
  @IsString()
  @IsOptional()
  method?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  referenceCode?: string;

  @ApiProperty({ required: false, example: 'VV-20260502-001' })
  @IsString()
  @IsOptional()
  paymentReference?: string;

  @ApiProperty({ required: false, example: 'VV 20260502 001 NGUYEN VAN A' })
  @IsString()
  @IsOptional()
  transferContent?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  note?: string;
}
