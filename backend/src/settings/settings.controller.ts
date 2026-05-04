import { Controller, Get, Put, Delete, Body, Param, UseGuards, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { UpdateMultipleSettingsDto } from './dto/update-multiple-settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all settings (public)' })
  getAllSettings() {
    return this.settingsService.getAllSettings();
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all settings including private admin settings (auth required)' })
  getAllAdminSettings() {
    return this.settingsService.getAllSettings(true);
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get setting by key (public)' })
  getSetting(@Param('key') key: string) {
    return this.settingsService.getSetting(key);
  }

  @Put(':key')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update single setting (auth required)' })
  updateSetting(@Param('key') key: string, @Body() updateSettingDto: UpdateSettingDto) {
    return this.settingsService.updateSetting(key, updateSettingDto);
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update multiple settings (auth required)' })
  updateMultipleSettings(@Body() updateMultipleDto: UpdateMultipleSettingsDto) {
    return this.settingsService.updateMultipleSettings(updateMultipleDto.settings);
  }

  @Post('initialize')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initialize default settings (auth required)' })
  initializeDefaults() {
    return this.settingsService.initializeDefaults();
  }

  @Delete(':key')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete setting (auth required)' })
  deleteSetting(@Param('key') key: string) {
    return this.settingsService.deleteSetting(key);
  }
}
