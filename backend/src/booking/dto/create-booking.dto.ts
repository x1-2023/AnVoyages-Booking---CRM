import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNumber, IsOptional, IsInt, IsDateString } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsString()
  customerName: string;

  @ApiProperty({ example: '0912345678' })
  @IsString()
  phone: string;

  @ApiProperty({ required: false, example: 'customer@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty()
  @IsString()
  locationId: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  propertyId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  productOptionId?: string;

  @ApiProperty({ example: '2025-02-01' })
  @IsDateString()
  checkIn: string;

  @ApiProperty({ example: '2025-02-03' })
  @IsDateString()
  checkOut: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  guests: number;

  @ApiProperty({ required: false, example: 7000000, description: 'Client estimate only; backend recalculates final price' })
  @IsNumber()
  @IsOptional()
  totalPrice?: number;

  @ApiProperty({ required: false, example: 30 })
  @IsNumber()
  @IsOptional()
  depositPercent?: number;

  @ApiProperty({ required: false, example: 'SUMMER10' })
  @IsString()
  @IsOptional()
  discountCode?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({ required: false, example: 'consultation' })
  @IsString()
  @IsOptional()
  bookingIntent?: string;

  @ApiProperty({ required: false, example: 'bank_transfer' })
  @IsString()
  @IsOptional()
  requestedPaymentMethod?: string;

  @ApiProperty({ required: false, example: 'VV-20260502-001' })
  @IsString()
  @IsOptional()
  paymentReference?: string;

  @ApiProperty({ required: false, example: 'VV 20260502 001 NGUYEN VAN A' })
  @IsString()
  @IsOptional()
  transferContent?: string;

  @ApiProperty({ required: false, description: 'Cloudflare Turnstile response token' })
  @IsString()
  @IsOptional()
  captchaToken?: string;
}
