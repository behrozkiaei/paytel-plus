import { Controller, Get,Res, Redirect,Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NajiService } from './naji.service';
import { ConfigService } from '@nestjs/config';

@ApiTags("Naji callback services Api's")
@Controller('naji-callback')
export class NajiCallbackController {
  constructor(
    private najiService: NajiService,
    private config : ConfigService
  ) {}

  @Get('callback')
  // @Redirect()
  async callback(@Query() query: any,@Res() res) {
    const data =  await this.najiService.handleCallback(query);
    return res.redirect(data?.url);
  }
  
  @Get('check-callback')
  // @Redirect()
  async callbackCheck(@Query() query: any,@Res() res) {
    const response = JSON.parse(`{"violations":[{"violationId":"012571155393","violationOccuredDate":"1401/08/27 - 11:16","violationOccuredTime":"11:16","violationDeliveryType":{"violationDeliveryTypeName":"دوربين"},"violationAddress":"ساري بابل ب امام خامنه ا ارشاد 13","violationType":{"violationTypeId":"2056","violationTypeName":"تجاوز از سرعت مجاز (تا سي كيلومتر در ساعت)"},"finalPrice":"459000","paperId":"7115539300293","paymentId":"45925066","hasImage":true},{"violationId":"012570225335","violationOccuredDate":"1401/08/27 - 13:23","violationOccuredTime":"13:23","violationDeliveryType":{"violationDeliveryTypeName":"دوربين"},"violationAddress":"ساري بابل ب امام رضاخداداد 32","violationType":{"violationTypeId":"2056","violationTypeName":"تجاوز از سرعت مجاز (تا سي كيلومتر در ساعت)"},"finalPrice":"459000","paperId":"7022533500292","paymentId":"45924687","hasImage":true},{"violationId":"012570226295","violationOccuredDate":"1401/08/28 - 19:37","violationOccuredTime":"19:37","violationDeliveryType":{"violationDeliveryTypeName":"دوربين"},"violationAddress":"ساري بابل ب امام رضاخداداد 32","violationType":{"violationTypeId":"2056","violationTypeName":"تجاوز از سرعت مجاز (تا سي كيلومتر در ساعت)"},"finalPrice":"459000","paperId":"7022629500293","paymentId":"45924687","hasImage":true},{"violationId":"012573058157","violationOccuredDate":"1401/09/07 - 12:43","violationOccuredTime":"12:43","violationDeliveryType":{"violationDeliveryTypeName":"دوربين"},"violationAddress":"ساري بابل ب امام رضاخداداد 32","violationType":{"violationTypeId":"2056","violationTypeName":"تجاوز از سرعت مجاز (تا سي كيلومتر در ساعت)"},"finalPrice":"459000","paperId":"7305815700296","paymentId":"45925734","hasImage":true},{"violationId":"012573083420","violationOccuredDate":"1401/09/09 - 00:38","violationOccuredTime":"00:38","violationDeliveryType":{"violationDeliveryTypeName":"دوربين"},"violationAddress":"ساري بابل ب امام رضاخداداد 32","violationType":{"violationTypeId":"2056","violationTypeName":"تجاوز از سرعت مجاز (تا سي كيلومتر در ساعت)"},"finalPrice":"459000","paperId":"7308342000290","paymentId":"45925737","hasImage":true},{"violationId":"012572017355","violationOccuredDate":"1401/10/08 - 14:51","violationOccuredTime":"14:51","violationDeliveryType":{"violationDeliveryTypeName":"تسليمي"},"violationAddress":"بابل سطح شهر","violationType":{"violationTypeId":"2160","violationTypeName":"عدم استفاده از كمربند ايمني توسط راننده يا سرنشينان وسيله نقليه درحال حركت( غير استثنائات قانوني) در معابر شهري وروستايي - همراه نداشتن كارت شناسايي وسيله نقليه - عدم توجه به اخطار و تذكر پليس"},"finalPrice":"630000","paperId":"7201735500296","paymentId":"63008557","hasImage":false},{"violationId":"012587900959","violationOccuredDate":"1401/11/03 - 22:03","violationOccuredTime":"22:03","violationDeliveryType":{"violationDeliveryTypeName":"دوربين"},"violationAddress":"ساري بابل ب امام رضاخداداد 32","violationType":{"violationTypeId":"2056","violationTypeName":"تجاوز از سرعت مجاز (تا سي كيلومتر در ساعت)"},"finalPrice":"459000","paperId":"8790095900291","paymentId":"45931111","hasImage":true},{"violationId":"012591622668","violationOccuredDate":"1401/11/13 - 18:09","violationOccuredTime":"18:09","violationDeliveryType":{"violationDeliveryTypeName":"دوربين"},"violationAddress":"ساري بابل ب امام رضاخداداد 32","violationType":{"violationTypeId":"2056","violationTypeName":"تجاوز از سرعت مجاز (تا سي كيلومتر در ساعت)"},"finalPrice":"459000","paperId":"9162266800293","paymentId":"45932357","hasImage":true},{"violationId":"012591622773","violationOccuredDate":"1401/11/13 - 21:32","violationOccuredTime":"21:32","violationDeliveryType":{"violationDeliveryTypeName":"دوربين"},"violationAddress":"ساري بابل ب امام رضاخداداد 32","violationType":{"violationTypeId":"2056","violationTypeName":"تجاوز از سرعت مجاز (تا سي كيلومتر در ساعت)"},"finalPrice":"459000","paperId":"9162277300292","paymentId":"45932352","hasImage":true},{"violationId":"012595149168","violationOccuredDate":"1401/11/15 - 22:02","violationOccuredTime":"22:02","violationDeliveryType":{"violationDeliveryTypeName":"دوربين"},"violationAddress":"ساري بابل ب امام رضاخداداد 32","violationType":{"violationTypeId":"2056","violationTypeName":"تجاوز از سرعت مجاز (تا سي كيلومتر در ساعت)"},"finalPrice":"459000","paperId":"9514916800297","paymentId":"45933670","hasImage":true},{"violationId":"012595073262","violationOccuredDate":"1401/11/16 - 15:39","violationOccuredTime":"15:39","violationDeliveryType":{"violationDeliveryTypeName":"دوربين"},"violationAddress":"ساري بابل ب امام رضاخداداد 32","violationType":{"violationTypeId":"2056","violationTypeName":"تجاوز از سرعت مجاز (تا سي كيلومتر در ساعت)"},"finalPrice":"459000","paperId":"9507326200298","paymentId":"45933672","hasImage":true},{"violationId":"012591765493","violationOccuredDate":"1401/11/17 - 22:24","violationOccuredTime":"22:24","violationDeliveryType":{"violationDeliveryTypeName":"دوربين"},"violationAddress":"ساري بابل ب امام رضاخداداد 32","violationType":{"violationTypeId":"2056","violationTypeName":"تجاوز از سرعت مجاز (تا سي كيلومتر در ساعت)"},"finalPrice":"459000","paperId":"9176549300298","paymentId":"45932430","hasImage":true},{"violationId":"012597693868","violationOccuredDate":"1402/01/04 - 08:30","violationOccuredTime":"08:30","violationDeliveryType":{"violationDeliveryTypeName":"تسليمي"},"violationAddress":"بابل کشوري","violationType":{"violationTypeId":"2149","violationTypeName":"همراه نداشتن كارت شناسايي وسيله نقليه - عدم توجه به اخطار و تذكر پليس - عدم استفاده از كمربند ايمني توسط راننده يا سرنشينان وسيله نقليه درحال حركت( غير استثنائات قانوني) در معابر شهري وروستايي"},"finalPrice":"600000","paperId":"9769386800299","paymentId":"60008510","hasImage":false}],"plateDictation":"پنجاه ونه ص هشتصد وپنجاه وهشت -  ايران نود ودو","plateChar":" شخصي  ايران 92 ــ  858ص59","updateViolationsDate":"1402/03/23","inquiryDate":"1402/03/23","inquiryTime":"11:21","priceStatus":"1","inquirePrice":"6279000","paperId":"8495593700192","paymentId":"627908571"}`)
  //   const response = JSON.parse(`[
  //     {
  //         "serial": "10100233152938",
  //         "licensePlateNumber": "920453568",
  //         "description": "شماره گذاري بابل",
  //         "separationDate": "2022-09-10 09:59:30",
  //         "licensePlate": "ایران ۹۲ - ۵۶۸ ج  ۵۳"
  //     },
  //     {
  //         "serial": "10100233152938",
  //         "licensePlateNumber": "920759858",
  //         "description": null,
  //         "separationDate": null,
  //         "licensePlate": "ایران ۹۲ - ۸۵۸ ص  ۵۹"
  //     }
  // ]`)
    const data =  await this.najiService.updateOrder("64884c300960ccd7678bde06", response , "");
    // return data;
    const dataUrl = {
      url: `${this.config.get('FRONT_SERVER')}/receipt/?id=64881fd0bd64cae856097e21`,
      RedirectURL: `${this.config.get('FRONT_SERVER')}/receipt/?id=64881fd0bd64cae856097e21`,
      statusCode: 302,
    };
    return res.redirect(dataUrl?.url);
  }
}
