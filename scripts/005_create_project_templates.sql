-- Create project_templates table for storing reusable project templates
create table if not exists public.project_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  language text not null,
  template_data jsonb not null default '{}',
  is_official boolean default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.project_templates enable row level security;

-- RLS policies for project_templates - templates are readable by all authenticated users
create policy "project_templates_select_all"
  on public.project_templates for select
  using (auth.role() = 'authenticated');

create policy "project_templates_insert_own"
  on public.project_templates for insert
  with check (auth.uid() = created_by and is_official = false);

create policy "project_templates_update_own"
  on public.project_templates for update
  using (auth.uid() = created_by and is_official = false);

create policy "project_templates_delete_own"
  on public.project_templates for delete
  using (auth.uid() = created_by and is_official = false);

-- Insert some default templates
insert into public.project_templates (name, description, language, template_data, is_official) values
('JavaScript Hello World', 'Basic JavaScript hello world program', 'javascript', '{"files": [{"name": "main.js", "content": "console.log(\"Hello, World!\");"}]}', true),
('Python Hello World', 'Basic Python hello world program', 'python', '{"files": [{"name": "main.py", "content": "print(\"Hello, World!\")"}]}', true),
('Java Hello World', 'Basic Java hello world program', 'java', '{"files": [{"name": "Main.java", "content": "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, World!\");\n    }\n}"}]}', true),
('C++ Hello World', 'Basic C++ hello world program', 'cpp', '{"files": [{"name": "main.cpp", "content": "#include <iostream>\n\nint main() {\n    std::cout << \"Hello, World!\" << std::endl;\n    return 0;\n}"}]}', true),
('HTML Web Page', 'Basic HTML web page template', 'html', '{"files": [{"name": "index.html", "content": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>My Web Page</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n    <p>Welcome to my web page.</p>\n</body>\n</html>"}]}', true)
on conflict (name) do nothing;

-- Create index for better performance
create index if not exists project_templates_language_idx on public.project_templates(language);
