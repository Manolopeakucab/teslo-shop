import { Module } from '@nestjs/common';
import { WebSocketService } from './web-socket.service';
import { WebSocketGatewaycontroller } from './web-socket.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';

@Module({
  providers: [WebSocketGatewaycontroller, WebSocketService],
  imports: [AuthModule],
})
export class WebSocketModule {}
