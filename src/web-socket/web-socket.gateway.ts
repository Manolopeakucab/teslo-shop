import { WebSocketGateway } from "@nestjs/websockets";
import { WebSocketService } from "./web-socket.service";



@WebSocketGateway({cors: true,  })
export class WebSocketGatewaycontroller {
  constructor(private readonly webSocketService: WebSocketService) {}
}
