import {
  phoneNumberValidator,
  digitsArToEn,
  digitsFaToEn,
} from '@persian-tools/persian-tools';
export const toEn = (value) => {
  return digitsArToEn(digitsFaToEn(value));
};
