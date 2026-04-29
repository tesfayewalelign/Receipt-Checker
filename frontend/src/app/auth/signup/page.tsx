"use client";

import { authClient } from "@/lib/auth-client";

export default function SignUpPage() {
  const handleSignUp = async () => {
    const { data, error } = await authClient.signUp.email(
      {
        email: "tesfayewalelign2@gmail.com",
        password: "ABUwalelign@2016",
        name: "Tesfaye ",
        image: "",
        callbackURL: "/dashboard",
      },
      {
        onRequest: () => {
          console.log("Loading...");
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

  return (
    <div>
      <button onClick={handleSignUp}>Sign Up</button>
    </div>
  );
}
