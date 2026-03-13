import { ApiProperty } from '@nestjs/swagger';

export class JwtDto {
  @ApiProperty()
  jwt: string;
}
