"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useEffect } from "react";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader,
  ArrowLeft,
  X,
} from "lucide-react";
import { verifyReceipt } from "@/services/receipt.service";

const providers = {
  cbe: {
    name: "Commercial Bank of Ethiopia",
    color: "from-[#2E0F4F] to-[#4B1D6B]",
    referenceLabel: "Reference No",
    referencePlaceholder: "FT123456789",
    referenceHint: "Starts with FT....",

    fields: ["reference", "accountSuffix", "image"],
  },

  telebirr: {
    name: "Telebirr",
    color: "from-[#003366] to-[#004C99]",
    referenceLabel: "Transaction Number",
    referencePlaceholder: "TBR123456789",
    referenceHint: "Telebirr transaction number",

    fields: ["reference", "image"],
  },

  "cbe-birr": {
    name: "CBE Birr",
    color: "from-[#2E0F4F] to-[#4B1D6B]",
    referenceLabel: "Receipt Number",
    referencePlaceholder: "CBB123456789",
    referenceHint: "CBE Birr receipt number",
    fields: ["receiptNumber", "phoneNumber", "image"],
  },

  mpesa: {
    name: "M-Pesa Ethiopia",
    color: "from-[#DC143C] to-[#FF4D6D]",
    referenceLabel: "Transaction Number",
    referencePlaceholder: "MPESA123456",
    referenceHint: "M-Pesa transaction reference",

    fields: ["reference", "image"],
  },

  boa: {
    name: "Bank of Abyssinia",
    color: "from-[#FFD700] to-[#FFC107]",

    referenceLabel: "Reference No",
    referencePlaceholder: "BOA123456789",
    referenceHint: "Bank reference number",

    fields: ["reference", "accountSuffix", "image"],
  },

  awash: {
    name: "Awash Bank",
    color: "from-[#0A2463] to-[#1E3A8A]",

    referenceLabel: "Reference No",
    referencePlaceholder: "UBH123456789",
    referenceHint: "Awash reference number",

    fields: ["reference", "image"],
  },

  dashen: {
    name: "Dashen Bank",
    color: "from-[#005BAA] to-[#003E7E]",

    referenceLabel: "Reference No",
    referencePlaceholder: "DSH123456789",
    referenceHint: "Dashen bank reference number",

    fields: ["reference", "image"],
  },
};

export default function VerifyReceiptPage() {
  const params = useParams();
  const providerId = params.providerId as string;

  const provider = providers[providerId as keyof typeof providers];

  const [formData, setFormData] = useState({
    reference: "",
    accountSuffix: "",
    phoneNumber: "",
    receiptNumber: "",
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
    if (!file) return;

    setUploadedImage(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted");
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const result = await verifyReceipt({
        bank: providerId,
        reference: formData.reference,
        accountSuffix: formData.accountSuffix,
        phoneNumber: formData.phoneNumber,
        receiptNumber: formData.receiptNumber,
      });

      console.log("API Result:", result);
      setVerificationResult(result);
    } catch (error) {
      console.error(error);

      setVerificationResult({
        verified: false,
        message: "Verification failed",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  if (!provider) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />

          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Provider Not Found
          </h1>

          <p className="text-gray-600 mb-6">Invalid payment provider</p>

          <Link href="/">
            <button className="bg-emerald-500 text-white px-6 py-3 rounded-lg font-semibold">
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
        {/* HEADER */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>

          <div
            className={`bg-gradient-to-r ${provider.color} text-white p-8 rounded-2xl`}
          >
            <h1 className="text-2xl font-bold">Verify {provider.name}</h1>
            <p className="text-white/80">Upload receipt or enter details</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* FORM */}
          <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* REFERENCE */}
              <div>
                <label className="font-semibold text-sm text-gray-700">
                  {provider.referenceLabel} *
                </label>

                <input
                  name="reference"
                  value={formData.reference}
                  onChange={handleInputChange}
                  placeholder={provider.referencePlaceholder}
                  className="w-full mt-2 px-4 py-3 border rounded-xl text-gray-900"
                  required
                />

                <p className="text-xs text-gray-500 mt-1">
                  {provider.referenceHint}
                </p>
              </div>
              {/* RECEIPT NUMBER */}

              {/* PHONE */}
              {provider.fields.includes("phoneNumber") && (
                <div>
                  <label className="font-semibold text-sm text-gray-700">
                    Phone Number *
                  </label>

                  <input
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="09XXXXXXXX"
                    className="w-full mt-2 px-4 py-3 border rounded-xl text-gray-900"
                    required
                  />
                </div>
              )}

              {/* ACCOUNT SUFFIX */}
              {provider.fields.includes("accountSuffix") && (
                <div>
                  <label className="font-semibold text-sm text-gray-700">
                    Account Suffix
                  </label>

                  <input
                    name="accountSuffix"
                    value={formData.accountSuffix}
                    onChange={handleInputChange}
                    placeholder="Last 8 digits"
                    className="w-full mt-2 px-4 py-3 border rounded-xl text-gray-900"
                  />
                </div>
              )}

              {/* IMAGE */}
              <div>
                <label className="font-semibold text-sm text-gray-700">
                  Upload Receipt
                </label>

                {!imagePreview ? (
                  <label className="block border-2 border-dashed p-6 text-center mt-2 rounded-xl cursor-pointer">
                    <input type="file" hidden onChange={handleImageUpload} />
                    <Upload className="mx-auto mb-2" />
                    Click to upload
                  </label>
                ) : (
                  <div className="mt-2 relative">
                    <img src={imagePreview} className="rounded-xl" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded"
                    >
                      <X />
                    </button>
                  </div>
                )}
              </div>

              {/* SUBMIT */}
              <button
                disabled={isVerifying}
                className={`w-full py-4 rounded-xl text-white font-semibold bg-gradient-to-r ${provider.color}`}
              >
                {isVerifying ? "Verifying..." : "Verify Receipt"}
              </button>
            </form>
          </div>
          {/* RESULT SECTION */}
          {verificationResult?.success && verificationResult?.data && (
            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h3 className="font-bold text-green-700">
                  Receipt Verified Successfully
                </h3>
              </div>

              <div className="grid gap-3 text-sm text-gray-700">
                <div>
                  <span className="font-semibold">Payer:</span>{" "}
                  {verificationResult.data.payer}
                </div>

                <div>
                  <span className="font-semibold">Receiver:</span>{" "}
                  {verificationResult.data.receiver}
                </div>

                <div>
                  <span className="font-semibold">Amount:</span> ETB{" "}
                  {verificationResult.data.amount}
                </div>

                <div>
                  <span className="font-semibold">Reference:</span>{" "}
                  {verificationResult.data.reference}
                </div>

                <div>
                  <span className="font-semibold">Reason:</span>{" "}
                  {verificationResult.data.reason}
                </div>

                <div>
                  <span className="font-semibold">Date:</span>{" "}
                  {new Date(verificationResult.data.date).toLocaleString()}
                </div>
              </div>
            </div>
          )}
          {/* SIDEBAR */}
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
                  Get instant verification result
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
