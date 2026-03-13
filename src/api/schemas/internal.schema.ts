import { ApiPropertyOptional } from '@nestjs/swagger';

export class DeleteDto {
  @ApiPropertyOptional()
  id: number;
  @ApiPropertyOptional()
  username: string;
}
