import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { WebSocketService } from "./web-socket.service";
import { Socket,Server } from "socket.io";
import { NewMessageDTO } from "./dtos/new-message.dto";
import { JwtService } from "@nestjs/jwt";
import { JwtPayload } from "src/auth/interfaces/jwt-payload.interfaces";



@WebSocketGateway({cors: true, namespace: '/' })

export class WebSocketGatewaycontroller implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss:Server;

  constructor(
    private readonly webSocketService: WebSocketService,
    private readonly jwtService: JwtService
  ) {}

 async handleConnection(client: Socket) {

    const token = client.handshake.headers.autentication as string;
    let payload: JwtPayload
    try {
      
      payload = this.jwtService.verify(token);
      await this.webSocketService.registerClient(client,payload.id);

    } catch (error) {
      client.disconnect();
      return;
    }

    console.log({payload});

    

    this.wss.emit('clients-updated', this.webSocketService.getConnectedClients());
  }

  handleDisconnect(client: Socket) {
     this.webSocketService.removeClient(client.id);

     this.wss.emit('clients-updated', this.webSocketService.getConnectedClients());

  }

  @SubscribeMessage('message-from-client')
  OnMessagefromclient( client: Socket, payload:NewMessageDTO) {
    
    //Mandar mensajes solo al cliente que lo envio
   /*client.emit('message-from-server', {
    fullname:'Manolo',
    message: payload.message || 'no-message'
    });
    */

    //enviar a todos menos al cliente inicial
    /*client.broadcast.emit('message-from-server', {
      fullname:'Manolo',
      message: payload.message || 'no-message'
      });
    */  
      //para enviar a todos
      this.wss.emit('message-from-server', {
        fullname:this.webSocketService.getUserFullName(client.id),
        message: payload.message || 'no-message'
        });
  }


}
