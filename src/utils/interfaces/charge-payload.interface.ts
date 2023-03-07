export interface ChargePayload {
  amount: string;
  mobile: string;
  order_id: string;
  operator: string;
  charge_type: string;
}

export interface ChargePayloadForDb extends ChargePayload {
  isWallet: boolean;
}
export enum Operator {
  MTN = 'MTN',
  MCI = 'MCI',
  RTL = 'RTL',
  SHT = 'SHT',
}
export enum ChargeType {
  normal = 'normal',
  amazing = 'amazing',
  permanent = 'permanent',
}
