-- Jungian Slip Milestone 1 schema.
-- RLS is enabled with permissive anon policies for M1.
-- Flagged for hardening before launch (scope by anon_id/auth_user_id).

create table cases (
  id text primary key,
  title text not null,
  version int not null default 1,
  difficulty text null,
  content jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table players (
  id uuid primary key default gen_random_uuid(),
  anon_id text unique not null,
  auth_user_id uuid null,
  created_at timestamptz not null default now()
);

create table sessions (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id) on delete cascade,
  case_id text not null references cases(id),
  current_node text not null,
  rapport int not null default 0,
  status text not null default 'in_progress',
  ending_id text null,
  auto_advance boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index sessions_player_status_idx on sessions (player_id, status);

create table session_choices (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  ordinal int not null,
  node_id text not null,
  choice_id text not null,
  rapport_delta int not null,
  chosen_at timestamptz not null default now(),
  unique (session_id, ordinal)
);

create table clusters (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  label text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table session_snippets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  snippet_id text not null,
  x_position real not null,
  y_position real not null,
  cluster_id uuid null references clusters(id) on delete set null,
  captured_at timestamptz not null default now(),
  unique (session_id, snippet_id)
);

create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger cases_set_updated_at before update on cases
  for each row execute function set_updated_at();
create trigger sessions_set_updated_at before update on sessions
  for each row execute function set_updated_at();
create trigger clusters_set_updated_at before update on clusters
  for each row execute function set_updated_at();

alter table cases enable row level security;
alter table players enable row level security;
alter table sessions enable row level security;
alter table session_choices enable row level security;
alter table clusters enable row level security;
alter table session_snippets enable row level security;

create policy m1_anon_all on cases for all to anon using (true) with check (true);
create policy m1_anon_all on players for all to anon using (true) with check (true);
create policy m1_anon_all on sessions for all to anon using (true) with check (true);
create policy m1_anon_all on session_choices for all to anon using (true) with check (true);
create policy m1_anon_all on clusters for all to anon using (true) with check (true);
create policy m1_anon_all on session_snippets for all to anon using (true) with check (true);
