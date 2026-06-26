import ApiDocs from "@/components/api-docs/ApiDocs";

export const metadata = {
  title: "API Documentation - ReceiptCheck",
  description:
    "Integrate the ReceiptCheck verification API: authenticate with an API key, verify bank and mobile-money receipts, and receive structured transaction data.",
};

export default function ApiDocsPage() {
  return <ApiDocs />;
}
