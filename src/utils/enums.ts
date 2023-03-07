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
}
enum CashbackState {
  PENDING ="PENDING",// is pernding to cash back
  DONE  ="DONE" ,// cash back is done
  REJECTED="REJECTED" // cash back is not done
}
