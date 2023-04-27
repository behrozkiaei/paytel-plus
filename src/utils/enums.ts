// eslint-disable-next-line @typescript-eslint/no-unused-vars
export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MERCHANT = 'MERCHANT',
  MARKETER = 'MARKETER',
  LEVEL1 = 'LEVEL1',
  LEVEL2 = 'LEVEL2',
  LEVEL3 = 'LEVEL3',
  LEVEL4 = 'LEVEL4',
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export enum OtpType {
  Login = 'Login',
  RessetPass = 'RessetPass',
}

export enum OrderType {
  billByCredit = 'billByCredit',
  billByWallet = 'billByWallet',
  internetByWallet = 'internetByWallet',
  internetByCredit = 'internetByCredit',
  chargeByWallet = 'chargeByWallet',
  chargeByCredit = 'chargeByCredit',
  walletToWallet = 'walletToWallet', //done
  increaseWallet = 'increaseWallet', // done
  creditToOtherWallet = 'creditToOtherWallet',
  najiInquiryByWallet = "najiInquiryByWallet",
  najiInquiryByCredit =  "najiInquiryByCredit"

}
export enum CashbackState {
  PENDING ="PENDING",// is pernding to cash back
  DONE  ="DONE" ,// cash back is done
  REJECTED="REJECTED" // cash back is not done
}

export enum NajiType{
  DRIVING_LICENSE = "DRIVING_LICENSE",
  NEGETIVE_POINT = "NEGETIVE_POINT",
  ACTIVE_PLATES = "ACTIVE_PLATES",
  PASSPORT_STATUS ="PASSPORT_STATUS",
  COUNTRY_LEAVING ="COUNTRY_LEAVING",
  VIOLATION_REPORT ="VIOLATION_REPORT",
  VIOLATION_IMAGE ="VIOLATION_IMAGE",
  VIOLATION_AGGREGATE = "VIOLATION_AGGREGATE",
  VIOLATION_AGGREGATE_NO_AUTH = "VIOLATION_AGGREGATE_NO_AUTH",
  DOCUMENT_STATUS = "DOCUMENT_STATUS"
}

export enum PlateType{
  MOTOR = "MOTOR",
  CAR = "CAR"
}