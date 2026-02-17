"use client";

import { supabase } from "../lib/supabase";

export default function Home() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/dashboard`,
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="bg-white rounded-lg shadow p-8 max-w-sm w-full text-center">
        <h1 className="text-2xl font-bold text-blue-600 mb-2">Smart Bookmark</h1>
        <p className="text-gray-500 text-sm mb-6 pb-4 border-b">
          Save and manage your bookmarks
        </p>
        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 px-4 rounded cursor-pointer"
        >
          Login with Google
        </button>
      </div>
    </div>
  );
}
