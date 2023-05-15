import { Controller, Get, Redirect,Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NajiService } from './naji.service';

@ApiTags("Naji callback services Api's")
@Controller('naji-callback')
export class NajiAuthController {
  constructor(
    private najiService: NajiService,
  ) {}

  @Get('callback')
  @Redirect()
  callback(@Query() query: any) {
    return this.najiService.handleCallback(query);
  }
}
