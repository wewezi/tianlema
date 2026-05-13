import { IsString, IsNotEmpty, IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class LoginDto {
  @ApiProperty({ description: '微信 wx.login() 返回的 code' })
  @IsString()
  @IsNotEmpty()
  code: string

  @ApiProperty({ description: '用户昵称', required: false })
  @IsString()
  @IsOptional()
  nickname?: string

  @ApiProperty({ description: '用户头像 URL', required: false })
  @IsString()
  @IsOptional()
  avatarUrl?: string
}
