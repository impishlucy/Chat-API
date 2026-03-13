import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '../other/user.type';
import { prisma } from '../../prisma.client';
import { ChatDto, ChatMessageDto } from '../schemas/chat.schema';

@Injectable()
export class ChatService {
  async getAllChats(user: User) {
    if (!user.isAdmin && !user.isSupporter) {
      throw new UnauthorizedException('Not authorized');
    }

    const chats = await prisma.chat.findMany({
      select: {
        id: true,
        participants: {
          where: {
            isAdmin: false,
            isSupporter: false,
          },
          select: {
            username: true,
          },
        },
        messages: {
          select: {
            message: true,
            date: true,
            sender: {
              select: {
                username: true,
              },
            },
          },
          orderBy: {
            id: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        id: 'asc',
      },
    });

    const reshapedChats: ChatDto[] = chats.map((chat) => {
      const userParticipant = chat.participants[0];
      const lastMessage = chat.messages[0];

      return {
        id: chat.id,
        username: userParticipant?.username ?? null,
        lastMessage: lastMessage?.message ?? null,
        lastMessageUsername: lastMessage?.sender?.username ?? null,
        lastMessageDate: lastMessage?.date ?? null,
      };
    });

    return reshapedChats;
  }

  async getChatForUser(user: User, queryId?: number) {
    let chatId: number;
    if (user.isAdmin || user.isSupporter) {
      if (!queryId) {
        throw new BadRequestException('Query parameter "chatId" is required');
      }
      chatId = queryId;
    } else {
      chatId = await this.getActiveChatForUser(user.id);
    }

    chatId = Number(chatId);

    const messages = await prisma.message.findMany({
      where: {
        chatId: chatId,
      },
      select: {
        message: true,
        date: true,
        sender: {
          select: {
            username: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    const reshapedMessages: ChatMessageDto[] = messages.map((message) => ({
      message: message.message,
      date: message.date,
      username: message.sender.username,
    }));

    return reshapedMessages;
  }

  async getChatUpdatesForUser(user: User, after: string, queryId?: number) {
    let chatId: number;
    if (user.isAdmin || user.isSupporter) {
      if (!queryId) {
        throw new BadRequestException('Query parameter "chatId" is required');
      }
      chatId = queryId;
    } else {
      chatId = await this.getActiveChatForUser(user.id);
    }

    chatId = Number(chatId);

    if (!after) {
      throw new BadRequestException('Query parameter "after" is required');
    }

    const afterDate = new Date(after);

    if (Number.isNaN(afterDate.getTime())) {
      throw new BadRequestException('Invalid "after" timestamp');
    }

    const messages = await prisma.message.findMany({
      where: {
        chatId: chatId,
        date: {
          gt: afterDate,
        },
      },
      select: {
        message: true,
        date: true,
        sender: {
          select: {
            username: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    const reshapedMessages: ChatMessageDto[] = messages.map((message) => ({
      message: message.message,
      date: message.date,
      username: message.sender.username,
    }));

    return reshapedMessages;
  }

  async sendMessage(user: User, chatData: string, queryId?: number) {
    if (!chatData || chatData.trim() === '') {
      throw new BadRequestException('Message content is required');
    }

    let chatId: number;
    if (user.isAdmin || user.isSupporter) {
      if (!queryId) {
        throw new BadRequestException('Query parameter "chatId" is required');
      }
      chatId = queryId;
    } else {
      chatId = await this.getActiveChatForUser(user.id);
    }

    chatId = Number(chatId);

    // Call some message validation logic here to remove spam or inappropriate content.

    await prisma.message.create({
      data: {
        chatId: chatId,
        message: chatData,
        senderId: user.id,
        date: new Date(),
      },
    });
  }

  private async getActiveChatForUser(user: number): Promise<number> {
    user = Number(user);
    const chat = await prisma.chat.findFirst({
      where: {
        participants: {
          some: {
            id: user,
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (!chat) {
      throw new NotFoundException('No active chat found for this user');
    }

    return chat.id;
  }
}
