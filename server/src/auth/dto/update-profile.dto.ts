import { IsString, IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateProfileDto {
  @ApiProperty({ description: '用户昵称', required: false })
  @IsString()
  @IsOptional()
  nickname?: string

  @ApiProperty({ description: '用户头像 URL', required: false })
  @IsString()
  @IsOptional()
  avatarUrl?: string
}
