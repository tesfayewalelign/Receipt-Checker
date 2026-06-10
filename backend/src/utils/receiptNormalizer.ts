export function normalizeReceipt(bank: string, result: any) {
  switch (bank.toLowerCase()) {
    case "cbe":
      return {
        payer: result.data?.payer,
        payerAccount: result.data?.payerAccount,
        receiver: result.data?.receiver,
        receiverAccount: result.data?.receiverAccount,
        amount: result.data?.amount,
        reference: result.data?.reference,
        reason: result.data?.reason,
        date: result.data?.date,
      };

    case "cbe-birr":
      return {
        payer: result.customerName,
        payerAccount: result.debitAccount,
        receiver: result.receiverName,
        receiverAccount: result.creditAccount,
        amount: result.amount,
        reference: result.receiptNumber,
        reason: result.paymentReason,
        date: result.transactionDate,
      };

    case "telebirr":
      return {
        payer: result.data?.payer,
        payerAccount: result.data?.payerAccount,
        receiver: result.data?.receiver,
        receiverAccount: result.data?.receiverAccount,
        amount: result.data?.amount,
        reference: result.data?.reference,
        reason: result.data?.reason,
        date: result.data?.date,
      };

    case "mpesa":
      return {
        payer: result.data?.payer,
        payerAccount: result.data?.payerAccount,
        receiver: result.data?.receiver,
        receiverAccount: result.data?.receiverAccount,
        amount: result.data?.amount,
        reference: result.data?.reference,
        reason: result.data?.reason,
        date: result.data?.date,
      };

    case "dashen":
      return {
        payer: result.senderName,
        payerAccount: result.senderAccountNumber,
        receiver: result.receiverName,
        receiverAccount: result.phoneNo,
        amount: result.transactionAmount,
        reference: result.transactionReference,
        reason: result.narrative,
        date: result.transactionDate,
      };

    case "awash":
      return {
        payer: result.data?.["Customer Name"] ?? null,

        payerAccount: result.data?.["Account No"] ?? null,

        receiver: result.data?.["Recipient"] ?? null,

        receiverAccount: result.data?.["Recipient"] ?? null,

        amount: result.data?.["Amount"] ? Number(result.data["Amount"]) : null,

        reference: result.data?.["Txn Ref"] ?? result.reference ?? null,

        reason: result.data?.["Trans type"] ?? null,

        date: result.data?.["Date"] ?? null,
      };

    case "boa":
      return {
        payer: result.data?.payer,
        payerAccount: result.data?.payerAccount,
        receiver: result.data?.receiver,
        receiverAccount: result.data?.receiverAccount,
        amount: result.data?.amount,
        reference: result.data?.reference,
        reason: result.data?.reason,
        date: result.data?.date,
      };

    default:
      return null;
  }
}
