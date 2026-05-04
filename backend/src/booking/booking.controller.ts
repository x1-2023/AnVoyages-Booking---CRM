import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Headers, Req } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreateSepayCheckoutDto } from './dto/create-sepay-checkout.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BookingStatus } from './enums/booking-status.enum';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking (public endpoint)' })
  create(@Body() createBookingDto: CreateBookingDto, @Req() request: Request) {
    return this.bookingService.create(createBookingDto, request.ip);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all bookings with filters' })
  @ApiQuery({ name: 'status', required: false, enum: BookingStatus })
  @ApiQuery({ name: 'locationId', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  findAll(
    @Query('status') status?: BookingStatus,
    @Query('locationId') locationId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.bookingService.findAll(status, locationId, start, end);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get booking statistics' })
  @ApiQuery({ name: 'locationId', required: false })
  getStats(@Query('locationId') locationId?: string) {
    return this.bookingService.getStats(locationId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get booking by ID' })
  findOne(@Param('id') id: string) {
    return this.bookingService.findOne(id);
  }

  @Post(':id/sepay-checkout')
  @ApiOperation({ summary: 'Create Sepay checkout fields for a public booking' })
  createSepayCheckout(@Param('id') id: string, @Body() body: CreateSepayCheckoutDto) {
    return this.bookingService.createSepayCheckout(id, body);
  }

  @Post('sepay/ipn')
  @ApiOperation({ summary: 'Receive Sepay IPN payment notification' })
  handleSepayIpn(
    @Headers('x-secret-key') secretKey: string | undefined,
    @Query('secret') querySecret: string | undefined,
    @Body() body: any,
  ) {
    return this.bookingService.handleSepayIpn(secretKey || querySecret, body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update booking details' })
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingService.update(id, updateBookingDto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update booking status' })
  updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateBookingStatusDto) {
    return this.bookingService.updateStatus(id, updateStatusDto);
  }

  @Patch(':id/payment')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update payment amount' })
  updatePayment(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.bookingService.updatePayment(id, updatePaymentDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete booking' })
  remove(@Param('id') id: string) {
    return this.bookingService.remove(id);
  }
}
