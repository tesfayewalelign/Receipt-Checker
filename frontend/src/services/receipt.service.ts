import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function verifyReceipt(data: any) {
  // `withCredentials` sends the Better Auth session cookie so the backend can
  // associate the verification with the signed-in user and save it to ReceiptLog.
  const response = await axios.post(`${API_URL}/api/receipts/verify`, data, {
    withCredentials: true,
  });

  return response.data;
}
