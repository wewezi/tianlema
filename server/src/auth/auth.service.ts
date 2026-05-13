import { Injectable, UnauthorizedException, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'
import { User } from './entities/user.entity'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async wxLogin(dto: LoginDto): Promise<{ token: string; user: Partial<User> }> {
    const appid = this.configService.get<string>('WX_APPID')
    const secret = this.configService.get<string>('WX_SECRET')

    let openid: string
    try {
      const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${dto.code}&grant_type=authorization_code`
      const { data } = await axios.get(url)
      if (data.errcode) {
        throw new UnauthorizedException(`微信登录失败: ${data.errmsg}`)
      }
      openid = data.openid
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err
      this.logger.error('微信 API 调用失败', err.message)
      throw new UnauthorizedException('微信登录服务暂时不可用')
    }

    let user = await this.userRepo.findOne({ where: { openid } })
    if (!user) {
      user = this.userRepo.create({ openid })
    }
    if (dto.nickname) user.nickname = dto.nickname
    if (dto.avatarUrl) user.avatarUrl = dto.avatarUrl
    await this.userRepo.save(user)

    const token = this.jwtService.sign({ sub: user.id, openid: user.openid })
    return {
      token,
      user: { id: user.id, nickname: user.nickname, avatarUrl: user.avatarUrl },
    }
  }

  async validateUser(userId: number): Promise<User> {
    return this.userRepo.findOne({ where: { id: userId } })
  }

  async updateProfile(userId: number, data: { nickname?: string; avatarUrl?: string }): Promise<Partial<User>> {
    const user = await this.userRepo.findOne({ where: { id: userId } })
    if (!user) throw new UnauthorizedException('用户不存在')
    if (data.nickname !== undefined) user.nickname = data.nickname
    if (data.avatarUrl !== undefined) user.avatarUrl = data.avatarUrl
    await this.userRepo.save(user)
    return { id: user.id, nickname: user.nickname, avatarUrl: user.avatarUrl }
  }

  async getProfile(userId: number): Promise<Partial<User>> {
    const user = await this.userRepo.findOne({ where: { id: userId } })
    if (!user) throw new UnauthorizedException('用户不存在')
    return { id: user.id, nickname: user.nickname, avatarUrl: user.avatarUrl }
  }
}
