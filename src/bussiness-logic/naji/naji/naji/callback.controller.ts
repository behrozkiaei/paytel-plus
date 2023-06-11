import { Controller, Get, Redirect,Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NajiService } from './naji.service';

@ApiTags("Naji callback services Api's")
@Controller('naji-callback')
export class NajiCallbackController {
  constructor(
    private najiService: NajiService,
  ) {}

  @Get('callback')
  // @Redirect()
  async callback(@Query() query: any) {
    console.log("calback controller")
    const res = await this.najiService.handleCallback(query);
    return res;
  }
}
