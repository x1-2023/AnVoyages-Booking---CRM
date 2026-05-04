import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IntegrationService } from './integration.service';

@ApiTags('Integrations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('integrations')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  @Get('channels')
  channels() {
    return this.integrationService.channels();
  }

  @Get('providers')
  providers() {
    return this.integrationService.providers();
  }

  @Post('channels')
  createChannel(@Body() body: any) {
    return this.integrationService.createChannel(body);
  }

  @Patch('channels/:id')
  updateChannel(@Param('id') id: string, @Body() body: any) {
    return this.integrationService.updateChannel(id, body);
  }

  @Get('rules')
  rules() {
    return this.integrationService.rules();
  }

  @Post('rules')
  createRule(@Body() body: any) {
    return this.integrationService.createRule(body);
  }

  @Patch('rules/:id')
  updateRule(@Param('id') id: string, @Body() body: any) {
    return this.integrationService.updateRule(id, body);
  }
}
