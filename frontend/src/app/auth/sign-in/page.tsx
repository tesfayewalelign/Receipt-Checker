"use client";
import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Mail, Lock, Globe, GitBranch } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await authClient.signIn.email(
      {
        email,
        password,
        callbackURL: "/dashboard",
        rememberMe,
      },
      {
        onRequest: () => {
          console.log("Signing in...");
        },

        onSuccess: () => {
          router.push("/dashboard");
        },

        onError: (ctx) => {
          alert(ctx.error.message);
        },
      },
    );
  };

  const handleSocialLogin = async (provider: "google" | "github") => {
    await authClient.signIn.social({
      provider,
      callbackURL: "/dashboard",
    });
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50 pt-24 pb-12 px-4 sm:px-6">
      <div className="max-w-md mx-auto">
        {/* Logo + Heading */}
        <div className="text-center mb-8 sm:mb-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg" />

            <span className="text-2xl font-bold text-gray-900">
              ReceiptCheck
            </span>
          </Link>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Welcome Back
          </h1>

          <p className="text-sm sm:text-base text-gray-600 max-w-sm mx-auto">
            Sign in to access your dashboard, verification tools, and API keys.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 shadow-xl rounded-3xl p-6 sm:p-8">
          {/* Social Buttons */}
          <div className="space-y-3">
            {/* Google */}
            <button
              type="button"
              onClick={() => handleSocialLogin("google")}
              className="w-full flex items-center justify-center gap-3 border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 py-3 rounded-xl transition-all duration-300"
            >
              <Globe className="w-5 h-5 text-gray-700" />
              <span className="font-medium text-gray-800">
                Continue with Google
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin("github")}
              className="w-full flex items-center justify-center gap-3 border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 py-3 rounded-xl transition-all duration-300"
            >
              <GitBranch className="w-5 h-5 text-gray-700" />
              <span className="font-medium text-gray-800">
                Continue with GitHub
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6 sm:my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>

            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                <input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-12 rounded-xl border border-gray-300 bg-white pl-12 pr-4 text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-12 sm:h-13 rounded-xl border border-gray-300 bg-white pl-12 pr-4 text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                />

                <span className="text-sm text-gray-600">Remember me</span>
              </label>

              <Link
                href="/auth/forgot-password"
                className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full h-12 sm:h-13 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01]"
            >
              Sign In
            </button>
          </form>

          {/* Footer */}
          <div className="mt-7 text-center">
            <p className="text-sm sm:text-base text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/sign-up"
                className="font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Sign up for free
              </Link>
            </p>
          </div>
        </div>

        {/* Terms */}
        <p className="text-center text-xs sm:text-sm text-gray-500 mt-6 leading-relaxed px-2">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="text-emerald-600 hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-emerald-600 hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </section>
  );
}
