import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
import { BookingStatus } from '../enums/booking-status.enum';

export class UpdateBookingStatusDto {
  @ApiProperty({ enum: BookingStatus })
  @IsEnum(BookingStatus)
  status: BookingStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  adminNote?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  paidAmount?: number;
}
