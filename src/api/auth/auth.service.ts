import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthPayloadDTO } from './auth.dto';
import { prisma } from '../../prisma.client';
import { User } from '../other/user.type';
import { compareSync } from 'bcrypt-ts';

@Injectable()
export class AuthService {
  async loginUser(payload: AuthPayloadDTO) {
    const user = await prisma.user.findUnique({
      where: { username: payload.username },
    });
    loginUser(user, payload);
  }
}

function loginUser(user: User, payload: AuthPayloadDTO) {
  if (!user) {
    throw new NotFoundException();
  }
  const pwCheck = compareSync(payload.password, user.password);

  if (!pwCheck) {
    throw new UnauthorizedException();
  }
}
