import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty()
  message: string;
}

export class ChatIdDto {
  @ApiPropertyOptional()
  chatId: number;
}

export class UpdateChatDto {
  @ApiProperty()
  afterDate: string;
}

export class ChatMessageDto {
  @ApiProperty()
  message: string;
  @ApiProperty()
  date: Date;
  @ApiProperty()
  username: string;
}

export class ChatDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  username: string;
  @ApiProperty()
  lastMessage: string;
  @ApiProperty()
  lastMessageUsername: string;
  @ApiProperty()
  lastMessageDate: Date;
}
