-- Supabase schema for Röst blog

create extension if not exists "pgcrypto";

create table if not exists categories (
  name text primary key
);

create table if not exists tags (
  name text primary key
);

create table if not exists profiles (
  user_id uuid primary key references auth.users on delete cascade,
  handle text unique not null,
  display_name text not null,
  avatar_url text,
  bio text,
  created_at timestamptz default now()
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  cover_url text,
  category text references categories(name),
  tags text[],
  published_at timestamptz default now(),
  created_at timestamptz default now(),
  author_name text,
  author_id uuid references auth.users on delete set null
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  author_name text not null,
  body text not null,
  created_at timestamptz default now()
);

create table if not exists likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  user_id uuid references auth.users on delete cascade,
  created_at timestamptz default now(),
  constraint likes_post_user_unique unique (post_id, user_id)
);

create table if not exists follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid references auth.users on delete cascade,
  following_id uuid references auth.users on delete cascade,
  created_at timestamptz default now(),
  constraint follows_unique unique (follower_id, following_id)
);

create table if not exists bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  post_id uuid references posts(id) on delete cascade,
  created_at timestamptz default now(),
  constraint bookmarks_user_post_unique unique (user_id, post_id)
);

alter table bookmarks enable row level security;

create policy "Allow users to read their bookmarks" on bookmarks
  for select using (user_id = auth.uid());

create policy "Allow users to save bookmarks" on bookmarks
  for insert with check (user_id = auth.uid());

create policy "Allow users to remove bookmarks" on bookmarks
  for delete using (user_id = auth.uid());

-- Row-level security for public reads
alter table posts enable row level security;
alter table comments enable row level security;
alter table likes enable row level security;
alter table follows enable row level security;
alter table profiles enable row level security;

create policy "Allow read posts" on posts for select using (true);
create policy "Allow read comments" on comments for select using (true);
create policy "Allow read likes" on likes for select using (true);
create policy "Allow read follows" on follows for select using (true);
create policy "Allow read profiles" on profiles for select using (true);

create policy "Allow authenticated inserts" on posts
  for insert with check (auth.role() = 'authenticated');

create policy "Allow authenticated comments" on comments
  for insert with check (auth.role() = 'authenticated');

create policy "Allow own likes" on likes
  for insert with check (user_id = auth.uid())
  for delete using (user_id = auth.uid());

create policy "Allow follow/unfollow" on follows
  for insert with check (follower_id = auth.uid())
  for delete using (follower_id = auth.uid());

create policy "Allow profile upserts" on profiles
  for insert with check (user_id = auth.uid())
  for update with check (user_id = auth.uid());

-- Seed some starter metadata
insert into categories (name) values
  ('Personal Essays'),
  ('Community Notes'),
  ('Collective Journals'),
  ('Creative Process')
on conflict do nothing;

insert into tags (name) values
  ('reflection'),
  ('art'),
  ('science'),
  ('notes'),
  ('archive')
on conflict do nothing;
