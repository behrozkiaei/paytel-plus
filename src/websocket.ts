import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import {
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { WatchService } from './watch.service';
import { Server } from 'socket.io';

@WebSocketGateway()
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(private watchService: WatchService) {}

  async afterInit() {
    console.log('socker srever on');
    await this.watchService.connect();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleConnection(client: any, ...args: any[]) {
    console.log('start joining socket and watch');
    // this.watchService.watch('user', client);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  handleDisconnect(client: any) {
    console.log('Client connected: ' + client.id);
  }
}
