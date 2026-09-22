-- LevelUp10 V0.24.0 — safeguarded Social Foundations
-- Run once in the Supabase SQL Editor after the existing account/parent migrations.
-- No auth.users trigger is created or changed.

begin;

create table if not exists public.social_preferences (
  student_id uuid primary key references public.profiles(id) on delete cascade,
  social_enabled boolean not null default false,
  leaderboard_allowed boolean not null default false,
  leaderboard_opt_in boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.friend_codes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  code text not null unique,
  expires_at timestamptz not null default (now() + interval '24 hours'),
  used_by uuid references public.profiles(id) on delete set null,
  used_at timestamptz,
  created_at timestamptz not null default now(),
  check (char_length(code) = 8)
);

create table if not exists public.friend_invites (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','declined','cancelled')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  unique(sender_id, receiver_id),
  check (sender_id <> receiver_id)
);

create table if not exists public.friendships (
  student_low uuid not null references public.profiles(id) on delete cascade,
  student_high uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(student_low, student_high),
  check (student_low < student_high)
);

create table if not exists public.user_blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

alter table public.social_preferences enable row level security;
alter table public.friend_codes enable row level security;
alter table public.friend_invites enable row level security;
alter table public.friendships enable row level security;
alter table public.user_blocks enable row level security;

-- Social tables are RPC-only. No broad client table policies are created.
revoke all on public.social_preferences, public.friend_codes, public.friend_invites, public.friendships, public.user_blocks from anon, authenticated;

create or replace function public.social_is_student(target_id uuid)
returns boolean language sql stable security definer set search_path=public,pg_temp as $$
 select exists(select 1 from public.profiles where id=target_id and role::text in ('student','learner'));
$$;

create or replace function public.social_is_enabled(target_id uuid)
returns boolean language sql stable security definer set search_path=public,pg_temp as $$
 select coalesce((select social_enabled from public.social_preferences where student_id=target_id),false);
$$;

create or replace function public.social_weekly_points(target_id uuid)
returns integer language sql stable security definer set search_path=public,pg_temp as $$
 with source as (
   select case
     when jsonb_typeof(to_jsonb(sd)->'state'->'history')='array' then to_jsonb(sd)->'state'->'history'
     when jsonb_typeof(to_jsonb(sd)->'learning_state'->'history')='array' then to_jsonb(sd)->'learning_state'->'history'
     else '[]'::jsonb end as history
   from public.student_data sd where sd.student_id=target_id
 ), answers as (
   select value as row from source cross join lateral jsonb_array_elements(history)
 )
 select (count(*) * 10)::integer from answers
 where coalesce(row->>'date','') ~ '^[0-9]+$'
   and to_timestamp((row->>'date')::numeric / 1000) >= date_trunc('week',now());
$$;

create or replace function public.set_child_social_preferences(target_student_id uuid, allow_social boolean, allow_leaderboard boolean)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if auth.uid() is null then raise exception 'You must be signed in'; end if;
 if not exists(select 1 from public.parent_student_links where parent_id=auth.uid() and student_id=target_student_id) then raise exception 'Not authorised for this student'; end if;
 insert into public.social_preferences(student_id,social_enabled,leaderboard_allowed,leaderboard_opt_in,updated_at)
 values(target_student_id,coalesce(allow_social,false),coalesce(allow_social,false) and coalesce(allow_leaderboard,false),false,now())
 on conflict(student_id) do update set
   social_enabled=excluded.social_enabled,
   leaderboard_allowed=excluded.leaderboard_allowed,
   leaderboard_opt_in=case when excluded.leaderboard_allowed then public.social_preferences.leaderboard_opt_in else false end,
   updated_at=now();
end $$;

create or replace function public.get_parent_social_preferences()
returns table(student_id uuid,display_name text,avatar text,social_enabled boolean,leaderboard_allowed boolean,leaderboard_opt_in boolean)
language sql stable security definer set search_path=public,pg_temp as $$
 select l.student_id,p.display_name,p.avatar,coalesce(sp.social_enabled,false),coalesce(sp.leaderboard_allowed,false),coalesce(sp.leaderboard_opt_in,false)
 from public.parent_student_links l
 join public.profiles p on p.id=l.student_id
 left join public.social_preferences sp on sp.student_id=l.student_id
 where l.parent_id=auth.uid()
 order by p.display_name;
$$;

create or replace function public.set_my_leaderboard_opt_in(enabled boolean)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if not public.social_is_student(auth.uid()) then raise exception 'Student account required'; end if;
 insert into public.social_preferences(student_id,leaderboard_opt_in,updated_at) values(auth.uid(),false,now()) on conflict(student_id) do nothing;
 update public.social_preferences set leaderboard_opt_in=(coalesce(enabled,false) and social_enabled and leaderboard_allowed),updated_at=now() where student_id=auth.uid();
end $$;

create or replace function public.generate_friend_code()
returns text language plpgsql security definer set search_path=public,pg_temp as $$
declare new_code text;
begin
 if not public.social_is_student(auth.uid()) then raise exception 'Student account required'; end if;
 if not public.social_is_enabled(auth.uid()) then raise exception 'A linked parent/carer must enable Friends first'; end if;
 update public.friend_codes set expires_at=now() where student_id=auth.uid() and used_at is null and expires_at>now();
 loop
   new_code:=upper(substr(md5(gen_random_uuid()::text||clock_timestamp()::text),1,8));
   exit when not exists(select 1 from public.friend_codes where code=new_code);
 end loop;
 insert into public.friend_codes(student_id,code) values(auth.uid(),new_code);
 return new_code;
end $$;

create or replace function public.redeem_friend_code(entered_code text)
returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare target_id uuid; invite_id uuid;
begin
 if not public.social_is_student(auth.uid()) then raise exception 'Student account required'; end if;
 if not public.social_is_enabled(auth.uid()) then raise exception 'A linked parent/carer must enable Friends first'; end if;
 select student_id into target_id from public.friend_codes where code=upper(trim(entered_code)) and used_at is null and expires_at>now() for update;
 if target_id is null then raise exception 'Friend code is invalid or expired'; end if;
 if target_id=auth.uid() then raise exception 'You cannot add yourself'; end if;
 if not public.social_is_enabled(target_id) then raise exception 'That student is not available for Friends'; end if;
 if exists(select 1 from public.user_blocks where (blocker_id=auth.uid() and blocked_id=target_id) or (blocker_id=target_id and blocked_id=auth.uid())) then raise exception 'Friend request unavailable'; end if;
 if exists(select 1 from public.friendships where student_low=least(auth.uid(),target_id) and student_high=greatest(auth.uid(),target_id)) then raise exception 'You are already friends'; end if;
 if exists(select 1 from public.friend_invites where status='pending' and ((sender_id=auth.uid() and receiver_id=target_id) or (sender_id=target_id and receiver_id=auth.uid()))) then raise exception 'A friend request is already pending'; end if;
 insert into public.friend_invites(sender_id,receiver_id) values(auth.uid(),target_id)
 on conflict(sender_id,receiver_id) do update set status='pending',created_at=now(),responded_at=null returning id into invite_id;
 update public.friend_codes set used_by=auth.uid(),used_at=now() where code=upper(trim(entered_code));
 return invite_id;
end $$;

create or replace function public.respond_friend_invite(target_invite_id uuid, accept_invite boolean)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare sender uuid; receiver uuid;
begin
 select sender_id,receiver_id into sender,receiver from public.friend_invites where id=target_invite_id and receiver_id=auth.uid() and status='pending' for update;
 if sender is null then raise exception 'Friend request not found'; end if;
 if coalesce(accept_invite,false) then
   if not public.social_is_enabled(sender) or not public.social_is_enabled(receiver) then raise exception 'Friends access is not enabled for both students'; end if;
   if exists(select 1 from public.user_blocks where (blocker_id=sender and blocked_id=receiver) or (blocker_id=receiver and blocked_id=sender)) then raise exception 'Friend request unavailable'; end if;
   insert into public.friendships(student_low,student_high) values(least(sender,receiver),greatest(sender,receiver)) on conflict do nothing;
   update public.friend_invites set status='accepted',responded_at=now() where id=target_invite_id;
 else
   update public.friend_invites set status='declined',responded_at=now() where id=target_invite_id;
 end if;
end $$;

create or replace function public.remove_friend(target_student_id uuid)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 delete from public.friendships where student_low=least(auth.uid(),target_student_id) and student_high=greatest(auth.uid(),target_student_id);
end $$;

create or replace function public.block_student(target_student_id uuid)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if target_student_id is null or target_student_id=auth.uid() then raise exception 'Invalid student'; end if;
 insert into public.user_blocks(blocker_id,blocked_id) values(auth.uid(),target_student_id) on conflict do nothing;
 delete from public.friendships where student_low=least(auth.uid(),target_student_id) and student_high=greatest(auth.uid(),target_student_id);
 update public.friend_invites set status='cancelled',responded_at=now() where status='pending' and ((sender_id=auth.uid() and receiver_id=target_student_id) or (sender_id=target_student_id and receiver_id=auth.uid()));
end $$;

create or replace function public.unblock_student(target_student_id uuid)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 delete from public.user_blocks where blocker_id=auth.uid() and blocked_id=target_student_id;
end $$;

create or replace function public.get_my_social_dashboard()
returns jsonb language plpgsql stable security definer set search_path=public,pg_temp as $$
declare me uuid:=auth.uid(); pref public.social_preferences%rowtype; result jsonb;
begin
 if not public.social_is_student(me) then raise exception 'Student account required'; end if;
 select * into pref from public.social_preferences where student_id=me;
 select jsonb_build_object(
   'social_enabled',coalesce(pref.social_enabled,false),
   'leaderboard_allowed',coalesce(pref.leaderboard_allowed,false),
   'leaderboard_opt_in',coalesce(pref.leaderboard_opt_in,false),
   'parent_controlled',exists(select 1 from public.parent_student_links where student_id=me),
   'incoming',coalesce((select jsonb_agg(x order by x->>'created_at' desc) from (
      select jsonb_build_object('invite_id',fi.id,'student_id',fi.sender_id,'display_name',p.display_name,'avatar',coalesce(p.avatar,'🎓'),'created_at',fi.created_at) x
      from public.friend_invites fi join public.profiles p on p.id=fi.sender_id where fi.receiver_id=me and fi.status='pending') q),'[]'::jsonb),
   'outgoing',coalesce((select jsonb_agg(x order by x->>'created_at' desc) from (
      select jsonb_build_object('invite_id',fi.id,'student_id',fi.receiver_id,'display_name',p.display_name,'avatar',coalesce(p.avatar,'🎓'),'created_at',fi.created_at) x
      from public.friend_invites fi join public.profiles p on p.id=fi.receiver_id where fi.sender_id=me and fi.status='pending') q),'[]'::jsonb),
   'friends',coalesce((select jsonb_agg(x order by x->>'display_name') from (
      select jsonb_build_object('student_id',p.id,'display_name',p.display_name,'avatar',coalesce(p.avatar,'🎓')) x
      from public.friendships f join public.profiles p on p.id=case when f.student_low=me then f.student_high else f.student_low end
      where f.student_low=me or f.student_high=me) q),'[]'::jsonb),
   'blocked',coalesce((select jsonb_agg(x order by x->>'display_name') from (
      select jsonb_build_object('student_id',p.id,'display_name',p.display_name,'avatar',coalesce(p.avatar,'🎓')) x
      from public.user_blocks b join public.profiles p on p.id=b.blocked_id where b.blocker_id=me) q),'[]'::jsonb),
   'leaderboard',case when coalesce(pref.social_enabled,false) and coalesce(pref.leaderboard_allowed,false) and coalesce(pref.leaderboard_opt_in,false) then
     coalesce((select jsonb_agg(x order by (x->>'weekly_points')::integer desc,x->>'display_name') from (
       select jsonb_build_object('student_id',p.id,'display_name',p.display_name,'avatar',coalesce(p.avatar,'🎓'),'weekly_points',public.social_weekly_points(p.id),'is_me',p.id=me) x
       from public.profiles p join public.social_preferences sp on sp.student_id=p.id
       where sp.social_enabled and sp.leaderboard_allowed and sp.leaderboard_opt_in and
         (p.id=me or exists(select 1 from public.friendships f where (f.student_low=least(me,p.id) and f.student_high=greatest(me,p.id))))
         and not exists(select 1 from public.user_blocks b where (b.blocker_id=me and b.blocked_id=p.id) or (b.blocker_id=p.id and b.blocked_id=me))
     ) q),'[]'::jsonb) else '[]'::jsonb end
 ) into result;
 return result;
end $$;

revoke all on function public.social_is_student(uuid),public.social_is_enabled(uuid),public.social_weekly_points(uuid) from public;
revoke all on function public.set_child_social_preferences(uuid,boolean,boolean),public.get_parent_social_preferences(),public.set_my_leaderboard_opt_in(boolean),public.generate_friend_code(),public.redeem_friend_code(text),public.respond_friend_invite(uuid,boolean),public.remove_friend(uuid),public.block_student(uuid),public.unblock_student(uuid),public.get_my_social_dashboard() from public;

grant execute on function public.set_child_social_preferences(uuid,boolean,boolean),public.get_parent_social_preferences(),public.set_my_leaderboard_opt_in(boolean),public.generate_friend_code(),public.redeem_friend_code(text),public.respond_friend_invite(uuid,boolean),public.remove_friend(uuid),public.block_student(uuid),public.unblock_student(uuid),public.get_my_social_dashboard() to authenticated;

commit;
