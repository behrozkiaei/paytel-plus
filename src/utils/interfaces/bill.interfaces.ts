import { Operator } from './charge-payload.interface';

export interface BillInquiryRepoInterface {
  method?: PaymnetRemoteMethod; // inquiry_bill //هزینه استعلام هر قبض 28 تومان می باشد.
  username?: string;
  password?: string;
  bill_type: BillType;
  mobile?: string;
  operator?: Operator;
  period?: Period;
  phone?: string; //  فقط برای استعلام قبض تلفن اجباری
  bill_id?: string; //فقط برای استعلام قبض آب و برق اجباری  - شناسه قبض (موجود بر روی قبض)
  participate_code?: string; //کد اشتراک کنتور گاز (موجود بر روی قبض)
  order_id: number | string;
}
export interface BillInquiryResponseRepoInterface {
  code: string;
  msg: string;
  amount?: number; // میزان بدهی سیم کارت به تومان
  bill_id?: number; //شناسه قبض
  pay_id?: number; //شناسه پرداخت
  orderId? :string
}

export interface CheckBillRepoInterface {
  method?: PaymnetRemoteMethod; //check_bill
  username?: string;
  password?: string;
  bill_id: number|string;
  pay_id: number|string;
}

export interface CheckBillRepoResponseInterface {
  code: string;
  msg: string;
  type_en: TypeBill;
  type_fa: string;
  amount: number;
  pay_type: Paytype;
}

export interface BillPaymentRepoPayload {
  method?: PaymnetRemoteMethod; //bill
  password?: string;
  username?: string;
  bill_id: number | string;
  pay_id: number | string;
  mobile?: string;
  order_id: number | string; //شماره تراکنش در سایت شما (باید منحصر به فرد باشد)
  pay_type: Paytype;
  callback?: string;
}
export interface BillPaymentResponse {
  code: string; // 1 is success
  pay_type?: Paytype;
  url?: string; // لینک پرداخت آنلاین (در صورتی که pay_type برابر online باشد)
  ref_code?: number;
  order_id?:string;
}
export enum TypeBill {
  water = 'water',
  elec = 'elec',
  gas = 'gas',
  phone = 'phone',
  mobile = 'mobile',
  city = 'city',
  tax = 'tax',
  traffic_fines = 'traffic_fines',
}

export enum Paytype {
  online = 'online',
  credit = 'credit',
}

export enum BillType {
  mobile = 'mobile',
  phone = 'phone',
  elec = 'elec',
  gas = 'gas',
  water = 'water',
}
export enum Period {
  mid = 'mid',
  final = 'final',
}
export enum PaymnetRemoteMethod {
  inquiry_bill = 'inquiry_bill',
  bill = 'bill',
  check_bill = 'check_bill',
}
export interface redirectUrl {
    redirectUrl :string
}