import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { AuthPayloadDTO } from './auth.dto';
import { compareSync, hashSync } from 'bcrypt-ts';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { JwtDto } from '../schemas/jwt.schema';
import { User } from '../other/user.type';
import { UserDto } from '../schemas/user.schema';
import { prisma } from '../../prisma.client';
import { JwtPayload } from '../other/jwt.type';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async loginUser(payload: AuthPayloadDTO): Promise<JwtDto> {
    const tryUser = await this.usersService.findUser(payload);
    if (!tryUser) {
      throw new NotFoundException('User not found');
    }
    const user: User = tryUser;

    const pwCheck = compareSync(payload.password, user.password);

    if (!pwCheck) {
      throw new UnauthorizedException('Wrong password');
    }

    const jwtPayload: JwtPayload = {
      username: user.username,
    };

    const jwt = await this.jwtService.signAsync(jwtPayload);

    return { jwt };
  }

  async getUserData(user: User) {
    const gotUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!gotUser) {
      throw new NotFoundException('User not found');
    }

    return gotUser as UserDto;
  }

  async registerUser(payload: AuthPayloadDTO): Promise<JwtDto> {
    const findUser = await this.usersService.findUser(payload);
    if (findUser) {
      throw new ConflictException('User already exists');
    }

    payload.username = this.normalizeUsername(payload.username);

    if (payload.password.length < 16) {
      throw new BadRequestException(
        'Password must be at least 16 characters long',
      );
    }
    if (payload.password.length > 128) {
      throw new BadRequestException(
        'Password must be at most 128 characters long',
      );
    }

    payload.password = hashSync(payload.password);

    const newUser = await this.usersService.createUser(payload);
    if (!newUser) {
      throw new InternalServerErrorException('User could not be created');
    }

    const jwtPayload: JwtPayload = {
      username: newUser.username,
    };

    const jwt = await this.jwtService.signAsync(jwtPayload);

    return { jwt };
  }

  private normalizeUsername = (value: string) => {
    return value.toLowerCase().replace(/[^a-z0-9_]/g, '');
  };
}
