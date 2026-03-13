import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtPayload } from '../other/jwt.type';
import { BanService } from '../bans/ban.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private banService: BanService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      request['user'] = await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('No valid token provided');
    }

    const ips: string[] | null = this.extractIpFromHeader(request);

    if (ips) {
      for (const ip of ips) {
        if ((await this.banService.isIpBanned(ip)) !== null) {
          throw new ForbiddenException('Banned IP');
        }
      }
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private extractIpFromHeader(request: Request): string[] | null {
    const ip = request.headers['x-forwarded-for'];

    if (!ip) {
      return null;
    }
    if (typeof ip === 'string') {
      return [ip];
    }
    if (Array.isArray(ip)) {
      return ip;
    }

    return ip;
  }
}
