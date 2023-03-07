import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';
@Injectable()
export class WatchService {
  private client: MongoClient;
  private db: any;
  private baseUrl = this.config.get('DATABASE_URL');
  constructor(private config: ConfigService) {
    this.client = new MongoClient(this.baseUrl);
  }

  async connect() {
    await this.client.connect();
    console.log('watch connection started');
    this.db = this.client.db('paytel');

    this.watchByServer('user');
  }

  async watchByServer(collectionName: string) {
    const collection = this.db.collection(collectionName);
    const changeStream = collection.watch();
    changeStream.on('change', (change: any) => {
      console.log('users changed triggered');
    });
  }

  async watch(collectionName: string, socket: any) {
    const collection = this.db.collection(collectionName);
    const changeStream = collection.watch();
    changeStream.on('change', (change: any) => {
      console.log('users changed triggered');
      socket.emit('change', change);
    });
  }
}
