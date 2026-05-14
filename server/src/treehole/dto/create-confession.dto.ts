import { IsString, MinLength, MaxLength, IsOptional, IsArray } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateConfessionDto {
  @ApiProperty({ description: '匿名故事内容' })
  @IsString()
  @MinLength(5, { message: '内容至少5个字' })
  @MaxLength(500, { message: '内容最多500字' })
  content: string

  @ApiProperty({ description: '图片列表', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[]
}
