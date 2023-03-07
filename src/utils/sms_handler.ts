import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
const Kavenegar = require('kavenegar');
const api = Kavenegar.KavenegarApi({
  apikey: '506B333345356C7347576E61436A6F742B6C6E326D485A6C6A5A6E4B5770746C',
});
@Injectable()
export class SmsService {
  
  constructor(private config: ConfigService) {}
  async sendOtp(receptor, message) {
    try {
      await api.VerifyLookup(
        {
          receptor: receptor,
          token: message,
          template: 'otp',
        },
        function (response, status) {
          console.log(response);
        },
      );
      return true;
    } catch (e) {
      return false;
    }
  }
}
