import { Injectable, NotFoundException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from './jwt.type';
import { User } from './user.type';
import { prisma } from '../../prisma.client';
import { JWT_SECRET } from '../../constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    // Fetch the user from the database using the username from the JWT payload
    const tryUser = await prisma.user.findUnique({
      where: { username: payload.username },
    });

    if (!tryUser) {
      throw new NotFoundException('User not found');
    }

    const user: User = tryUser;

    return {
      id: user.id,
      username: user.username,
      password: '', // Never include the password
      isAdmin: user.isAdmin,
      isSupporter: user.isSupporter,
    };
  }
}
