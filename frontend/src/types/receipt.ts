export interface VerifyReceiptRequest {
  bank: string;
  reference?: string;
  accountSuffix?: string;
  phoneNumber?: string;
  transactionId?: string;
  receiptNumber?: string;
}

export interface VerifyReceiptResponse {
  success: boolean;
  data?: any;
  message?: string;
}
