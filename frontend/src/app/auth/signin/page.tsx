"use client";

import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const handleEmailLogin = async () => {
    const { data, error } = await authClient.signIn.email(
      {
        email: "tesfayewalelign2@gmail.com",
        password: "ABUwalelign@2016",
        callbackURL: "/dashboard",
        rememberMe: false,
      },
      {
        onRequest: () => {
          console.log("Logging in...");
        },
        onSuccess: () => {
          window.location.href = "/dashboard";
        },
        onError: (ctx) => {
          alert(ctx.error.message);
        },
      },
    );
  };

  const handleGithubLogin = async () => {
    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/dashboard",
      errorCallbackURL: "/error",
      newUserCallbackURL: "/welcome",
      disableRedirect: false,
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <button onClick={handleEmailLogin}>Login with Email</button>

      <button onClick={handleGithubLogin}>Continue with GitHub</button>
    </div>
  );
}
