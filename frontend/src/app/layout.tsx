import "./globals.css";

export const metadata = {
  title: "ReceiptCheck",
  description: "Ethiopian Payment Verification API",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
