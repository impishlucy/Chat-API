import { Controller, Req, UseGuards, Post, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { InternalService } from './internal.service';
import { User } from '../other/user.type';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { DeleteDto } from '../schemas/internal.schema';

type RequestWithUser = Request & {
  user: User;
};

@Controller('internal')
export class InternalController {
  constructor(private readonly internalService: InternalService) {}

  @ApiInternalServerErrorResponse()
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  @Post('create-chat')
  @UseGuards(AuthGuard('jwt'))
  createChat(@Req() request: RequestWithUser) {
    return this.internalService.createChat(request.user);
  }

  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse()
  @ApiInternalServerErrorResponse()
  @ApiBadRequestResponse()
  @Post('delete-chat')
  @UseGuards(AuthGuard('jwt'))
  deleteChat(@Req() request: RequestWithUser, @Body() data: DeleteDto) {
    return this.internalService.deleteChat(request.user, data);
  }

  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse()
  @ApiInternalServerErrorResponse()
  @ApiBadRequestResponse()
  @Post('delete-user')
  @UseGuards(AuthGuard('jwt'))
  deleteUser(@Req() request: RequestWithUser, @Body() data: DeleteDto) {
    return this.internalService.deleteUser(request.user, data);
  }
}
