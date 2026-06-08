import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
console.log(process.env.NEXT_PUBLIC_API_URL);
export async function verifyReceipt(data: any) {
  const response = await axios.post(`${API_URL}/api/receipts/verify`, data);

  return response.data;
}
