import { Module } from '@nestjs/common';
import { WebSocketService } from './web-socket.service';
import { WebSocketGatewaycontroller } from './web-socket.gateway';

@Module({
  providers: [WebSocketGatewaycontroller, WebSocketService]
})
export class WebSocketModule {}
