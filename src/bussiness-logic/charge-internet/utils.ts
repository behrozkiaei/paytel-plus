import { addCommas } from '@persian-tools/persian-tools';

export const responseKeyToFaKey = (key: string): string => {
  let translatedKey: string;
  switch (key) {
    case 'url':
      translatedKey = 'لینک';
      break;
    case 'trans_id':
      translatedKey = 'شناسه تراکنش';
    case 'ref_code':
      translatedKey = 'شناسه ارجاع';
    case 'msg':
      translatedKey = 'توضیحات';
      case 'code':
        translatedKey = 'وضعیت';
    default:
      translatedKey = key;
  }
  return translatedKey;
};

export const responseValueToFaKey = (
  key: string,
  value: string | boolean |number ,
): string | boolean |number => {
  let translatedValue: string;
  let res = value;
  if (key == 'status' || key == 'Status' ) {
    if (value == true || value == 'true' || value == 'True'  || value == '1' ) {
      res = 'فعال';
    }
    if (value == false || value == 'false' || value == 'False') {
      res = 'غیر فعال ';
    }
  }
  if (
    key.includes('price') ||
    key.includes('Price') ||
    key.includes('Amount') ||
    key.includes('amount')
  ) {
    res = addCommas(value.toString());
  }
  if (
    key.includes('code') 
  ) {
    res = (value.toString() == "1" ) ? "موفق" : "ناموفق";
  }
  return res;
};
