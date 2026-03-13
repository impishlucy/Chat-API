import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthPayloadDTO } from './auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { User } from '../other/user.type';
import { JwtDto } from '../schemas/jwt.schema';
import { UserDto } from '../schemas/user.schema';
import {
  ApiBody,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

type RequestWithUser = Request & {
  user: User;
};

@Controller('users')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBody({ type: AuthPayloadDTO })
  @ApiOkResponse({ type: JwtDto })
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @Post('login')
  async Login(@Body() payload: AuthPayloadDTO) {
    return this.authService.loginUser(payload);
  }

  @ApiBody({ type: AuthPayloadDTO })
  @ApiOkResponse({ type: JwtDto })
  @ApiConflictResponse()
  @ApiInternalServerErrorResponse()
  @ApiBadRequestResponse()
  @Post('register')
  async Register(@Body() payload: AuthPayloadDTO) {
    return this.authService.registerUser(payload);
  }

  @ApiOkResponse({ type: UserDto })
  @ApiNotFoundResponse()
  @Get('data')
  @UseGuards(AuthGuard('jwt'))
  async getUserData(@Req() request: RequestWithUser) {
    return this.authService.getUserData(request.user);
  }
}
