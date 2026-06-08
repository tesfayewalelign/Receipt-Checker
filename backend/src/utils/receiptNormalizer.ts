export function normalize(bank: string, raw: any) {
  const data = raw?.data || raw?.result || raw || {};

  const clean = {
    payer: data?.payer || data?.senderName || "Unknown",
    receiver: data?.receiver || data?.receiverName || "Unknown",
    amount: Number(data?.amount || data?.totalAmount || 0),
    reference: data?.reference || data?.transactionId || "N/A",
    reason: data?.reason || data?.note || "N/A",
    date: data?.date || new Date().toISOString(),
  };

  return clean; // 🔥 ONLY DATA
}
