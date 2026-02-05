# Röst — Classy Community Blog

Röst is a open blogging playground built with Next.js, Tailwind CSS, Supabase, and Framer Motion. It is meant to be free-to-use, beautifully minimal, and entirely deployable on free tiers (Vercel, Supabase, freenom domain).

## 1. Supabase setup

1. Create a free project at https://app.supabase.com.
2. Go to **SQL Editor** and run `supabase/schema.sql` from this repo to create the tables, policies, and seed data.
3. In **Storage**, create a bucket named `rost-assets` with public access (for cover image uploads).
4. In **Project Settings → API**, note the `URL` and `anon` key.
5. In **Project Settings → Service Key**, copy the `service_role` key.
6. (Optional) Add additional categories/tags via the SQL editor or Table editor.

## 2. Environment variables

Copy `.env.local.example` to `.env.local` and replace the placeholders with your Supabase project credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=public-anon-key
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=service-role-key
```

These values let the client code read/write through Supabase Auth and Storage while the server actions use the service role key.

## 3. Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to see the pastel hero, login/signup panel, post list, and publish form. Posts are stored in Supabase and rendered on the home page plus dedicated `posts/[slug]` pages with comments.

## 4. Deployment

1. Push this repo to GitHub.
2. Connect the repo to **Vercel** (free tier). Set the same environment variables inside Vercel's dashboard.
3. Each push will trigger a production build. Vercel handles `/api` routes automatically and supports edge caching.

## 5. Free domain (matching the brand)

You asked for a unique name and matching domain. When you're ready, grab a free domain from [Freenom](https://www.freenom.com) such as `rostblog.gq`, `rostblog.ml`, or `rostblog.cf`. Add it to Vercel as a custom domain and point it to the deployment (Vercel will generate the SSL certificate).

## Extra notes

- The Supabase Auth panel uses email/password and is open for public signup.
- The `supabase/schema.sql` file seeds a few categories/tags, but feel free to expand them manually.
- When you have a final logo, drop it into `src/app/assets` and update the layout accordingly.

## Recent improvements

- Featured carousel, live stats, writer spotlight, and story-prompt widgets were added to highlight the community, moods, and sparks worth exploring.
- Tag pills and bookmark support let readers filter by mood and save stories for later; bookmarks are stored in the new `bookmarks` table (re-run `supabase/schema.sql` to create the table and policies).
- Authentication now includes Google, Apple, and Facebook OAuth providers alongside the existing email/password flow.
