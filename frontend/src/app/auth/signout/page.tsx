"use client";

import { authClient } from "@/lib/auth-client";
import router from "next/dist/shared/lib/router/router";
import { useRouter } from "next/navigation";

export default function SignOutPage() {
  const router = useRouter();
}

await authClient.signOut({
  fetchOptions: {
    onSuccess: () => {
      router.push("/login"); // redirect to login page
    },
  },
});
