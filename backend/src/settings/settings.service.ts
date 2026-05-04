import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  private readonly privateSettingKeys = new Set([
    'sepay_secret_key',
    'sepay_ipn_secret_key',
  ]);

  async getSetting(key: string) {
    if (this.privateSettingKeys.has(key)) return null;

    const setting = await this.prisma.systemSetting.findUnique({
      where: { key },
    });
    return setting?.value || null;
  }

  async getAllSettings(includePrivate = false) {
    const settings = await this.prisma.systemSetting.findMany();

    // Convert to key-value object
    const settingsObj: Record<string, string> = {};
    settings.forEach((setting) => {
      if (!includePrivate && this.privateSettingKeys.has(setting.key)) return;
      settingsObj[setting.key] = setting.value;
    });

    return settingsObj;
  }

  async getPrivateSetting(key: string) {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key },
    });
    return setting?.value || null;
  }

  async updateSetting(key: string, updateSettingDto: UpdateSettingDto) {
    return this.prisma.systemSetting.upsert({
      where: { key },
      update: { value: updateSettingDto.value },
      create: {
        key,
        value: updateSettingDto.value,
      },
    });
  }

  async updateMultipleSettings(settings: Record<string, string>) {
    const promises = Object.entries(settings).map(([key, value]) =>
      this.prisma.systemSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      }),
    );

    await Promise.all(promises);

    return this.getAllSettings(true);
  }

  async deleteSetting(key: string) {
    await this.prisma.systemSetting.delete({
      where: { key },
    });

    return { message: 'Setting deleted successfully' };
  }

  // Preset default settings
  async initializeDefaults() {
    const defaults = {
      'site_name': 'An Voyages',
      'site_tagline': 'Tour Hạ Long, Cát Bà, Cô Tô, Quan Lạn',
      'hero_background_image': '',
      'hero_title': 'Đặt tour đảo, du thuyền và kỳ nghỉ biển miền Bắc',
      'hero_subtitle': 'Chọn ngày đi và số khách, An Voyages sẽ gợi ý du thuyền, khách sạn hoặc combo phù hợp với ngân sách của bạn.',
      'home_hero_summary': 'Tư vấn nhanh qua điện thoại/Zalo, giá gói rõ ràng, phù hợp cho gia đình, cặp đôi, nhóm bạn và công ty.',
      'contact_email': 'contact@anvoyages.vn',
      'contact_phone': '+84 123 456 789',
      'footer_text': '© 2025 An Voyages. All rights reserved.',
      'primary_color': '#3B82F6',
      'secondary_color': '#10B981',
      'sepay_enabled': 'false',
      'sepay_env': 'sandbox',
      'sepay_merchant_id': '',
      'sepay_secret_key': '',
      'sepay_ipn_secret_key': '',
      'sepay_payment_method': 'BANK_TRANSFER',
      'sepay_currency': 'VND',
      'sepay_order_prefix': 'AV',
      'sepay_deposit_percent': '50',
      'sepay_transfer_template': '{bookingCode} {customerName} {phoneLast4}',
      'sepay_success_url': '',
      'sepay_error_url': '',
      'sepay_cancel_url': '',
      'currency_rate_vnd': '1',
      'currency_rate_usd': '25500',
      'currency_rate_gbp': '32000',
      'currency_rate_eur': '27500',
    };

    for (const [key, value] of Object.entries(defaults)) {
      await this.prisma.systemSetting.upsert({
        where: { key },
        update: {},
        create: { key, value },
      });
    }

    return this.getAllSettings(true);
  }
}
