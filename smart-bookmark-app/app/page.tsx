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
    <div className="flex items-center justify-center h-screen">
      <button onClick={handleLogin}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded "
      >
        Login with Google
      </button>
    </div>
  );
}
