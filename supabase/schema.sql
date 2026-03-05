-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create tables

-- Users table (extends auth.users)
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  target_role text,
  current_skills text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Career Sessions (Chat history)
create table public.career_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  title text default 'New Session',
  messages jsonb default '[]'::jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Roadmaps
create table public.roadmaps (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  target_role text not null,
  roadmap_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Journal Entries
create table public.journal_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  content text not null,
  tags text[] default array[]::text[],
  ai_summary text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.career_sessions enable row level security;
alter table public.roadmaps enable row level security;
alter table public.journal_entries enable row level security;

-- Create Policies
create policy "Users can view their own profile." on public.users for select using (auth.uid() = id);
create policy "Users can update their own profile." on public.users for update using (auth.uid() = id);

create policy "Users can view their own sessions." on public.career_sessions for select using (auth.uid() = user_id);
create policy "Users can insert their own sessions." on public.career_sessions for insert with check (auth.uid() = user_id);
create policy "Users can update their own sessions." on public.career_sessions for update using (auth.uid() = user_id);

create policy "Users can view their own roadmaps." on public.roadmaps for select using (auth.uid() = user_id);
create policy "Users can insert their own roadmaps." on public.roadmaps for insert with check (auth.uid() = user_id);

create policy "Users can view their own journal entries." on public.journal_entries for select using (auth.uid() = user_id);
create policy "Users can insert their own journal entries." on public.journal_entries for insert with check (auth.uid() = user_id);

-- Function to handle new user registration
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to automatically create user profile after signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
