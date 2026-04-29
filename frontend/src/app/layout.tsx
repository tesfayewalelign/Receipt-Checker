import Header from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

export const metadata = {
  title: "ReceiptCheck",
  description: "Ethiopian Payment Verification Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
