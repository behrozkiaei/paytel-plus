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
  bill = 'bill',
  internet = 'internet',
  charge = 'charge',
  walletToWallet = 'walletToWallet',
  increaseWallet = 'increaseWallet',
}
