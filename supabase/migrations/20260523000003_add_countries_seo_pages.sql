-- Programmatic SEO pages for country-specific landing pages
create table if not exists public.countries_seo_pages (
  id uuid not null primary key default gen_random_uuid(),
  slug text not null unique,
  country_name text not null,
  country_code text not null,
  meta_title text not null,
  meta_description text not null,
  hero_title text not null,
  hero_description text not null,
  main_keyword text not null,
  secondary_keywords text[] default '{}',
  pain_points jsonb default '[]',
  benefits jsonb default '[]',
  best_bank text,
  bank_notes text,
  tax_notes text,
  faq_json jsonb default '[]',
  cta_text text not null default 'Start Your US LLC Today',
  featured_image text,
  schema_json jsonb default '{}',
  published boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.countries_seo_pages enable row level security;

-- Everyone can read published SEO pages
drop policy if exists "Anyone can view published seo pages" on public.countries_seo_pages
; create policy "Anyone can view published seo pages" on public.countries_seo_pages
  for select using (published = true);

-- Admins can do everything
drop policy if exists "Admins can do anything with seo pages" on public.countries_seo_pages
; create policy "Admins can do anything with seo pages" on public.countries_seo_pages
  for all using (public.is_admin());

-- Indexes
create index if not exists idx_countries_seo_pages_slug
  on public.countries_seo_pages (slug);

create index if not exists idx_countries_seo_pages_published
  on public.countries_seo_pages (published);

