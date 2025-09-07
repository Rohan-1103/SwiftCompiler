-- Create project_files table for storing individual files within projects
create table if not exists public.project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  path text not null,
  content text not null default '',
  file_type text not null check (file_type in ('file', 'directory')),
  mime_type text,
  size_bytes integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(project_id, path)
);

alter table public.project_files enable row level security;

-- RLS policies for project_files
create policy "project_files_select_own"
  on public.project_files for select
  using (
    auth.uid() = user_id or 
    exists (
      select 1 from public.projects 
      where projects.id = project_files.project_id 
      and (projects.user_id = auth.uid() or projects.is_public = true)
    )
  );

create policy "project_files_insert_own"
  on public.project_files for insert
  with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.projects 
      where projects.id = project_files.project_id 
      and projects.user_id = auth.uid()
    )
  );

create policy "project_files_update_own"
  on public.project_files for update
  using (
    auth.uid() = user_id and
    exists (
      select 1 from public.projects 
      where projects.id = project_files.project_id 
      and projects.user_id = auth.uid()
    )
  );

create policy "project_files_delete_own"
  on public.project_files for delete
  using (
    auth.uid() = user_id and
    exists (
      select 1 from public.projects 
      where projects.id = project_files.project_id 
      and projects.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
create index if not exists project_files_project_id_idx on public.project_files(project_id);
create index if not exists project_files_user_id_idx on public.project_files(user_id);
create index if not exists project_files_path_idx on public.project_files(project_id, path);
