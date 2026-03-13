import {
  Controller,
  Get,
  Req,
  UseGuards,
  Query,
  Post,
  Body,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ChatService } from './chat.service';
import { User } from '../other/user.type';
import {
  SendMessageDto,
  ChatDto,
  ChatMessageDto,
  UpdateChatDto,
  ChatIdDto,
} from '../schemas/chat.schema';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

type RequestWithUser = Request & {
  user: User;
};

@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @ApiOkResponse({ type: ChatDto, isArray: true })
  @ApiUnauthorizedResponse()
  @Get('get-all')
  @UseGuards(AuthGuard('jwt'))
  getAllChats(@Req() request: RequestWithUser) {
    return this.chatService.getAllChats(request.user);
  }

  @ApiOkResponse({ type: ChatMessageDto, isArray: true })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @Get('get-one')
  @UseGuards(AuthGuard('jwt'))
  getChat(@Req() request: RequestWithUser, @Query() chatId?: ChatIdDto) {
    return this.chatService.getChatForUser(request.user, chatId?.chatId);
  }

  @ApiOkResponse({ type: ChatMessageDto, isArray: true })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @Get('update')
  @UseGuards(AuthGuard('jwt'))
  updateChat(
    @Req() request: RequestWithUser,
    @Query() date: UpdateChatDto,
    @Query() chatId?: ChatIdDto,
  ) {
    return this.chatService.getChatUpdatesForUser(
      request.user,
      date.afterDate,
      chatId?.chatId,
    );
  }

  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @Post('send')
  @UseGuards(AuthGuard('jwt'))
  sendMessage(
    @Req() request: RequestWithUser,
    @Body() chatData: SendMessageDto,
    @Query() chatId?: ChatIdDto,
  ) {
    return this.chatService.sendMessage(
      request.user,
      chatData.message,
      chatId?.chatId,
    );
  }
}
