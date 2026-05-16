import { IsString, IsNotEmpty, IsNumber, IsInt, Min, Max, IsOptional, Matches } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateRecordDto {
  @ApiProperty({ description: '记录唯一 ID（客户端生成）' })
  @IsString()
  @IsNotEmpty()
  id: string

  @ApiProperty({ description: '行为，如：请吃饭、送礼物' })
  @IsString()
  @IsNotEmpty()
  action: string

  @ApiProperty({ description: '对象名称' })
  @IsString()
  @IsNotEmpty()
  target: string

  @ApiProperty({ description: '花费金额', default: 0 })
  @IsNumber()
  @Min(0)
  amount: number

  @ApiProperty({ description: '心情指数 1-5', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  simpIndex: number

  @ApiProperty({ description: '日期，格式 YYYY-MM-DD' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: '日期格式应为 YYYY-MM-DD' })
  date: string

  @ApiProperty({ description: '备注', required: false })
  @IsString()
  @IsOptional()
  note?: string

  @ApiProperty({ description: '类型：out/支出，in/收入，none/中性', required: false })
  @IsString()
  @IsOptional()
  type?: string

  @ApiProperty({ description: '图片 URL 列表', required: false })
  @IsString({ each: true })
  @IsOptional()
  images?: string[]
}
