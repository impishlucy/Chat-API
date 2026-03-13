import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '../other/user.type';
import { prisma } from '../../prisma.client';
import { DeleteDto } from '../schemas/internal.schema';

@Injectable()
export class InternalService {
  async createChat(user: User) {
    if (user.isAdmin || user.isSupporter) {
      throw new InternalServerErrorException(
        'Not a valid user for this action',
      );
    }

    const hasActiveChat = await prisma.chat.findFirst({
      where: {
        participants: {
          some: {
            id: user.id,
          },
        },
      },
    });

    if (hasActiveChat) {
      throw new BadRequestException('User already has an active chat');
    }

    const chat = await prisma.chat.create({
      data: {
        participants: {
          connect: [{ id: user.id }],
        },
      },
    });

    if (!chat) {
      throw new InternalServerErrorException('Chat could not be created');
    }

    return chat;
  }

  async deleteChat(user: User, data: DeleteDto) {
    if (!user.isAdmin || !user.isSupporter) {
      throw new UnauthorizedException('Not Allowed');
    }

    if (!data.id) {
      throw new BadRequestException('Username is required');
    }

    const chat = await prisma.chat.findUnique({
      where: {
        id: data.id,
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    try {
      await prisma.chat.delete({
        where: {
          id: data.id,
        },
      });
    } catch {
      throw new InternalServerErrorException('Chat could not be deleted');
    }
  }

  async deleteUser(user: User, data: DeleteDto) {
    if (!user.isAdmin || !user.isSupporter) {
      throw new UnauthorizedException('Not Allowed');
    }

    if (!data.username) {
      throw new BadRequestException('Username is required');
    }

    const foundUser = await prisma.user.findUnique({
      where: {
        username: data.username,
      },
    });

    if (!foundUser) {
      throw new NotFoundException('User not found');
    }

    try {
      await prisma.user.delete({
        where: {
          id: foundUser.id,
        },
      });
    } catch {
      throw new InternalServerErrorException('User could not be deleted');
    }
  }
}
