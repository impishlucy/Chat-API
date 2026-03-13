import { Injectable } from '@nestjs/common';
import { prisma } from '../../prisma.client';

@Injectable()
export class BanService {
  async isIpBanned(payload: string) {
    return prisma.bannedIps.findUnique({
      where: { ip: payload },
    });
  }
}
