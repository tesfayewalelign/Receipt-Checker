"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, Building2, Globe, GitBranch } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }

    if (!formData.agreeToTerms) {
      alert("Please accept the Terms and Conditions");
      return;
    }

    setIsLoading(true);

    await authClient.signUp.email(
      {
        email: formData.email,
        password: formData.password,
        name: `${formData.firstName} ${formData.lastName}`,
        callbackURL: "/dashboard",
      },
      {
        onRequest: () => {
          console.log("Creating account...");
        },

        onSuccess: () => {
          router.push("/dashboard");
        },

        onError: (ctx) => {
          alert(ctx.error.message);
          setIsLoading(false);
        },
      },
    );

    setIsLoading(false);
  };

  const handleSocialSignup = async (provider: "google" | "github") => {
    await authClient.signIn.social({
      provider,
      callbackURL: "/dashboard",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 pt-24 pb-10 px-4 sm:px-6">
      <div className="mx-auto w-full max-w-md">
        {/* Logo */}
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
          {/* Google */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleSocialSignup("google")}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 px-4 py-3 text-sm sm:text-base font-medium text-gray-700 transition-all duration-300 hover:border-gray-400 hover:bg-gray-50"
            >
              <Globe className="h-5 w-5" />
              Continue with Google
            </button>

            {/* GitHub */}
            <button
              type="button"
              onClick={() => handleSocialSignup("github")}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 px-4 py-3 text-sm sm:text-base font-medium text-gray-700 transition-all duration-300 hover:border-gray-400 hover:bg-gray-50"
            >
              <GitBranch className="h-5 w-5" />
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
            {/* First Name */}
            <input
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 bg-white outline-none transition-all duration-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />

            {/* Last Name */}
            <input
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 bg-white outline-none transition-all duration-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />

            {/* Company */}
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />

              <input
                name="company"
                placeholder="Company Name"
                value={formData.company}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 bg-white outline-none transition-all duration-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />

              <input
                name="email"
                type="email"
                placeholder="you@company.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 bg-white outline-none transition-all duration-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />

              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 bg-white outline-none transition-all duration-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />

              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 bg-white outline-none transition-all duration-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="mt-1"
              />

              <span className="text-sm text-gray-600">
                I agree to the Terms of Service and Privacy Policy
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3 text-sm sm:text-base font-semibold text-white shadow-lg transition-all duration-300 hover:from-emerald-600 hover:to-cyan-600"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Bottom */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/sign-in" className="font-semibold text-emerald-600">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
