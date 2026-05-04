import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CustomerService } from './customer.service';

@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  findAll(@Query('q') q?: string) {
    return this.customerService.findAll(q);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.customerService.create(body);
  }

  @Post(':id/communications')
  createCommunication(@Param('id') id: string, @Body() body: any) {
    return this.customerService.createCommunication(id, body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.customerService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customerService.remove(id);
  }
}
