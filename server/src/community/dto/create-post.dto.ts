import { IsString, IsNotEmpty, MaxLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreatePostDto {
  @ApiProperty({ description: '帖子内容', maxLength: 500 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  content: string
}
