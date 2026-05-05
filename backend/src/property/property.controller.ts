import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Properties')
@Controller('properties')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new property' })
  create(@Body() createPropertyDto: CreatePropertyDto) {
    return this.propertyService.create(createPropertyDto);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get product categories' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  findCategories(@Query('isActive') isActive?: string) {
    const isActiveBoolean = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.propertyService.findCategories(isActiveBoolean);
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create product category' })
  createCategory(@Body() dto: CreateProductCategoryDto) {
    return this.propertyService.createCategory(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all properties' })
  @ApiQuery({ name: 'locationId', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  findAll(
    @Query('locationId') locationId?: string,
    @Query('type') type?: string,
    @Query('isActive') isActive?: string,
  ) {
    const isActiveBoolean = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.propertyService.findAll(locationId, type, isActiveBoolean);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get property by ID' })
  findOne(@Param('id') id: string) {
    return this.propertyService.findOne(id);
  }

  @Get(':id/availability')
  @ApiOperation({ summary: 'Check property option availability for selected dates' })
  getAvailability(
    @Param('id') id: string,
    @Query('productOptionId') productOptionId?: string,
    @Query('checkIn') checkIn?: string,
    @Query('checkOut') checkOut?: string,
    @Query('adults') adults?: string,
    @Query('children') children?: string,
  ) {
    return this.propertyService.getAvailability(id, {
      productOptionId,
      checkIn,
      checkOut,
      adults: adults ? Number(adults) : undefined,
      children: children ? Number(children) : undefined,
    });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update property' })
  update(@Param('id') id: string, @Body() updatePropertyDto: UpdatePropertyDto) {
    return this.propertyService.update(id, updatePropertyDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete property' })
  remove(@Param('id') id: string) {
    return this.propertyService.remove(id);
  }
}
