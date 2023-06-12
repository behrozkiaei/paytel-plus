import { Controller, Get,Res, Redirect,Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NajiService } from './naji.service';

@ApiTags("Naji callback services Api's")
@Controller('naji-callback')
export class NajiCallbackController {
  constructor(
    private najiService: NajiService,
  ) {}

  @Get('callback')
  @Redirect()
  async callback(@Query() query: any,@Res() res) {
    const data =  await this.najiService.handleCallback(query);
    return res.redirect(data?.url);
  }
}
