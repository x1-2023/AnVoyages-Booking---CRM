import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get dashboard overview statistics' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  getOverview(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.dashboardService.getOverview(start, end);
  }

  @Get('revenue/by-location')
  @ApiOperation({ summary: 'Get revenue breakdown by location' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  getRevenueByLocation(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.dashboardService.getRevenueByLocation(start, end);
  }

  @Get('revenue/by-property')
  @ApiOperation({ summary: 'Get revenue breakdown by property' })
  @ApiQuery({ name: 'locationId', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  getRevenueByProperty(
    @Query('locationId') locationId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.dashboardService.getRevenueByProperty(locationId, start, end);
  }

  @Get('revenue/by-month')
  @ApiOperation({ summary: 'Get monthly revenue for a year' })
  @ApiQuery({ name: 'year', required: true, type: Number })
  getRevenueByMonth(@Query('year') year: string) {
    const yearNum = parseInt(year, 10) || new Date().getFullYear();
    return this.dashboardService.getRevenueByMonth(yearNum);
  }

  @Get('top-properties')
  @ApiOperation({ summary: 'Get top performing properties' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  getTopProperties(
    @Query('limit') limit?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.dashboardService.getTopProperties(limitNum, start, end);
  }

  @Get('recent-bookings')
  @ApiOperation({ summary: 'Get recent bookings' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getRecentBookings(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.dashboardService.getRecentBookings(limitNum);
  }
}
