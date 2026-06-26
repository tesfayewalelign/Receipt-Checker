"use client";

import { authClient } from "@/lib/auth-client";

export default function User() {
  const { data: session, isPending, error } = authClient.useSession();

  if (isPending) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  if (!session) {
    return <p>Not logged in</p>;
  }

  return (
    <div>
      <h2>Welcome</h2>
      <p>Email: {session.user.email}</p>
      <p>Name: {session.user.name}</p>
    </div>
  );
}
