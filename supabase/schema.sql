-- Minimal starter schema for auth-protected profiles
create table if not exists public.profiles (
	id uuid primary key references auth.users(id) on delete cascade,
	username text unique,
	full_name text,
	avatar_url text,
	updated_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone" on public.profiles
	for select using (true);

create policy "Users can insert their own profile" on public.profiles
	for insert with check (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
	for update using (auth.uid() = id);

-- Upsert profile on signup via trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
	insert into public.profiles (id)
	values (new.id)
	on conflict (id) do nothing;
	return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
	after insert on auth.users
	for each row execute procedure public.handle_new_user();


-- =============================
-- App domain tables and policies
-- =============================

-- Utility: common timestamp default
create extension if not exists pgcrypto;

-- 1) Assessments (questionnaire responses per user)
create table if not exists public.assessments (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users(id) on delete cascade,
	category text not null, -- e.g., mood, anxiety, stress
	score numeric not null,
	meta jsonb,
	created_at timestamptz default now()
);
alter table public.assessments enable row level security;
create policy "Users can view own assessments" on public.assessments for select using (auth.uid() = user_id);
create policy "Users can insert own assessments" on public.assessments for insert with check (auth.uid() = user_id);
create policy "Users can update own assessments" on public.assessments for update using (auth.uid() = user_id);
create policy "Users can delete own assessments" on public.assessments for delete using (auth.uid() = user_id);

-- 2) Daily Check-ins
create table if not exists public.daily_checkins (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users(id) on delete cascade,
	mood integer check (mood between 1 and 10),
	energy integer check (energy between 1 and 10),
	gratitude text,
	challenge text,
	tomorrow text,
	activities text[] default '{}',
	water_intake integer,
	sleep_hours numeric,
	journal text,
	created_at timestamptz default now()
);
-- Unique per day per user using a functional index
-- Replace functional index (which used a STABLE cast) with physical date column
drop index if exists daily_checkins_user_date_key;
alter table public.daily_checkins
	add column if not exists created_date date not null default (now() at time zone 'utc')::date;
-- Backfill created_date for any pre-existing rows
update public.daily_checkins
	set created_date = (created_at at time zone 'utc')::date
	where created_date is null;
create unique index if not exists daily_checkins_user_date_key
	on public.daily_checkins (user_id, created_date);
alter table public.daily_checkins enable row level security;
create policy "Users can view own checkins" on public.daily_checkins for select using (auth.uid() = user_id);
create policy "Users can insert own checkins" on public.daily_checkins for insert with check (auth.uid() = user_id);
create policy "Users can update own checkins" on public.daily_checkins for update using (auth.uid() = user_id);
create policy "Users can delete own checkins" on public.daily_checkins for delete using (auth.uid() = user_id);

-- 3) Disability Checks (screenings)
create table if not exists public.disability_checks (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users(id) on delete cascade,
	type text not null, -- screening type
	result jsonb not null,
	created_at timestamptz default now()
);
alter table public.disability_checks enable row level security;
create policy "Users can view own disability checks" on public.disability_checks for select using (auth.uid() = user_id);
create policy "Users can insert own disability checks" on public.disability_checks for insert with check (auth.uid() = user_id);
create policy "Users can update own disability checks" on public.disability_checks for update using (auth.uid() = user_id);
create policy "Users can delete own disability checks" on public.disability_checks for delete using (auth.uid() = user_id);

-- 4) Goals
create table if not exists public.goals (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users(id) on delete cascade,
	title text not null,
	description text,
	status text not null default 'active', -- active, completed, archived
	progress integer not null default 0 check (progress between 0 and 100),
	created_at timestamptz default now(),
	updated_at timestamptz default now()
);
alter table public.goals enable row level security;
create policy "Users can view own goals" on public.goals for select using (auth.uid() = user_id);
create policy "Users can insert own goals" on public.goals for insert with check (auth.uid() = user_id);
create policy "Users can update own goals" on public.goals for update using (auth.uid() = user_id);
create policy "Users can delete own goals" on public.goals for delete using (auth.uid() = user_id);

-- 5) Rewards
-- User Progress and XP System
create table if not exists public.user_progress (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users(id) on delete cascade,
	level integer not null default 1,
	xp integer not null default 0,
	total_xp integer not null default 0,
	calm_points integer not null default 0,
	created_at timestamptz default now(),
	updated_at timestamptz default now(),
	unique(user_id)
);

-- XP and Points Logs
create table if not exists public.xp_logs (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users(id) on delete cascade,
	amount integer not null,
	source text not null, -- 'goal_completion', 'quiz_completion', 'daily_challenge', etc.
	source_id uuid, -- ID of the source (goal_id, assessment_id, challenge_id)
	total_xp integer not null,
	created_at timestamptz default now()
);

create table if not exists public.points_logs (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users(id) on delete cascade,
	amount integer not null,
	source text not null,
	source_id uuid,
	total_points integer not null,
	created_at timestamptz default now()
);

-- Daily Challenges
create table if not exists public.daily_challenges (
	id uuid primary key default gen_random_uuid(),
	title text not null,
	description text not null,
	xp_reward integer not null default 0,
	points_reward integer not null default 0,
	category text not null check (category in ('wellness', 'productivity', 'social', 'learning')),
	difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
	date date not null default current_date,
	created_at timestamptz default now()
);

-- Challenge Completions
create table if not exists public.challenge_completions (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users(id) on delete cascade,
	challenge_id uuid not null references public.daily_challenges(id) on delete cascade,
	completed_at timestamptz default now(),
	unique(user_id, challenge_id)
);

-- Rewards (updated)
create table if not exists public.rewards (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users(id) on delete cascade,
	name text not null,
	points integer not null default 0,
	redeemed boolean not null default false,
	created_at timestamptz default now()
);

-- RLS Policies
alter table public.user_progress enable row level security;
create policy "Users can view own progress" on public.user_progress for select using (auth.uid() = user_id);
create policy "Users can update own progress" on public.user_progress for update using (auth.uid() = user_id);
create policy "Users can insert own progress" on public.user_progress for insert with check (auth.uid() = user_id);

alter table public.xp_logs enable row level security;
create policy "Users can view own xp logs" on public.xp_logs for select using (auth.uid() = user_id);
create policy "Users can insert own xp logs" on public.xp_logs for insert with check (auth.uid() = user_id);

alter table public.points_logs enable row level security;
create policy "Users can view own points logs" on public.points_logs for select using (auth.uid() = user_id);
create policy "Users can insert own points logs" on public.points_logs for insert with check (auth.uid() = user_id);

alter table public.daily_challenges enable row level security;
create policy "Daily challenges are public readable" on public.daily_challenges for select using (true);

alter table public.challenge_completions enable row level security;
create policy "Users can view own completions" on public.challenge_completions for select using (auth.uid() = user_id);
create policy "Users can insert own completions" on public.challenge_completions for insert with check (auth.uid() = user_id);

alter table public.rewards enable row level security;
create policy "Users can view own rewards" on public.rewards for select using (auth.uid() = user_id);
create policy "Users can manage own rewards" on public.rewards for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 6) Community (posts, comments, likes)
create table if not exists public.community_posts (
	id uuid primary key default gen_random_uuid(),
	author_id uuid not null references auth.users(id) on delete cascade,
	content text not null,
	created_at timestamptz default now()
);
alter table public.community_posts enable row level security;
create policy "Posts are public readable" on public.community_posts for select using (true);
create policy "Users can insert own posts" on public.community_posts for insert with check (auth.uid() = author_id);
create policy "Users can update/delete own posts" on public.community_posts for all using (auth.uid() = author_id) with check (auth.uid() = author_id);

create table if not exists public.community_comments (
	id uuid primary key default gen_random_uuid(),
	post_id uuid not null references public.community_posts(id) on delete cascade,
	author_id uuid not null references auth.users(id) on delete cascade,
	content text not null,
	created_at timestamptz default now()
);
alter table public.community_comments enable row level security;
create policy "Comments are public readable" on public.community_comments for select using (true);
create policy "Users can insert own comments" on public.community_comments for insert with check (auth.uid() = author_id);
create policy "Users can update/delete own comments" on public.community_comments for all using (auth.uid() = author_id) with check (auth.uid() = author_id);


create table if not exists public.community_likes (
	post_id uuid not null references public.community_posts(id) on delete cascade,
	user_id uuid not null references auth.users(id) on delete cascade,
	created_at timestamptz default now(),
	primary key (post_id, user_id)
);
alter table public.community_likes enable row level security;
create policy "Likes are public readable" on public.community_likes for select using (true);
create policy "Users can like/unlike as self" on public.community_likes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 7) Consultations (bookings)
create table if not exists public.consultations (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users(id) on delete cascade,
	provider text not null,
	scheduled_at timestamptz not null,
	status text not null default 'scheduled', -- scheduled, completed, cancelled
	notes text,
	created_at timestamptz default now()
);
alter table public.consultations enable row level security;
create policy "Users can view own consultations" on public.consultations for select using (auth.uid() = user_id);
create policy "Users can manage own consultations" on public.consultations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 8) SOS alerts
create table if not exists public.sos_alerts (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users(id) on delete cascade,
	latitude double precision,
	longitude double precision,
	message text,
	status text default 'open', -- open, acknowledged, closed
	created_at timestamptz default now()
);
alter table public.sos_alerts enable row level security;
create policy "Users can view own sos" on public.sos_alerts for select using (auth.uid() = user_id);
create policy "Users can manage own sos" on public.sos_alerts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 9) Resources (catalog) - public readable
create table if not exists public.resources (
	id uuid primary key default gen_random_uuid(),
	title text not null,
	description text,
	url text,
	category text,
	created_at timestamptz default now()
);
alter table public.resources enable row level security;
create policy "Resources are public readable" on public.resources for select using (true);
-- Optionally limit inserts to admins by future role checks
create policy "Authenticated can add resources" on public.resources for insert with check (auth.role() = 'authenticated');
create policy "Authors can update/delete resources when needed" on public.resources for update using (true) with check (true);

-- 10) Vault (user private docs)
create table if not exists public.vault_files (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users(id) on delete cascade,
	name text not null,
	path text not null, -- storage path in Supabase Storage
	created_at timestamptz default now()
);
alter table public.vault_files enable row level security;
create policy "Users can view own vault files" on public.vault_files for select using (auth.uid() = user_id);
create policy "Users can manage own vault files" on public.vault_files for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 10b) Vault entries (journal/thoughts)
create table if not exists public.vault_entries (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users(id) on delete cascade,
	title text not null,
	content text not null,
	type text, -- e.g., Vent, Dream, Note
	mood text, -- e.g., Angry, Sad, Anxious, Happy
	word_count integer generated always as (length(content)) stored,
	created_at timestamptz default now()
);
alter table public.vault_entries enable row level security;
create policy "Users can view own entries" on public.vault_entries for select using (auth.uid() = user_id);
create policy "Users can insert own entries" on public.vault_entries for insert with check (auth.uid() = user_id);
create policy "Users can update own entries" on public.vault_entries for update using (auth.uid() = user_id);
create policy "Users can delete own entries" on public.vault_entries for delete using (auth.uid() = user_id);

-- overview helper
drop function if exists public.vault_overview(uuid);
create or replace function public.vault_overview(p_user_id uuid)
returns table (
	total_entries bigint,
	total_words bigint,
	by_mood json,
	by_mood_week json
) security definer language sql stable set search_path = public as $$
  with base as (
    select * from public.vault_entries where user_id = p_user_id
  ), mood_counts as (
    select mood, count(*)::int as count from base group by mood
  ), week as (
    select generate_series(date_trunc('day', now()) - interval '6 days', date_trunc('day', now()), interval '1 day')::date as day
  ), base_week as (
    select date_trunc('day', created_at)::date as day, mood from base where created_at >= (select min(day) from week)
  ), mood_week as (
    select w.day, coalesce(bw.mood, 'Unknown') as mood, count(bw.mood)::int as count
    from week w
    left join base_week bw on bw.day = w.day
    group by w.day, coalesce(bw.mood, 'Unknown')
    order by w.day asc
  )
  select
    (select count(*) from base) as total_entries,
    (select coalesce(sum((select coalesce(array_length(regexp_split_to_array(content, E'\\s+'),1),0))),0) from base) as total_words,
    (select coalesce(json_agg(json_build_object('mood', mood, 'count', count)), '[]'::json) from mood_counts) as by_mood,
    (select coalesce(json_agg(json_build_object('day', to_char(day, 'YYYY-MM-DD'), 'mood', mood, 'count', count)), '[]'::json) from mood_week) as by_mood_week
$$;

-- 11) Games (scores)
create table if not exists public.game_scores (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users(id) on delete cascade,
	game text not null,
	score integer not null,
	created_at timestamptz default now()
);
alter table public.game_scores enable row level security;
create policy "Users can view own scores" on public.game_scores for select using (auth.uid() = user_id);
create policy "Users can insert own scores" on public.game_scores for insert with check (auth.uid() = user_id);

-- 12) Settings (per-user)
create table if not exists public.user_settings (
	user_id uuid primary key references auth.users(id) on delete cascade,
	dark_mode boolean default false,
	notifications_enabled boolean default true,
	language text default 'en',
	updated_at timestamptz default now()
);
alter table public.user_settings enable row level security;
create policy "Users can view own settings" on public.user_settings for select using (auth.uid() = user_id);
create policy "Users can upsert own settings" on public.user_settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 13) Notifications
create table if not exists public.notifications (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users(id) on delete cascade,
	type text not null,
	payload jsonb,
	read boolean default false,
	created_at timestamptz default now()
);
alter table public.notifications enable row level security;
create policy "Users can view own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Users can update own notifications" on public.notifications for update using (auth.uid() = user_id);
create policy "Users can insert own notifications" on public.notifications for insert with check (auth.uid() = user_id);

-- 14) Achievements
create table if not exists public.achievements_catalog (
	key text primary key,
	title text not null,
	description text,
	icon text -- optional emoji or icon key
);

create table if not exists public.user_achievements (
	user_id uuid not null references auth.users(id) on delete cascade,
	achievement_key text not null references public.achievements_catalog(key) on delete cascade,
	earnt_at timestamptz default now(),
	primary key (user_id, achievement_key)
);
alter table public.user_achievements enable row level security;
create policy "Users can view own achievements" on public.user_achievements for select using (auth.uid() = user_id);
create policy "Users can insert own achievements" on public.user_achievements for insert with check (auth.uid() = user_id);

-- Seed common achievements
insert into public.achievements_catalog(key, title, description, icon) values
('first_goal_created','Getting Started','Created your first goal','🎯'),
('first_goal_completed','First Win','Completed your first goal','🏅'),
('streak_3','On a Roll','Completed 3 goals','🔥'),
('streak_5','Goal Crusher','Completed 5 goals','💪'),
('progress_100','Perfectionist','Reached 100% on any goal','✅'),
('week_warrior','Week Warrior','Completed a goal within 7 days','🗓️'),
('early_bird','Early Bird','Added a goal before 8am','🌅'),
('night_owl','Night Owl','Completed a goal after 10pm','🌙'),
('focus_master','Focus Master','Edited a goal and improved progress','🎛️'),
('comeback_kid','Comeback Kid','Completed a goal after a break','🏆')
on conflict (key) do nothing;

