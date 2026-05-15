import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ThrottlerModule } from '@nestjs/throttler'
import { AuthModule } from './auth/auth.module'
import { RecordsModule } from './records/records.module'
import { StatsModule } from './stats/stats.module'
import { TodoModule } from './todo/todo.module'
import { User } from './auth/entities/user.entity'
import { Record } from './records/entities/record.entity'
import { Todo } from './todo/entities/todo.entity'
import { UploadModule } from './common/upload/upload.module'
import { HealthController } from './health.controller'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 30 }]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT', 5432),
        database: config.get<string>('DB_DATABASE'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        entities: [User, Record, Todo],
        synchronize: config.get<string>('NODE_ENV') !== 'production',
      }),
    }),
    AuthModule,
    RecordsModule,
    StatsModule,
    TodoModule,
    UploadModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
