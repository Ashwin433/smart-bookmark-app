"use client";

import { supabase } from "../lib/supabase";

export default function Home() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/dashboard`
      },
    });
  };
  return (
    <div>
      <h1>Home</h1>
    </div>
  );
}
