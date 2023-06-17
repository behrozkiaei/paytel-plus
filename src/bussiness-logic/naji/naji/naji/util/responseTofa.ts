import { addCommas } from '@persian-tools/persian-tools';

export const responseKeyToFaKey = (key: string): string => {
  let translatedKey: string;
  switch (key) {
    case 'nationalCode':
      translatedKey = 'کد ملی';
      break;
    case 'firstName':
      translatedKey = 'نام';
      break;
    case 'lastName':
      translatedKey = 'نام خانوادگی';
      break;
    case 'title':
      translatedKey = 'عنوان';
      break;
    case 'rahvarStatus':
      translatedKey = 'وضعیت راهور';
      break;
    case 'barcode':
      translatedKey = 'بارکد';
      break;
    case 'printNumber':
      translatedKey = 'شماره چاپ';
      break;
    case 'printDate':
      translatedKey = 'تاریخ چاپ';
      break;
    case 'validYears':
      translatedKey = 'سال های معتبر';
      break;
    case 'negativePoint':
      translatedKey = 'امتیاز منفی';
      break;
    case 'isDrivingAllowed':
      translatedKey = 'رانندگی مجاز است؟';
      break;
    case 'icensePlateNumber':
      translatedKey = 'شماره پلاک';
      break;
    case 'escription':
      translatedKey = 'شرح';
      break;
    case 'eparationDate':
      translatedKey = 'تاریخ جدایی';
      break;
    case 'icensePlate':
      translatedKey = 'پلاک خودرو';
      break;
    case 'asPassport':
      translatedKey = 'دارای گذرنامه';
      break;
    case 'asRequest':
      translatedKey = 'درخواست دارد';
      break;
    case 'equestStatue':
      translatedKey = 'وضعیت درخواست';
      break;
    case 'equestDate':
      translatedKey = 'تاریخ درخواست';
      break;
    case 'ostBarcode':
      translatedKey = 'بارکد پستی';
      break;
    case 'assportNo':
      translatedKey = 'شماره گذرنامه';
      break;
    case 'sueDate':
      translatedKey = 'تاریخ صدور';
      break;
    case 'xpiryDate':
      translatedKey = 'تاریخ انقضاء';
    case 'status':
      translatedKey = 'وضعیت';
      break;
    case 'violations':
      translatedKey = 'تخلفات';
      break;
    case 'plateDictation':
      translatedKey = 'شماره گویای پلاک';
      break;
    case 'plateChar':
      translatedKey = 'حرف پلاک';
      break;
    case 'updateViolationsDate':
      translatedKey = 'تاریخ بروزرسانی تخلفات';
      break;
    case 'inquiryDate':
      translatedKey = 'تاریخ استعلام';
      break;
    case 'inquiryTime':
      translatedKey = 'زمان استعلام';
      break;
    case 'priceStatus':
      translatedKey = 'وضعیت قیمت';
      break;
    case 'inquirePrice':
      translatedKey = 'مبلغ جریمه به ریال';
      break;
    case 'paperId':
      translatedKey = 'شناسه قبض';
      break;
    case 'paymentId':
      translatedKey = 'شناسه پرداخت';
      break;
    case 'violationId':
      translatedKey = 'شناسه تخلف';
      break;
    case 'finalPrice':
      translatedKey = 'مبلغ جریمه به ریال';
      break;
    case 'violationAddress':
      translatedKey = 'مکان تخلف';
      break;
    case 'violationDeliveryTypeName':
      translatedKey = 'نوع ثبت تخلف';
      break;
    case 'hasImage':
      translatedKey = 'دارای عکس';
      break;
    case 'iolationOccuredDate':
      translatedKey = 'تاریخ وقوع تخلف';
      break;
    case 'iolationOccuredTime':
      translatedKey = 'زمان وقوع تخلف';
      break;
    case 'iolationDeliveryType':
      translatedKey = 'نوع ارسال تخلف';
      break;
    case 'iolationType':
      translatedKey = 'نوع تخلف';
      break;
    case 'inalPrice':
      translatedKey = 'قیمت نهایی';
      break;
    case 'hasImage':
      translatedKey = 'دارای تصویر است؟';
      break;
    case 'iolationDeliveryTypeName':
      translatedKey = 'نام نوع ارسال تخلف';
    case 'violationTypeId':
      translatedKey = 'شناسه نوع تخلف';
      break;
    case 'violationTypeName':
      translatedKey = 'نام نوع تخلف';
      break;
    case 'violationId':
      translatedKey = 'شناسه تخلف';
      break;
    case 'plateImage':
      translatedKey = 'تصویر پلاک';
      break;
    case 'vehicleImage':
      translatedKey = 'تصویر خودرو';
      break;
    case 'complaintStatus':
      translatedKey = 'وضعیت شکایت';
      break;
    case 'complaint':
      translatedKey = 'شکایت';
      break;
    case 'priceStatus':
      translatedKey = 'مبلغ جریمه به ریال';
      break;
    case 'pageCount':
      translatedKey = 'تعداد صفحات';
      break;
    case 'price':
      translatedKey = 'قیمت';
      break;
    case 'cardPrintDate':
      translatedKey = 'تاریخ چاپ کارت';
      break;
      case 'documentStatusTitle':
      translatedKey = 'وضعیت';

      case 'documentPrintDate':
      translatedKey = 'تاریخ چاپ';
      break;
    case 'cardPostalBarcode':
      translatedKey = 'بارکد پستی کارت';
      break;
    case 'cardStatusTitle':
      translatedKey = 'عنوان وضعیت کارت';
      break;
    case 'ocumentPrintDate':
      translatedKey = 'تاریخ چاپ سند';
      break;
    case 'ocumentPostalBarcod':
      translatedKey = 'بارکد پستی سند';
      break;
    case 'ocumentStatusTitle':
      translatedKey = 'عنوان وضعیت سند';
    default:
      translatedKey = key;
  }
  return translatedKey;
};

export const responseValueToFaKey = (
  key: string,
  value: string | boolean | number,
): string | boolean => {
  let translatedValue: string;
  let res = value;
  if (key == 'status' || key == 'Status') {
    if (value == true || value == 'true' || value == 'True') {
      res = 'فعال';
    }
    if (value == false || value == 'false' || value == 'False') {
      res = 'غیر فعال ';
    }
  }
  if (key == 'hasImage') {
    if (value == true || value == 'true') {
      res = 'دارای عکس';
    } else {
      res = 'فاقد عکس';
    }
  }
  
  if (
    key.includes('price') ||
    key.includes('inquirePrice') ||
    key.includes('finalPrice') ||
    key.includes('Price') ||
    key.includes('Amount') ||
    key.includes('amount')
  ) {
    res = addCommas(value.toString());
  }
  if (key.includes('priceStatus')) {
    if (value == 1 || value == '1') {
      res = 'دارد';
    } else {
      res = 'ندارد';
    }
  }
  if (key == ('isDrivingAllowed')) {
    if (value.toString() == "true") {
      res = 'بله';
    } else {
      res = 'خیر';
    }
  }
  return res.toString();
};

export const licensStatus = (statusCode) => {
  switch (statusCode) {
    case 21:
      return 'قبول آزمون تئوری';
      break;
    case 31:
      return 'قبول آزمون عملی';
      break;
    case 41:
      return 'تائید دفتر/آموزشگاه';
      break;
    case 61:
      return 'قبول آزمون فنی';
      break;
    case 71:
      return 'قبول آزمون تپه';
      break;
    case 101:
      return 'رد شده کاردان فنی';
      break;
    case 111:
      return 'منوط به نظر کاردان فنی';
      break;
    case 22:
      return 'تایید شده راهور';
      break;
    case 32:
      return 'رد شده راهور';
      break;
    case 62:
      return 'چاپ شده';
      break;
    case 72:
      return 'نقش چاپ / عکس';
      break;
    case 102:
      return 'اسکن شده ناجی پاس';
      break;
    case 172:
      return 'پیدا شده';
      break;
    case 182:
      return 'برگشتی از پست';
      break;
    case 262:
      return 'چاپ مجدد';
      break;
    case 272:
      return 'چاپ مجدد راهور';
      break;
    case 282:
      return 'چاپ ویژه';
      break;

    default:
      break;
  }
};
export const plateChartoDigit = (char) => {
  console.log(char);
  switch (char) {
    case 'ب':
      return '02';
      break;
    case 'ت':
      return '03';
      break;
    case 'ج':
      return '04';
      break;
    case 'د':
      return '05';
      break;
    case 'س':
      return '06';
      break;
    case 'ص':
      return '07';
      break;
    case 'ط':
      return '08';
      break;
    case 'ع':
      return '09';
      break;
    case 'ق':
      return '10';
      break;
    case 'ل':
      return '11';
      break;
    case 'م':
      return '12';
      break;
    case 'ن':
      return '13';
      break;
    case 'و':
      return '14';
      break;
    case 'ه':
      return '15';
      break;
    case 'ی':
      return '16';
      break;
    case 'ژ':
      return '19';
      break;

    default:
      break;
  }
};
