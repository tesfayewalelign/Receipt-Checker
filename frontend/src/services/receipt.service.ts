import axios from "axios";
import { API_URL } from "@/lib/config";

export interface VerifyReceiptPayload {
  bank: string;
  reference?: string;
  accountSuffix?: string;
  phoneNumber?: string;
  receiptNumber?: string;
  /** Set when the user verifies by uploading a receipt image instead of typing details. */
  image?: File | null;
}

export async function verifyReceipt(data: VerifyReceiptPayload) {
  const { image, ...fields } = data;

  // The verify form offers two mutually exclusive methods: type the transaction
  // details, or upload a receipt image. When an image is present we send
  // multipart/form-data so the file actually reaches the backend (axios sets the
  // multipart boundary automatically); otherwise we send plain JSON as before.
  const body: FormData | VerifyReceiptPayload = image
    ? (() => {
        const form = new FormData();
        Object.entries(fields).forEach(([key, value]) => {
          if (value) form.append(key, String(value));
        });
        form.append("image", image);
        return form;
      })()
    : fields;

  // `withCredentials` sends the Better Auth session cookie so the backend can
  // associate the verification with the signed-in user and save it to ReceiptLog.
  const response = await axios.post(`${API_URL}/api/receipts/verify`, body, {
    withCredentials: true,
  });

  return response.data;
}
