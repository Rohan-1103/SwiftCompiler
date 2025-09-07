-- Create projects table for storing user projects
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  language text not null check (language in ('javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'csharp', 'html', 'css')),
  template text default 'blank' check (template in ('blank', 'hello-world', 'web-app', 'api', 'cli')),
  is_public boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.projects enable row level security;

-- RLS policies for projects
create policy "projects_select_own"
  on public.projects for select
  using (auth.uid() = user_id or is_public = true);

create policy "projects_insert_own"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "projects_update_own"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "projects_delete_own"
  on public.projects for delete
  using (auth.uid() = user_id);

-- Create index for better performance
create index if not exists projects_user_id_idx on public.projects(user_id);
create index if not exists projects_language_idx on public.projects(language);
create index if not exists projects_public_idx on public.projects(is_public) where is_public = true;
