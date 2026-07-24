-- 쪼꼬 앱 Supabase 스키마
-- 사용법: Supabase 대시보드 → SQL Editor → 전체 붙여넣기 → Run (1회)

create extension if not exists pgcrypto;

-- ── 테이블 ───────────────────────────────────────────────────────

create table public.families (
  id uuid primary key default gen_random_uuid(),
  invite_code text not null unique,
  nickname text not null default '쪼꼬',
  surname text not null default '',
  edd date not null default '2027-03-17',
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.family_members (
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('dad', 'mom')),
  created_at timestamptz not null default now(),
  primary key (family_id, user_id)
);

create table public.checklist_done (
  family_id uuid not null references public.families(id) on delete cascade,
  task_id text not null,
  done_by uuid not null references auth.users(id),
  done_at timestamptz not null default now(),
  primary key (family_id, task_id)
);

create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  author uuid not null references auth.users(id),
  author_role text not null check (author_role in ('dad', 'mom')),
  entry_date date not null default current_date,
  body text not null,
  created_at timestamptz not null default now()
);

create table public.name_candidates (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  hangul text not null,
  hanja text not null default '',
  meaning text not null default '',
  proposed_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique (family_id, hangul)
);

create table public.name_votes (
  name_id uuid not null references public.name_candidates(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  score int not null check (score between 0 and 5),
  updated_at timestamptz not null default now(),
  primary key (name_id, user_id)
);

create table public.ultrasound_photos (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  taken_on date not null default current_date,
  week int,
  memo text not null default '',
  storage_path text not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

-- ── 함수 (security definer: RLS 우회가 필요한 최소 지점) ─────────

-- 멤버 여부 확인 (RLS 정책 재귀 방지용)
create or replace function public.is_family_member(fid uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from family_members
    where family_id = fid and user_id = auth.uid()
  );
$$;

-- 가족 공간 생성 + 초대 코드 발급 + 본인 멤버 등록 (원자적)
create or replace function public.create_family(member_role text, p_surname text default '')
returns public.families
language plpgsql security definer set search_path = public as $$
declare
  code text;
  fam public.families;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if member_role not in ('dad', 'mom') then raise exception 'invalid role'; end if;
  loop
    select string_agg(substr('ABCDEFGHJKMNPQRSTUVWXYZ23456789', 1 + floor(random() * 31)::int, 1), '')
      into code from generate_series(1, 6);
    exit when not exists (select 1 from families where invite_code = code);
  end loop;
  insert into families (invite_code, surname, created_by)
    values (code, coalesce(p_surname, ''), auth.uid())
    returning * into fam;
  insert into family_members (family_id, user_id, role)
    values (fam.id, auth.uid(), member_role);
  return fam;
end;
$$;

-- 초대 코드로 가족 공간 참여
create or replace function public.join_family(code text, member_role text)
returns public.families
language plpgsql security definer set search_path = public as $$
declare
  fam public.families;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if member_role not in ('dad', 'mom') then raise exception 'invalid role'; end if;
  select * into fam from families where invite_code = upper(trim(code));
  if fam.id is null then raise exception 'invalid invite code'; end if;
  insert into family_members (family_id, user_id, role)
    values (fam.id, auth.uid(), member_role)
    on conflict (family_id, user_id) do update set role = excluded.role;
  return fam;
end;
$$;

-- ── RLS ──────────────────────────────────────────────────────────

alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.checklist_done enable row level security;
alter table public.journal_entries enable row level security;
alter table public.name_candidates enable row level security;
alter table public.name_votes enable row level security;
alter table public.ultrasound_photos enable row level security;

create policy "families: member read" on public.families
  for select using (is_family_member(id));
create policy "families: member update" on public.families
  for update using (is_family_member(id));

create policy "members: read own or same family" on public.family_members
  for select using (user_id = auth.uid() or is_family_member(family_id));

create policy "checklist: member read" on public.checklist_done
  for select using (is_family_member(family_id));
create policy "checklist: member insert" on public.checklist_done
  for insert with check (is_family_member(family_id) and done_by = auth.uid());
create policy "checklist: member delete" on public.checklist_done
  for delete using (is_family_member(family_id));

create policy "journal: member read" on public.journal_entries
  for select using (is_family_member(family_id));
create policy "journal: own insert" on public.journal_entries
  for insert with check (is_family_member(family_id) and author = auth.uid());
create policy "journal: own delete" on public.journal_entries
  for delete using (author = auth.uid());

create policy "names: member read" on public.name_candidates
  for select using (is_family_member(family_id));
create policy "names: member insert" on public.name_candidates
  for insert with check (is_family_member(family_id) and proposed_by = auth.uid());
create policy "names: member delete" on public.name_candidates
  for delete using (is_family_member(family_id));

create policy "votes: member read" on public.name_votes
  for select using (exists (
    select 1 from public.name_candidates nc
    where nc.id = name_id and is_family_member(nc.family_id)
  ));
create policy "votes: own insert" on public.name_votes
  for insert with check (user_id = auth.uid() and exists (
    select 1 from public.name_candidates nc
    where nc.id = name_id and is_family_member(nc.family_id)
  ));
create policy "votes: own update" on public.name_votes
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "photos: member read" on public.ultrasound_photos
  for select using (is_family_member(family_id));
create policy "photos: member insert" on public.ultrasound_photos
  for insert with check (is_family_member(family_id) and created_by = auth.uid());
create policy "photos: member update" on public.ultrasound_photos
  for update using (is_family_member(family_id));
create policy "photos: member delete" on public.ultrasound_photos
  for delete using (is_family_member(family_id));

-- ── 스토리지 (초음파 사진, 비공개 버킷) ──────────────────────────
-- 경로 규칙: <family_id>/<uuid>.<ext>

insert into storage.buckets (id, name, public)
  values ('ultrasounds', 'ultrasounds', false)
  on conflict (id) do nothing;

create policy "ultrasounds: family read" on storage.objects
  for select using (
    bucket_id = 'ultrasounds'
    and public.is_family_member(((storage.foldername(name))[1])::uuid)
  );
create policy "ultrasounds: family upload" on storage.objects
  for insert with check (
    bucket_id = 'ultrasounds'
    and public.is_family_member(((storage.foldername(name))[1])::uuid)
  );
create policy "ultrasounds: family delete" on storage.objects
  for delete using (
    bucket_id = 'ultrasounds'
    and public.is_family_member(((storage.foldername(name))[1])::uuid)
  );

-- ── 실시간 동기화 (부부 기기 간 즉시 반영) ───────────────────────

alter publication supabase_realtime add table public.checklist_done;
alter publication supabase_realtime add table public.journal_entries;
alter publication supabase_realtime add table public.name_candidates;
alter publication supabase_realtime add table public.name_votes;
alter publication supabase_realtime add table public.ultrasound_photos;
