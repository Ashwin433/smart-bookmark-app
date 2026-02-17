"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Bookmark = {
    id: string;
    title: string;
    url: string;
};

export default function Dashboard() {
    const [user, setUser] = useState<any>(null);
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");

    // Get logged-in user
    useEffect(() => {
        const getUser = async () => {
            const { data } = await supabase.auth.getUser();

            if (!data.user) {
                window.location.href = "/";
            } else {
                setUser(data.user);
                // Clean up the access token from the URL
                window.history.replaceState({}, "", "/dashboard");
            }
        };

        getUser();
    }, []);

    // Fetch bookmarks
    const fetchBookmarks = async () => {
        const { data } = await supabase
            .from("bookmarks")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (data) setBookmarks(data);
    };

    // Add bookmark
    const addBookmark = async () => {
        if (!title || !url) return;

        await supabase.from("bookmarks").insert([
            {
                title,
                url,
                user_id: user.id,
            },
        ]);

        setTitle("");
        setUrl("");
    };

    // Delete bookmark
    const deleteBookmark = async (id: string) => {
        await supabase.from("bookmarks").delete().eq("id", id);
    };

    // Realtime subscription
    useEffect(() => {
        if (!user) return;

        fetchBookmarks();

        const channel = supabase
            .channel("bookmarks")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "bookmarks" },
                () => {
                    fetchBookmarks();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const logout = async () => {
        await supabase.auth.signOut();
        window.location.href = "/";
    };

    if (!user) return <div className="min-h-screen flex items-center justify-center bg-blue-50">Loading...</div>;

    return (
        <div className="min-h-screen bg-blue-50 py-10 px-4">
            <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-6">
                {/* Header */}
                <div className="flex justify-between items-center pb-4 mb-6 border-b">
                    <h1 className="text-2xl font-bold text-blue-600"> My Bookmarks</h1>
                    <button
                        onClick={logout}
                        className="text-red-500 hover:text-red-600 text-sm cursor-pointer"
                    >
                        Logout
                    </button>
                </div>

                {/* Add Form */}
                <div className="flex flex-col gap-2 mb-6 bg-gray-50 p-4 rounded-lg">
                    <input
                        className="border border-gray-300 p-2 rounded bg-white"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <input
                        className="border border-gray-300 p-2 rounded bg-white"
                        placeholder="URL"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />

                    <button
                        onClick={addBookmark}
                        className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded cursor-pointer"
                    >
                        + Add Bookmark
                    </button>
                </div>

                {/* Bookmark List */}
                <div className="space-y-2">
                    {bookmarks.map((bookmark) => (
                        <div
                            key={bookmark.id}
                            className="flex justify-between items-center border border-gray-200 p-3 rounded hover:bg-gray-50"
                        >
                            <a
                                href={bookmark.url}
                                target="_blank"
                                className="text-blue-600 hover:underline"
                            >
                                {bookmark.title}
                            </a>

                            <button
                                onClick={() => deleteBookmark(bookmark.id)}
                                className="text-red-500 hover:text-red-600 text-sm cursor-pointer"
                            >
                                Delete
                            </button>
                        </div>
                    ))}

                    {bookmarks.length === 0 && (
                        <p className="text-center text-gray-400 py-6">No bookmarks yet. Add one above!</p>
                    )}
                </div>
            </div>
        </div>
    );
}
