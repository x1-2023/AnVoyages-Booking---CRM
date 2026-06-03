import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const serviceToken = process.env.ANVOYAGES_SERVICE_TOKEN;

    if (serviceToken && this.extractServiceToken(request) === serviceToken) {
      request.user = {
        userId: 'service:travelops',
        email: 'travelops-service@anvoyages.local',
        role: 'service',
      };
      return true;
    }

    return super.canActivate(context);
  }

  private extractServiceToken(request: any) {
    const headerToken = request.headers?.['x-service-token'];
    if (typeof headerToken === 'string' && headerToken.trim()) {
      return headerToken.trim();
    }

    const authHeader = request.headers?.authorization;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      return authHeader.slice('Bearer '.length).trim();
    }

    return undefined;
  }
}
