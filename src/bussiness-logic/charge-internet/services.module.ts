
import { WatchService } from '../../watch.service';
import { Module, CacheModule } from '@nestjs/common';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';

@Module({
  // imports: [CacheModule.register()],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports :[ServicesService]
})
export class ServicesModule {}
