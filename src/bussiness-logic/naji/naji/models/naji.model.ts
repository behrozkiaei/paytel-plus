export interface LicensesReponsetype {
  nationalCode?: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  rahvarStatus?: string;
  barcode?: string;
  printNumber?: string;
  printDate?: string;
  validYears?: string;
}

export interface NegetiveLicenseResponse {
  negativePoint: string;
  isDrivingAllowed: boolean;
}

export interface ActivePlateResponseInterface {
  licensePlateNumber?: string;
  description?: string;
  separationDate?: string;
  licensePlate?: string;
}
export interface PassportStatusIntrerface {
  hasPassport: true;
  hasRequest: true;
  requestStatue: string;
  requestDate: string;
  postBarcode: string;
  passportNo: string;
  issueDate: string;
  expiryDate: string;
  status: string;
}
export interface CountryLeavingReponseInterface {
  status: boolean;
}

export interface ViolationTypeResponseInterface {
  violations: Violation[];
  plateDictation: string;
  plateChar: string;
  updateViolationsDate: string;
  inquiryDate: string;
  inquiryTime: string;
  priceStatus: string;
  inquirePrice: string;
  paperId: string;
  paymentId: string;
}

export interface Violation {
  violationId: string;
  violationOccuredDate: string;
  violationOccuredTime: string;
  violationDeliveryType: ViolationDeliveryType;
  violationType: ViolationType;
  finalPrice: string;
  paperId: string;
  paymentId: string;
  hasImage: boolean;
}

export interface ViolationDeliveryType {
  violationDeliveryTypeName: string;
}

export interface ViolationType {
  violationTypeId: string;
  violationTypeName: string;
}

export interface violationImageReponseInterface {
  violationId?: string;
  plateImage?: string;
  vehicleImage?: string;
}
export interface ViolationAggregateReportInterface {
  plateChar: string;
  complaintStatus?: string;
  complaint?: string;
  priceStatus?: string;
  pageCount?: number;
  paperId: string;
  paymentId: string;
  price: number;
}

export interface DocumentStatusInterface {
  cardPrintDate: string;
  cardPostalBarcode: string;
  cardStatusTitle: string;
  documentPrintDate: string;
  documentPostalBarcod: string;
  documentStatusTitle: string;
  plateChar: string;
}
export interface najiResponseId {
  id?: string;
  paymentLink?: string;
}
