"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, Building2, Chrome, Github } from "lucide-react";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    password: "",
    agreeToTerms: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("Sign Up Data:", formData);

    // Add signup logic here
  };

  const handleSocialSignup = (provider: string) => {
    console.log(`Continue with ${provider}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 pt-24 pb-10 px-4 sm:px-6">
      <div className="mx-auto w-full max-w-md">
        {/* Logo + Heading */}
        <div className="mb-8 text-center">
          <Link href="/" className="mb-6 inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg" />

            <span className="text-2xl font-bold text-gray-900">
              ReceiptCheck
            </span>
          </Link>

          <h1 className="mb-2 text-3xl sm:text-4xl font-bold text-gray-900">
            Create Your Account
          </h1>

          <p className="text-sm sm:text-base text-gray-600">
            Start verifying Ethiopian payment receipts in minutes
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-gray-200 bg-white p-5 sm:p-8 shadow-xl">
          {/* Social Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => handleSocialSignup("Google")}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 px-4 py-3 text-sm sm:text-base font-medium text-gray-700 transition-all duration-300 hover:border-gray-400 hover:bg-gray-50"
            >
              <Chrome className="h-5 w-5" />
              Continue with Google
            </button>

            <button
              onClick={() => handleSocialSignup("GitHub")}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 px-4 py-3 text-sm sm:text-base font-medium text-gray-700 transition-all duration-300 hover:border-gray-400 hover:bg-gray-50"
            >
              <Github className="h-5 w-5" />
              Continue with GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>

            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-sm text-gray-500">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Names */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* First Name */}
              <div>
                <label
                  htmlFor="firstName"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  First Name
                </label>

                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="Abebe"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition-all duration-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              {/* Last Name */}
              <div>
                <label
                  htmlFor="lastName"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Last Name
                </label>

                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Kebede"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition-all duration-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>
            </div>

            {/* Company */}
            <div>
              <label
                htmlFor="company"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Company Name
              </label>

              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                <input
                  id="company"
                  name="company"
                  type="text"
                  placeholder="Your Company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm outline-none transition-all duration-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>
            </div>

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
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm outline-none transition-all duration-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm outline-none transition-all duration-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Must be at least 8 characters with letters and numbers
              </p>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                required
                className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />

              <label
                htmlFor="agreeToTerms"
                className="text-sm leading-relaxed text-gray-600"
              >
                I agree to the{" "}
                <Link
                  href="#"
                  className="font-medium text-emerald-600 hover:text-emerald-700"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="#"
                  className="font-medium text-emerald-600 hover:text-emerald-700"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3 text-sm sm:text-base font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.01] hover:from-emerald-600 hover:to-cyan-600 hover:shadow-xl"
            >
              Create Account
            </button>
          </form>

          {/* Bottom */}
          <div className="mt-6 text-center">
            <p className="text-sm sm:text-base text-gray-600">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Free Tier */}
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-cyan-50 p-4 shadow-sm">
          <p className="text-center text-sm text-gray-700 leading-relaxed">
            🎉 <span className="font-semibold">Free tier includes:</span> 100
            verifications/month, full API access, and email support
          </p>
        </div>
      </div>
    </div>
  );
}
