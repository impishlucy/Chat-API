import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthPayloadDTO } from './auth.dto';

@Controller('users')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  Login(@Body() payload: AuthPayloadDTO) {
    this.authService.loginUser(payload);
  }
}
