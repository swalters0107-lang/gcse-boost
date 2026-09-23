-- LevelUp10 V0.25.0 — Friend Battles MVP
-- Run once in Supabase SQL Editor after supabase_v02400_social_foundations.sql.
-- No auth.users trigger is created or changed.

begin;

create table if not exists public.friend_battles (
  id uuid primary key default gen_random_uuid(),
  challenger_id uuid not null references public.profiles(id) on delete cascade,
  opponent_id uuid not null references public.profiles(id) on delete cascade,
  subject text not null check (subject in ('Maths','English','Science')),
  category text not null default 'All',
  question_keys jsonb not null,
  status text not null default 'pending'
    check (status in ('pending','active','completed','declined','cancelled','expired')),
  winner_id uuid references public.profiles(id) on delete set null,
  is_draw boolean not null default false,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  completed_at timestamptz,
  check (challenger_id <> opponent_id),
  check (jsonb_typeof(question_keys) = 'array'),
  check (jsonb_array_length(question_keys) = 8),
  check (char_length(category) between 1 and 80)
);

create table if not exists public.friend_battle_attempts (
  battle_id uuid not null references public.friend_battles(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  answer_results jsonb,
  score integer check (score between 0 and 8),
  total integer not null default 8 check (total = 8),
  duration_seconds integer check (duration_seconds between 1 and 86400),
  reward_xp integer not null default 0 check (reward_xp between 0 and 25),
  reward_coins integer not null default 0 check (reward_coins between 0 and 20),
  reward_granted boolean not null default false,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  primary key (battle_id, student_id)
);

create index if not exists friend_battles_challenger_status_idx
  on public.friend_battles(challenger_id,status,created_at desc);
create index if not exists friend_battles_opponent_status_idx
  on public.friend_battles(opponent_id,status,created_at desc);
create index if not exists friend_battle_attempts_student_submitted_idx
  on public.friend_battle_attempts(student_id,submitted_at desc);

alter table public.friend_battles enable row level security;
alter table public.friend_battle_attempts enable row level security;

-- Battles are RPC-only. The browser cannot insert, update or read battle rows directly.
revoke all on public.friend_battles, public.friend_battle_attempts from anon, authenticated;

-- Preserve the existing parent-controlled safety switch and close unfinished
-- battles immediately if a parent/carer disables Friends.
create or replace function public.set_child_social_preferences(target_student_id uuid, allow_social boolean, allow_leaderboard boolean)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
  if auth.uid() is null then raise exception 'You must be signed in'; end if;
  if not exists(select 1 from public.parent_student_links where parent_id=auth.uid() and student_id=target_student_id) then
    raise exception 'Not authorised for this student';
  end if;
  insert into public.social_preferences(student_id,social_enabled,leaderboard_allowed,leaderboard_opt_in,updated_at)
  values(target_student_id,coalesce(allow_social,false),coalesce(allow_social,false) and coalesce(allow_leaderboard,false),false,now())
  on conflict(student_id) do update set
    social_enabled=excluded.social_enabled,
    leaderboard_allowed=excluded.leaderboard_allowed,
    leaderboard_opt_in=case when excluded.leaderboard_allowed then public.social_preferences.leaderboard_opt_in else false end,
    updated_at=now();
  if not coalesce(allow_social,false) then
    update public.friend_battles set status='cancelled',completed_at=now()
    where status in ('pending','active')
      and (challenger_id=target_student_id or opponent_id=target_student_id);
  end if;
end;
$$;

create or replace function public.battle_is_friend(first_student uuid, second_student uuid)
returns boolean
language sql stable security definer set search_path=public,pg_temp as $$
  select exists(
    select 1 from public.friendships f
    where f.student_low=least(first_student,second_student)
      and f.student_high=greatest(first_student,second_student)
  ) and not exists(
    select 1 from public.user_blocks b
    where (b.blocker_id=first_student and b.blocked_id=second_student)
       or (b.blocker_id=second_student and b.blocked_id=first_student)
  );
$$;

create or replace function public.create_friend_battle(
  target_student_id uuid,
  battle_subject text,
  battle_category text,
  battle_question_keys jsonb
)
returns uuid
language plpgsql security definer set search_path=public,pg_temp as $$
declare
  me uuid:=auth.uid();
  new_id uuid;
  key_count integer;
  distinct_count integer;
begin
  if me is null or not public.social_is_student(me) then
    raise exception 'Student account required';
  end if;
  if not public.social_is_enabled(me) or not public.social_is_enabled(target_student_id) then
    raise exception 'Friends must be enabled for both students';
  end if;
  if target_student_id is null or target_student_id=me then
    raise exception 'Choose a valid friend';
  end if;
  if not public.battle_is_friend(me,target_student_id) then
    raise exception 'Battles can only be sent to an accepted friend';
  end if;
  if battle_subject not in ('Maths','English','Science') then
    raise exception 'Choose Maths, English or Science';
  end if;
  battle_category:=trim(coalesce(battle_category,'All'));
  if char_length(battle_category) not between 1 and 80 then
    raise exception 'Invalid battle topic';
  end if;
  if jsonb_typeof(battle_question_keys)<>'array' or jsonb_array_length(battle_question_keys)<>8 then
    raise exception 'A battle must contain exactly 8 questions';
  end if;
  select count(*),count(distinct value)
    into key_count,distinct_count
  from jsonb_array_elements_text(battle_question_keys);
  if key_count<>8 or distinct_count<>8 or exists(
    select 1 from jsonb_array_elements_text(battle_question_keys) q(value)
    where char_length(value)<8 or char_length(value)>500
  ) then
    raise exception 'Battle questions are invalid';
  end if;
  if (select count(*) from public.friend_battles
      where challenger_id=me and status in ('pending','active') and expires_at>now())>=5 then
    raise exception 'Finish or cancel an existing battle before creating another';
  end if;
  if exists(
    select 1 from public.friend_battles
    where status in ('pending','active') and expires_at>now()
      and ((challenger_id=me and opponent_id=target_student_id)
        or (challenger_id=target_student_id and opponent_id=me))
  ) then
    raise exception 'You already have an open battle with this friend';
  end if;

  insert into public.friend_battles(challenger_id,opponent_id,subject,category,question_keys)
  values(me,target_student_id,battle_subject,battle_category,battle_question_keys)
  returning id into new_id;
  return new_id;
end;
$$;

create or replace function public.respond_friend_battle(target_battle_id uuid, accept_battle boolean)
returns void
language plpgsql security definer set search_path=public,pg_temp as $$
declare
  row public.friend_battles%rowtype;
begin
  select * into row from public.friend_battles
  where id=target_battle_id and opponent_id=auth.uid() and status='pending'
  for update;
  if row.id is null then raise exception 'Battle invitation not found'; end if;
  if row.expires_at<=now() then
    update public.friend_battles set status='expired' where id=row.id;
    raise exception 'This battle invitation has expired';
  end if;
  if not coalesce(accept_battle,false) then
    update public.friend_battles set status='declined',completed_at=now() where id=row.id;
    return;
  end if;
  if not public.social_is_enabled(row.challenger_id)
     or not public.social_is_enabled(row.opponent_id)
     or not public.battle_is_friend(row.challenger_id,row.opponent_id) then
    raise exception 'This battle is no longer available';
  end if;
  update public.friend_battles set status='active',accepted_at=now() where id=row.id;
end;
$$;

create or replace function public.cancel_friend_battle(target_battle_id uuid)
returns void
language plpgsql security definer set search_path=public,pg_temp as $$
begin
  update public.friend_battles b set status='cancelled',completed_at=now()
  where b.id=target_battle_id
    and (b.challenger_id=auth.uid() or b.opponent_id=auth.uid())
    and b.status in ('pending','active')
    and not exists(
      select 1 from public.friend_battle_attempts a
      where a.battle_id=b.id and a.submitted_at is not null
    );
  if not found then raise exception 'This battle cannot be cancelled'; end if;
end;
$$;

create or replace function public.start_friend_battle(target_battle_id uuid)
returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare
  me uuid:=auth.uid();
  row public.friend_battles%rowtype;
  other_id uuid;
  other_name text;
  other_avatar text;
  attempt public.friend_battle_attempts%rowtype;
begin
  select * into row from public.friend_battles
  where id=target_battle_id and (challenger_id=me or opponent_id=me)
  for update;
  if row.id is null then raise exception 'Battle not found'; end if;
  if row.expires_at<=now() and row.status in ('pending','active') then
    update public.friend_battles set status='expired' where id=row.id;
    raise exception 'This battle has expired';
  end if;
  if row.status<>'active' then raise exception 'This battle is not ready to play'; end if;
  if not public.social_is_enabled(me)
     or not public.battle_is_friend(row.challenger_id,row.opponent_id) then
    raise exception 'This battle is no longer available';
  end if;

  insert into public.friend_battle_attempts(battle_id,student_id)
  values(row.id,me) on conflict(battle_id,student_id) do nothing;
  select * into attempt from public.friend_battle_attempts
  where battle_id=row.id and student_id=me;
  if attempt.submitted_at is not null then raise exception 'You have already completed this battle'; end if;

  other_id:=case when row.challenger_id=me then row.opponent_id else row.challenger_id end;
  select p.display_name,coalesce(p.avatar,'🎓') into other_name,other_avatar
  from public.profiles p where p.id=other_id;

  return jsonb_build_object(
    'battle_id',row.id,
    'subject',row.subject,
    'category',row.category,
    'question_keys',row.question_keys,
    'opponent_id',other_id,
    'opponent_name',coalesce(other_name,'Friend'),
    'opponent_avatar',coalesce(other_avatar,'🎓'),
    'started_at',attempt.started_at
  );
end;
$$;

create or replace function public.complete_friend_battle(target_battle_id uuid, submitted_results jsonb)
returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare
  me uuid:=auth.uid();
  row public.friend_battles%rowtype;
  my_attempt public.friend_battle_attempts%rowtype;
  their_attempt public.friend_battle_attempts%rowtype;
  other_id uuid;
  calculated_score integer;
  elapsed integer;
  daily_rewards integer;
  give_reward boolean:=false;
  decided_winner uuid:=null;
  draw_result boolean:=false;
  outcome text:='waiting';
begin
  select * into row from public.friend_battles
  where id=target_battle_id and status='active'
    and (challenger_id=me or opponent_id=me)
  for update;
  if row.id is null then raise exception 'Active battle not found'; end if;
  if jsonb_typeof(submitted_results)<>'array' or jsonb_array_length(submitted_results)<>8
     or exists(select 1 from jsonb_array_elements(submitted_results) as x(value) where jsonb_typeof(value)<>'boolean') then
    raise exception 'Eight answer results are required';
  end if;
  select * into my_attempt from public.friend_battle_attempts
  where battle_id=row.id and student_id=me for update;
  if my_attempt.battle_id is null then raise exception 'Start the battle before submitting it'; end if;
  if my_attempt.submitted_at is not null then raise exception 'This battle has already been submitted'; end if;

  select count(*)::integer into calculated_score
  from jsonb_array_elements(submitted_results) as x(value) where value::text='true';
  elapsed:=greatest(1,least(86400,floor(extract(epoch from (now()-my_attempt.started_at)))::integer));
  select count(*)::integer into daily_rewards from public.friend_battle_attempts
  where student_id=me and reward_granted and submitted_at>=date_trunc('day',now());
  give_reward:=daily_rewards<3;

  update public.friend_battle_attempts set
    answer_results=submitted_results,
    score=calculated_score,
    duration_seconds=elapsed,
    reward_xp=case when give_reward then 25 else 0 end,
    reward_coins=case when give_reward then 20 else 0 end,
    reward_granted=give_reward,
    submitted_at=now()
  where battle_id=row.id and student_id=me;

  other_id:=case when row.challenger_id=me then row.opponent_id else row.challenger_id end;
  select * into their_attempt from public.friend_battle_attempts
  where battle_id=row.id and student_id=other_id;

  if their_attempt.submitted_at is not null then
    if calculated_score>their_attempt.score then decided_winner:=me;
    elsif calculated_score<their_attempt.score then decided_winner:=other_id;
    elsif elapsed<their_attempt.duration_seconds then decided_winner:=me;
    elsif elapsed>their_attempt.duration_seconds then decided_winner:=other_id;
    else draw_result:=true;
    end if;
    update public.friend_battles set status='completed',winner_id=decided_winner,
      is_draw=draw_result,completed_at=now() where id=row.id;
    outcome:=case when draw_result then 'draw' when decided_winner=me then 'won' else 'lost' end;
  end if;

  return jsonb_build_object(
    'battle_id',row.id,
    'score',calculated_score,
    'total',8,
    'duration_seconds',elapsed,
    'opponent_submitted',their_attempt.submitted_at is not null,
    'opponent_score',their_attempt.score,
    'outcome',outcome,
    'reward_xp',case when give_reward then 25 else 0 end,
    'reward_coins',case when give_reward then 20 else 0 end
  );
end;
$$;

create or replace function public.get_my_battle_dashboard()
returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare
  me uuid:=auth.uid();
  result jsonb;
begin
  if me is null or not public.social_is_student(me) then raise exception 'Student account required'; end if;
  update public.friend_battles set status='expired',completed_at=now()
  where status in ('pending','active') and expires_at<=now()
    and (challenger_id=me or opponent_id=me);

  select jsonb_build_object(
    'incoming',coalesce((select jsonb_agg(x order by x->>'created_at' desc) from (
      select jsonb_build_object('battle_id',b.id,'student_id',p.id,'display_name',p.display_name,
        'avatar',coalesce(p.avatar,'🎓'),'subject',b.subject,'category',b.category,'created_at',b.created_at) x
      from public.friend_battles b join public.profiles p on p.id=b.challenger_id
      where b.opponent_id=me and b.status='pending' and b.expires_at>now()) q),'[]'::jsonb),
    'outgoing',coalesce((select jsonb_agg(x order by x->>'created_at' desc) from (
      select jsonb_build_object('battle_id',b.id,'student_id',p.id,'display_name',p.display_name,
        'avatar',coalesce(p.avatar,'🎓'),'subject',b.subject,'category',b.category,'created_at',b.created_at) x
      from public.friend_battles b join public.profiles p on p.id=b.opponent_id
      where b.challenger_id=me and b.status='pending' and b.expires_at>now()) q),'[]'::jsonb),
    'active',coalesce((select jsonb_agg(x order by x->>'accepted_at' desc) from (
      select jsonb_build_object('battle_id',b.id,'student_id',p.id,'display_name',p.display_name,
        'avatar',coalesce(p.avatar,'🎓'),'subject',b.subject,'category',b.category,
        'accepted_at',b.accepted_at,'my_submitted',mine.submitted_at is not null,
        'my_score',mine.score,'opponent_submitted',theirs.submitted_at is not null) x
      from public.friend_battles b
      join public.profiles p on p.id=case when b.challenger_id=me then b.opponent_id else b.challenger_id end
      left join public.friend_battle_attempts mine on mine.battle_id=b.id and mine.student_id=me
      left join public.friend_battle_attempts theirs on theirs.battle_id=b.id and theirs.student_id=p.id
      where (b.challenger_id=me or b.opponent_id=me) and b.status='active' and b.expires_at>now()) q),'[]'::jsonb),
    'completed',coalesce((select jsonb_agg(x order by x->>'completed_at' desc) from (
      select jsonb_build_object('battle_id',b.id,'student_id',p.id,'display_name',p.display_name,
        'avatar',coalesce(p.avatar,'🎓'),'subject',b.subject,'category',b.category,
        'my_score',mine.score,'opponent_score',theirs.score,'my_seconds',mine.duration_seconds,
        'opponent_seconds',theirs.duration_seconds,'completed_at',b.completed_at,
        'outcome',case when b.is_draw then 'draw' when b.winner_id=me then 'won' else 'lost' end) x
      from public.friend_battles b
      join public.profiles p on p.id=case when b.challenger_id=me then b.opponent_id else b.challenger_id end
      join public.friend_battle_attempts mine on mine.battle_id=b.id and mine.student_id=me
      join public.friend_battle_attempts theirs on theirs.battle_id=b.id and theirs.student_id=p.id
      where (b.challenger_id=me or b.opponent_id=me) and b.status='completed'
      order by b.completed_at desc limit 12) q),'[]'::jsonb)
  ) into result;
  return result;
end;
$$;

-- Removing or blocking a friend also closes any unfinished battles between them.
create or replace function public.remove_friend(target_student_id uuid)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
  delete from public.friendships
  where student_low=least(auth.uid(),target_student_id)
    and student_high=greatest(auth.uid(),target_student_id);
  update public.friend_battles set status='cancelled',completed_at=now()
  where status in ('pending','active') and
    ((challenger_id=auth.uid() and opponent_id=target_student_id)
      or (challenger_id=target_student_id and opponent_id=auth.uid()));
end;
$$;

create or replace function public.block_student(target_student_id uuid)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
  if target_student_id is null or target_student_id=auth.uid() then raise exception 'Invalid student'; end if;
  insert into public.user_blocks(blocker_id,blocked_id)
  values(auth.uid(),target_student_id) on conflict do nothing;
  delete from public.friendships
  where student_low=least(auth.uid(),target_student_id)
    and student_high=greatest(auth.uid(),target_student_id);
  update public.friend_invites set status='cancelled',responded_at=now()
  where status='pending' and ((sender_id=auth.uid() and receiver_id=target_student_id)
    or (sender_id=target_student_id and receiver_id=auth.uid()));
  update public.friend_battles set status='cancelled',completed_at=now()
  where status in ('pending','active') and
    ((challenger_id=auth.uid() and opponent_id=target_student_id)
      or (challenger_id=target_student_id and opponent_id=auth.uid()));
end;
$$;

revoke all on function public.battle_is_friend(uuid,uuid) from public;
revoke all on function public.set_child_social_preferences(uuid,boolean,boolean) from public;
revoke all on function public.create_friend_battle(uuid,text,text,jsonb),
  public.respond_friend_battle(uuid,boolean),public.cancel_friend_battle(uuid),
  public.start_friend_battle(uuid),public.complete_friend_battle(uuid,jsonb),
  public.get_my_battle_dashboard() from public;

grant execute on function public.create_friend_battle(uuid,text,text,jsonb),
  public.respond_friend_battle(uuid,boolean),public.cancel_friend_battle(uuid),
  public.start_friend_battle(uuid),public.complete_friend_battle(uuid,jsonb),
  public.get_my_battle_dashboard() to authenticated;
grant execute on function public.set_child_social_preferences(uuid,boolean,boolean) to authenticated;

commit;
