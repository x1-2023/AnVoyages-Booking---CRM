import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface TurnstileVerifyResponse {
  success?: boolean;
  'error-codes'?: string[];
}

@Injectable()
export class CaptchaService {
  constructor(private readonly configService: ConfigService) {}

  isTurnstileEnabled() {
    return this.configService.get<string>('TURNSTILE_ENABLED') === 'true';
  }

  async verifyTurnstile(token?: string, remoteIp?: string) {
    if (!this.isTurnstileEnabled()) return;

    const secret = this.configService.get<string>('TURNSTILE_SECRET_KEY');
    if (!secret) {
      throw new BadRequestException('Turnstile is enabled but not configured');
    }

    if (!token) {
      throw new BadRequestException('Captcha verification is required');
    }

    const body = new URLSearchParams({
      secret,
      response: token,
    });

    if (remoteIp) {
      body.set('remoteip', remoteIp);
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
    });

    if (!response.ok) {
      throw new BadRequestException('Captcha verification failed');
    }

    const result = (await response.json()) as TurnstileVerifyResponse;
    if (!result.success) {
      throw new BadRequestException('Captcha verification failed');
    }
  }
}
