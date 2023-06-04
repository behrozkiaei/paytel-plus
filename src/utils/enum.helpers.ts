import { OtpType } from './enums';

export const OtpTypeStringToEnumHelper = (value: any): OtpType => {
  switch (value) {
    case 'Login':
      return OtpType.Login;
      break;
    case 'RessetPass':
      return OtpType.RessetPass;
      break;
    // case 'Payment':
    //   return OtpType.Payment;
    //   break;
    default:
      return OtpType.Login;
    break;
  }
};
