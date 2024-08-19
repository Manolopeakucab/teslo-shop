import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JWtStrategy } from './Strategy/jwt.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JWtStrategy],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User]),

    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory:( configservice: ConfigService) => {
        return {
      secret:configservice.get('JWT_SECRET'),
      signOptions: { 
        expiresIn: '2h' 
      }
    }
  }
})
],

  exports: [TypeOrmModule,JWtStrategy, PassportModule, JwtModule]
})
export class AuthModule {}
