"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader,
  ArrowLeft,
  X,
} from "lucide-react";
// Provider configurations
const providers = {
  cbe: {
    name: "Commercial Bank of Ethiopia",
    color: "from-blue-600 to-blue-700",
    fields: ["reference", "accountSuffix", "image"],
  },
  telebirr: {
    name: "Telebirr",
    color: "from-orange-500 to-orange-600",
    fields: ["reference", "image"],
  },
  "cbe-birr": {
    name: "CBE Birr",
    color: "from-green-600 to-green-700",
    fields: ["reference", "image"],
  },
  boa: {
    name: "Bank of Abyssinia",
    color: "from-purple-600 to-purple-700",
    fields: ["reference", "accountSuffix", "image"],
  },
  awash: {
    name: "Awash Bank",
    color: "from-red-600 to-red-700",
    fields: ["reference", "accountSuffix", "image"],
  },
  dashen: {
    name: "Dashen Bank",
    color: "from-indigo-600 to-indigo-700",
    fields: ["reference", "accountSuffix", "image"],
  },
  mpesa: {
    name: "M-Pesa Ethiopia",
    color: "from-green-500 to-green-600",
    fields: ["reference", "image"],
  },
};

export default function VerifyReceiptPage() {
  const { providerId } = useParams();
  const provider = providers[providerId as keyof typeof providers];

  const [formData, setFormData] = useState({
    reference: "",
    accountSuffix: "",
    amount: "",
    date: "",
  });

  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setVerificationResult(null);

    // Simulate API call
    setTimeout(() => {
      // Mock verification result
      const isValid = Math.random() > 0.3; // 70% success rate
      setVerificationResult({
        verified: isValid,
        transaction: {
          id: formData.reference,
          amount: formData.amount,
          currency: "ETB",
          provider: provider?.name,
          date: formData.date,
          status: isValid ? "verified" : "failed",
          accountSuffix: formData.accountSuffix,
        },
        fraudScore: Math.random() * 0.1,
        processingTime: Math.floor(Math.random() * 200 + 100),
      });
      setIsVerifying(false);
    }, 2000);
  };

  if (!provider) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1
            className="text-gray-900 mb-2"
            style={{ fontWeight: 700, fontSize: "1.5rem" }}
          >
            Provider Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The payment provider you're looking for doesn't exist.
          </p>
          <Link href="/">
            <button
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-3 rounded-lg"
              style={{ fontWeight: 600 }}
            >
              Go Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span style={{ fontWeight: 500 }}>Back to Home</span>
          </Link>
          <div
            className={`bg-gradient-to-r ${provider.color} text-white p-8 rounded-2xl shadow-lg`}
          >
            <h1 className="mb-2" style={{ fontWeight: 700, fontSize: "2rem" }}>
              Verify {provider.name} Receipt
            </h1>
            <p className="text-white/90">
              Upload your receipt or enter transaction details to verify payment
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Verification Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h2
                className="text-gray-900 mb-6"
                style={{ fontWeight: 700, fontSize: "1.5rem" }}
              >
                Transaction Details
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Reference Number */}
                <div>
                  <label
                    htmlFor="reference"
                    className="block text-sm text-gray-700 mb-2"
                    style={{ fontWeight: 600 }}
                  >
                    Transaction Reference Number *
                  </label>
                  <input
                    id="reference"
                    name="reference"
                    type="text"
                    value={formData.reference}
                    onChange={handleInputChange}
                    placeholder="e.g., TXN123456789"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the unique transaction reference from your receipt
                  </p>
                </div>

                {/* Account Suffix (if applicable) */}
                {provider.fields.includes("accountSuffix") && (
                  <div>
                    <label
                      htmlFor="accountSuffix"
                      className="block text-sm text-gray-700 mb-2"
                      style={{ fontWeight: 600 }}
                    >
                      Account Suffix
                    </label>
                    <input
                      id="accountSuffix"
                      name="accountSuffix"
                      type="text"
                      value={formData.accountSuffix}
                      onChange={handleInputChange}
                      placeholder="e.g., 1234"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Last 4 digits of the account number (optional)
                    </p>
                  </div>
                )}

                {/* Amount */}
                <div>
                  <label
                    htmlFor="amount"
                    className="block text-sm text-gray-700 mb-2"
                    style={{ fontWeight: 600 }}
                  >
                    Transaction Amount *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      ETB
                    </span>
                    <input
                      id="amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={handleInputChange}
                      placeholder="1500.00"
                      className="w-full pl-16 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label
                    htmlFor="date"
                    className="block text-sm text-gray-700 mb-2"
                    style={{ fontWeight: 600 }}
                  >
                    Transaction Date *
                  </label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                {/* Receipt Image Upload */}
                <div>
                  <label
                    className="block text-sm text-gray-700 mb-2"
                    style={{ fontWeight: 600 }}
                  >
                    Upload Receipt Image (Optional)
                  </label>

                  {!imagePreview ? (
                    <label className="block border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p
                        className="text-gray-700 mb-1"
                        style={{ fontWeight: 500 }}
                      >
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-gray-500">
                        PNG, JPG or PDF (max. 5MB)
                      </p>
                    </label>
                  ) : (
                    <div className="relative border-2 border-emerald-500 rounded-xl p-4">
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <img
                        src={imagePreview}
                        alt="Receipt preview"
                        className="w-full rounded-lg"
                      />
                      <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {uploadedImage?.name}
                      </p>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isVerifying}
                  className={`w-full bg-gradient-to-r ${provider.color} text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                    isVerifying ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                  style={{ fontWeight: 600 }}
                >
                  {isVerifying ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Verify Receipt
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar - Info & Results */}
          <div className="space-y-6">
            {/* How it works */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-gray-900 mb-4" style={{ fontWeight: 700 }}>
                How It Works
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div
                    className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ fontWeight: 700, fontSize: "0.75rem" }}
                  >
                    1
                  </div>
                  <p className="text-sm text-gray-600">
                    Enter transaction reference and details
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div
                    className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ fontWeight: 700, fontSize: "0.75rem" }}
                  >
                    2
                  </div>
                  <p className="text-sm text-gray-600">
                    Optionally upload receipt image for OCR
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div
                    className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ fontWeight: 700, fontSize: "0.75rem" }}
                  >
                    3
                  </div>
                  <p className="text-sm text-gray-600">
                    AI verifies with bank systems
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div
                    className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ fontWeight: 700, fontSize: "0.75rem" }}
                  >
                    4
                  </div>
                  <p className="text-sm text-gray-600">
                    Get instant verification result
                  </p>
                </div>
              </div>
            </div>

            {/* Verification Result */}
            {verificationResult && (
              <div
                className={`rounded-2xl shadow-lg border-2 p-6 ${
                  verificationResult.verified
                    ? "bg-emerald-50 border-emerald-500"
                    : "bg-red-50 border-red-500"
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  {verificationResult.verified ? (
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  )}
                  <h3
                    className={`${
                      verificationResult.verified
                        ? "text-emerald-900"
                        : "text-red-900"
                    }`}
                    style={{ fontWeight: 700, fontSize: "1.25rem" }}
                  >
                    {verificationResult.verified
                      ? "Verified ✓"
                      : "Verification Failed"}
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        verificationResult.verified
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                      style={{ fontWeight: 600 }}
                    >
                      {verificationResult.transaction.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Transaction ID:
                    </span>
                    <span
                      className="text-sm text-gray-900"
                      style={{ fontWeight: 600 }}
                    >
                      {verificationResult.transaction.id}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Amount:</span>
                    <span
                      className="text-sm text-gray-900"
                      style={{ fontWeight: 600 }}
                    >
                      ETB {verificationResult.transaction.amount}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Provider:</span>
                    <span
                      className="text-sm text-gray-900"
                      style={{ fontWeight: 600 }}
                    >
                      {verificationResult.transaction.provider}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Fraud Score:</span>
                    <span
                      className="text-sm text-gray-900"
                      style={{ fontWeight: 600 }}
                    >
                      {(verificationResult.fraudScore * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Processing Time:
                    </span>
                    <span
                      className="text-sm text-gray-900"
                      style={{ fontWeight: 600 }}
                    >
                      {verificationResult.processingTime}ms
                    </span>
                  </div>
                </div>

                {verificationResult.verified && (
                  <div className="mt-4 pt-4 border-t border-emerald-200">
                    <p className="text-sm text-emerald-800">
                      ✓ This transaction has been verified and is legitimate.
                    </p>
                  </div>
                )}

                {!verificationResult.verified && (
                  <div className="mt-4 pt-4 border-t border-red-200">
                    <p className="text-sm text-red-800">
                      ⚠️ This transaction could not be verified. Please check
                      your details or contact support.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-gray-700">
                <span style={{ fontWeight: 600 }}>💡 Tip:</span> For faster
                verification, ensure your reference number is correct and upload
                a clear receipt image.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
