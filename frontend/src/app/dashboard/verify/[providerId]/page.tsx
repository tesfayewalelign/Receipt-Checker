"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  Upload,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Copy,
  X,
} from "lucide-react";
import { verifyReceipt } from "@/services/receipt.service";
import { getProvider } from "@/lib/providers";
import ProviderLogo from "@/components/ProviderLogo";

function DetailItem({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
      <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
        {label}
      </p>

      <p className="font-semibold text-gray-900 break-words">
        {value || "N/A"}
      </p>
    </div>
  );
}

export default function DashboardVerifyReceiptPage() {
  const params = useParams();
  const providerId = params.providerId as string;

  const provider = getProvider(providerId);

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

  // Two ways to verify: type the transaction details, or upload a receipt image.
  // Only one is active at a time so users aren't asked for all of it at once.
  const [method, setMethod] = useState<"details" | "upload">("details");

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
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const result = await verifyReceipt(
        method === "upload"
          ? { bank: providerId, image: uploadedImage }
          : {
              bank: providerId,
              reference: formData.reference,
              accountSuffix: formData.accountSuffix,
              phoneNumber: formData.phoneNumber,
              receiptNumber: formData.receiptNumber,
            },
      );

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
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />

          <h1 className="text-xl font-bold text-white mb-2">
            Provider Not Found
          </h1>

          <p className="text-slate-400 mb-6">Invalid payment provider</p>

          <Link href="/dashboard/verify">
            <button className="bg-emerald-500 text-white px-6 py-3 rounded-lg font-semibold">
              Back to Providers
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="mb-8">
        <Link
          href="/dashboard/verify"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Providers
        </Link>

        <div
          className={`bg-gradient-to-r ${provider.color} text-white p-8 rounded-2xl flex items-center gap-4`}
        >
          <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shrink-0 overflow-hidden">
            <ProviderLogo provider={provider} size={40} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Verify {provider.name}</h1>
            <p className="text-white/80">Upload receipt or enter details</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* FORM */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow">
          {/* METHOD TABS — pick one way to verify, not all at once */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
            <button
              type="button"
              onClick={() => setMethod("details")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
                method === "details"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Enter Details
            </button>

            <button
              type="button"
              onClick={() => setMethod("upload")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
                method === "upload"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Upload Receipt
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            {method === "details"
              ? "Type the transaction details from your receipt."
              : "Upload a photo of your receipt — we'll read the details for you."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            {method === "details" && (
              <>
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
                    required={method === "details"}
                  />

                  <p className="text-xs text-gray-500 mt-1">
                    {provider.referenceHint}
                  </p>
                </div>

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
                      required={method === "details"}
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
              </>
            )}

            {/* IMAGE */}
            {method === "upload" && (
              <div>
                {!imagePreview ? (
                  <label className="block border-2 border-dashed p-6 text-center rounded-xl cursor-pointer">
                    <input type="file" hidden onChange={handleImageUpload} />
                    <Upload className="mx-auto mb-2" />
                    Click to upload
                  </label>
                ) : (
                  <div className="relative">
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
            )}

            {/* SUBMIT */}
            <button
              disabled={isVerifying || (method === "upload" && !uploadedImage)}
              className={`w-full py-4 rounded-xl text-white font-semibold bg-gradient-to-r ${provider.color} disabled:opacity-60`}
            >
              {isVerifying ? "Verifying..." : "Verify Receipt"}
            </button>
          </form>
        </div>

        {/* RESULT SECTION */}
        {verificationResult?.success && verificationResult?.data && (
          <div className="lg:col-span-3">
            <div className="mt-8 overflow-hidden rounded-3xl bg-white shadow-xl border border-green-200">
              {/* HEADER */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-10 h-10" />

                    <div>
                      <h2 className="text-2xl font-bold">
                        Receipt Verified Successfully
                      </h2>

                      <p className="text-green-100">
                        Transaction has been validated.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/20 px-4 py-2 rounded-full">
                    <span className="font-semibold">✓ VERIFIED</span>
                  </div>
                </div>
              </div>

              {/* BODY */}
              <div className="p-6">
                {/* Amount Card */}
                <div className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center">
                  <p className="text-sm text-emerald-700 mb-2">
                    Transaction Amount
                  </p>

                  <h2 className="text-4xl font-bold text-emerald-700">
                    ETB {verificationResult.data.amount ?? "0"}
                  </h2>
                </div>

                {/* DETAILS */}
                <div className="grid md:grid-cols-2 gap-4">
                  <DetailItem
                    label="Payer"
                    value={verificationResult.data.payer}
                  />

                  <DetailItem
                    label="Payer Account"
                    value={verificationResult.data.payerAccount}
                  />

                  <DetailItem
                    label="Receiver"
                    value={verificationResult.data.receiver}
                  />

                  <DetailItem
                    label="Receiver Account"
                    value={verificationResult.data.receiverAccount}
                  />

                  <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                      Reference
                    </p>

                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-gray-900 break-all">
                        {verificationResult.data.reference || "N/A"}
                      </p>

                      {verificationResult.data.reference && (
                        <button
                          type="button"
                          onClick={() =>
                            navigator.clipboard.writeText(
                              verificationResult.data.reference,
                            )
                          }
                          className="p-2 rounded-lg hover:bg-gray-200"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <DetailItem
                    label="Reason"
                    value={verificationResult.data.reason}
                  />

                  <DetailItem
                    label="Transaction Date"
                    value={
                      verificationResult.data.date
                        ? new Date(
                            verificationResult.data.date,
                          ).toLocaleString()
                        : "N/A"
                    }
                  />

                  <DetailItem
                    label="Verification Time"
                    value={new Date().toLocaleString()}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {verificationResult && !verificationResult.success && (
          <div className="lg:col-span-3">
            <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6">
              <h3 className="text-xl font-bold text-red-700 mb-2">
                Receipt Verification Failed
              </h3>

              <p className="text-red-600">
                We couldn't verify this transaction.
              </p>

              <ul className="mt-4 text-sm text-red-700 list-disc pl-5">
                <li>Reference number may be incorrect</li>
                <li>Transaction may not exist</li>
                <li>Payment provider may be unavailable</li>
                <li>Please check the receipt and try again</li>
              </ul>
            </div>
          </div>
        )}

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
                Choose a method: enter the details or upload your receipt
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
                Type the reference (and account) or attach the receipt image
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
  );
}
