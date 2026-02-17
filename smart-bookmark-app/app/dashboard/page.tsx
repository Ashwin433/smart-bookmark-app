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

    if (!user) return <div className="p-10">Loading...</div>;

    return (
        <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
            <div className="flex justify-between mb-6">
                <h1 className="text-2xl font-bold">My Bookmarks</h1>
                <button
                    onClick={logout}
                    className="text-red-500 underline text-sm"
                >
                    Logout
                </button>
            </div>

            {/* Add Form */}
            <div className="flex flex-col gap-2 mb-6">
                <input
                    className="border p-2 rounded"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <input
                    className="border p-2 rounded"
                    placeholder="URL"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                />

                <button
                    onClick={addBookmark}
                    className="bg-black text-white py-2 rounded"
                >
                    Add Bookmark
                </button>
            </div>

            {/* Bookmark List */}
            <div className="space-y-3">
                {bookmarks.map((bookmark) => (
                    <div
                        key={bookmark.id}
                        className="flex justify-between items-center border p-3 rounded"
                    >
                        <a
                            href={bookmark.url}
                            target="_blank"
                            className="text-blue-600 underline"
                        >
                            {bookmark.title}
                        </a>

                        <button
                            onClick={() => deleteBookmark(bookmark.id)}
                            className="text-red-500"
                        >
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
