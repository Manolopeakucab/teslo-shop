import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { error } from 'console';
import { Socket } from 'socket.io';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

interface ConnectedClients {
    [id: string]: {
        socket:Socket,
        user: User
    };
} 
@Injectable()
export class WebSocketService {

    private ConnectedCLient: ConnectedClients = {}

    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) {}

    async registerClient(client: Socket, userId: string) {

        const user = await this.userRepo.findOneBy({ id: userId });
        if(!user) throw new Error('User not found');
        if(!user.isActive) throw new Error('User is not active');

        this.checkUserConnection(user);

        this.ConnectedCLient[client.id] = {
            socket: client,
            user: user,
        };

    }

    removeClient(clientId: string) {

        delete this.ConnectedCLient[clientId];

    } 
    
    getConnectedClients(): string[] {

        return Object.keys(this.ConnectedCLient);
    
      }
    
      getUserFullName(socketID: string) {
        return this.ConnectedCLient[socketID].user.fullname;
      }

  private checkUserConnection(user:User){
    for (const clientID of Object.keys(this.ConnectedCLient)){
        const connectedClient = this.ConnectedCLient[clientID];

        if(connectedClient.user.id === user.id){
            connectedClient.socket.disconnect();
            break;
        }
    }
  }

}
