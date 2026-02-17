# Smart Bookmark App

A simple bookmark manager I built as part of a screening task. You log in with Google, save your favorite links, and they sync in real time across tabs.

**Live app:** https://smart-bookmark-app-black-beta.vercel.app

## What it does

- Sign in with your Google account (no passwords needed)
- Add bookmarks with a title and URL
- Delete bookmarks you no longer need
- Your bookmarks are private — nobody else can see them
- Open the app in two tabs, and changes show up instantly in both (real-time sync)

## Built with

- **Next.js** with App Router
- **Supabase** for auth, database, and real-time
- **Tailwind CSS** for styling
- Deployed on **Vercel**

## Problems I faced and how I fixed them

### Setting up Google OAuth redirect

Getting Google login to work was tricky at first. After signing in, the app kept redirecting to `localhost` instead of my Vercel URL. I realized I needed to add my deployed URL to the **Redirect URLs** list in Supabase's Authentication settings. Once I added `https://smart-bookmark-app-black-beta.vercel.app/` there, it worked perfectly.

### Supabase Realtime not picking up changes

After setting up the realtime subscription, changes weren't syncing between tabs. I spent some time debugging before I realized I hadn't enabled **Realtime** on the `bookmarks` table in Supabase. You have to go to Database → Tables → select the table → and toggle Realtime on. It's easy to miss.

### Vercel build failing with root directory issue

My first deploy failed because Vercel couldn't find `package.json`. The project was inside a subdirectory (`smart-bookmark-app/`) rather than at the repo root. I fixed it by changing the **Root Directory** setting in Vercel to point to the right folder.

### Row Level Security blocking all queries

After enabling RLS on the `bookmarks` table, all my queries started returning empty results. I forgot that enabling RLS without adding any policies blocks everything by default. I had to create SELECT, INSERT, and DELETE policies that check `auth.uid() = user_id` so users can only access their own data.

## How to run locally

1. Clone this repo
2. `npm install`
3. Create a `.env.local` with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
   ```
4. `npm run dev`
5. Open http://localhost:3000
