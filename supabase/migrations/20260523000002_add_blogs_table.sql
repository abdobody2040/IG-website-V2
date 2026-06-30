-- Blogs table for the public blog section
create table if not exists public.blogs (
  id uuid not null primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  cover_image text,
  author text not null default 'Instant Grow Team',
  tags text[] default '{}',
  published boolean not null default false,
  featured boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.blogs enable row level security;

-- Everyone can read published blogs
drop policy if exists "Anyone can view published blogs" on public.blogs
; create policy "Anyone can view published blogs" on public.blogs
  for select using (published = true);

-- Admins can do everything
drop policy if exists "Admins can do anything with blogs" on public.blogs
; create policy "Admins can do anything with blogs" on public.blogs
  for all using (public.is_admin());

-- Index for common queries
create index if not exists idx_blogs_published_created
  on public.blogs (published, created_at desc);

create index if not exists idx_blogs_slug
  on public.blogs (slug);

create index if not exists idx_blogs_featured
  on public.blogs (featured) where published = true;

