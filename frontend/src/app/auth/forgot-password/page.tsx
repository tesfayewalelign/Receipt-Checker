"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Add forgot password logic here

    setSubmitted(true);
  };

  /* SUCCESS STATE */
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 px-4 sm:px-6 pt-24 pb-10">
        <div className="mx-auto w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 text-center">
            <Link href="/" className="mb-6 inline-flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg" />

              <span className="text-2xl font-bold text-gray-900">
                ReceiptCheck
              </span>
            </Link>
          </div>

          {/* Success Card */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-xl">
            {/* Icon */}
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
            </div>

            {/* Heading */}
            <div className="text-center">
              <h1 className="mb-3 text-2xl sm:text-3xl font-bold text-gray-900">
                Check Your Email
              </h1>

              <p className="mb-6 text-sm sm:text-base leading-relaxed text-gray-600">
                We&apos;ve sent a password reset link to{" "}
                <span className="font-semibold text-gray-900">{email}</span>
              </p>
            </div>

            {/* Info Box */}
            <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm leading-relaxed text-gray-700">
                💡 The reset link expires in 24 hours. Check your spam folder if
                you don&apos;t see the email.
              </p>
            </div>

            {/* Button */}
            <Link href="/sign-in">
              <button className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3 text-sm sm:text-base font-semibold text-white shadow-lg transition-all duration-300 hover:from-emerald-600 hover:to-cyan-600 hover:shadow-xl">
                Back to Sign In
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* DEFAULT STATE */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 px-4 sm:px-6 pt-24 pb-10">
      <div className="mx-auto w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="mb-6 inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg" />

            <span className="text-2xl font-bold text-gray-900">
              ReceiptCheck
            </span>
          </Link>

          <h1 className="mb-2 text-3xl sm:text-4xl font-bold text-gray-900">
            Reset Your Password
          </h1>

          <p className="text-sm sm:text-base text-gray-600">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                <input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm outline-none transition-all duration-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3 text-sm sm:text-base font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.01] hover:from-emerald-600 hover:to-cyan-600 hover:shadow-xl"
            >
              Send Reset Link
            </button>
          </form>

          {/* Back Link */}
          <div className="mt-6">
            <Link
              href="/sign-in"
              className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-emerald-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Link>
          </div>
        </div>

        {/* Bottom Tip */}
        <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
          <p className="text-center text-sm leading-relaxed text-gray-700">
            💡 <span className="font-semibold">Tip:</span> Check your spam
            folder if you don&apos;t see the email within 5 minutes.
          </p>
        </div>
      </div>
    </div>
  );
}
