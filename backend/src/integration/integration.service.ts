import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const defaultChannels = [
  { provider: 'facebook', name: 'Facebook Page' },
  { provider: 'instagram', name: 'Instagram Business' },
  { provider: 'zalo', name: 'Zalo Official Account' },
  { provider: 'tiktok', name: 'TikTok Lead/Form' },
  { provider: 'sepay', name: 'Sepay Payment Webhook' },
];

@Injectable()
export class IntegrationService {
  constructor(private prisma: PrismaService) {}

  async channels() {
    await this.ensureDefaults();
    return this.prisma.integrationChannel.findMany({
      include: { automationRules: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  createChannel(body: any) {
    return this.prisma.integrationChannel.create({
      data: {
        provider: body.provider,
        name: body.name,
        status: body.status ?? 'not_connected',
        externalId: body.externalId,
        webhookUrl: body.webhookUrl,
        config: body.config ? JSON.stringify(body.config) : undefined,
      },
    });
  }

  updateChannel(id: string, body: any) {
    return this.prisma.integrationChannel.update({
      where: { id },
      data: {
        name: body.name,
        status: body.status,
        externalId: body.externalId,
        webhookUrl: body.webhookUrl,
        config: body.config ? JSON.stringify(body.config) : body.config,
        lastSyncAt: body.lastSyncAt ? new Date(body.lastSyncAt) : undefined,
      },
    });
  }

  rules() {
    return this.prisma.automationRule.findMany({
      include: { channel: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  createRule(body: any) {
    return this.prisma.automationRule.create({
      data: {
        channelId: body.channelId,
        name: body.name,
        trigger: body.trigger,
        conditions: body.conditions,
        action: body.action,
        template: body.template,
        isActive: body.isActive ?? true,
      },
      include: { channel: true },
    });
  }

  updateRule(id: string, body: any) {
    return this.prisma.automationRule.update({
      where: { id },
      data: body,
      include: { channel: true },
    });
  }

  private async ensureDefaults() {
    for (const channel of defaultChannels) {
      await this.prisma.integrationChannel.upsert({
        where: { provider: channel.provider },
        update: {},
        create: channel,
      });
    }
  }
}
