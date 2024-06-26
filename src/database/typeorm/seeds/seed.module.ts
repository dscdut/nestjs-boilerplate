import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SharedModule } from '@shared/services/shared.module';
import { ApiConfigService } from '@shared/services/api-config.service';

import { UserSeedModule } from './user/user-seed.module';

import { RoleSeedModule } from './role/role-seed.module';

@Module({
  imports: [
    RoleSeedModule,
    UserSeedModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, SharedModule],
      useFactory: (configService: ApiConfigService) =>
        configService.postgresConfig,
      inject: [ApiConfigService, ConfigService],
    }),
  ],
})
export class SeedModule {}
