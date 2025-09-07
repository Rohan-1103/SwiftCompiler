-- Create compilation_logs table for storing compilation results and outputs
create table if not exists public.compilation_logs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  language text not null,
  status text not null check (status in ('success', 'error', 'running', 'timeout')),
  output text,
  error_message text,
  execution_time_ms integer,
  memory_usage_mb integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.compilation_logs enable row level security;

-- RLS policies for compilation_logs
create policy "compilation_logs_select_own"
  on public.compilation_logs for select
  using (
    auth.uid() = user_id or 
    exists (
      select 1 from public.projects 
      where projects.id = compilation_logs.project_id 
      and (projects.user_id = auth.uid() or projects.is_public = true)
    )
  );

create policy "compilation_logs_insert_own"
  on public.compilation_logs for insert
  with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.projects 
      where projects.id = compilation_logs.project_id 
      and projects.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
create index if not exists compilation_logs_project_id_idx on public.compilation_logs(project_id);
create index if not exists compilation_logs_user_id_idx on public.compilation_logs(user_id);
create index if not exists compilation_logs_created_at_idx on public.compilation_logs(created_at desc);
