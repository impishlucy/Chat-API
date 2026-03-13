import { Injectable } from '@nestjs/common';
import { prisma } from '../../prisma.client';
import { AuthPayloadDTO } from '../auth/auth.dto';

@Injectable()
export class UsersService {
  async findUser(payload: AuthPayloadDTO) {
    payload.username = this.normalizeUsername(payload.username);
    return prisma.user.findUnique({
      where: { username: payload.username },
    });
  }
  async createUser(payload: AuthPayloadDTO) {
    payload.username = this.normalizeUsername(payload.username);
    return prisma.user.create({ data: payload });
  }

  normalizeUsername = (value: string) => {
    return value.toLowerCase().replace(/[^a-z0-9_]/g, '');
  };
}
