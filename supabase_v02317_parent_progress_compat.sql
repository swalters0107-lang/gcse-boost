-- LevelUp10 V0.23.1.8 — Parent progress compatibility fix
-- Run after the existing parent_link_codes / parent_student_links setup.
-- This does NOT create a second relationship model.

begin;

create or replace function public.get_parent_student_summaries()
returns table (
  student_id uuid,
  display_name text,
  avatar text,
  xp integer,
  streak integer,
  state jsonb,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'You must be signed in';
  end if;

  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'parent'::account_role
  ) then
    raise exception 'Only parent/carer accounts can view linked student progress';
  end if;

  return query
  select
    l.student_id,
    p.display_name,
    p.avatar,
    coalesce(sd.xp, 0)::integer,
    coalesce(sd.streak, 0)::integer,
    (
      coalesce(to_jsonb(sd)->'state', '{}'::jsonb)
      ||
      case
        when jsonb_typeof(to_jsonb(sd)->'learning_state') = 'object'
             and not (coalesce(to_jsonb(sd)->'state','{}'::jsonb) ? 'history')
        then coalesce(to_jsonb(sd)->'learning_state','{}'::jsonb)
        else '{}'::jsonb
      end
    ),
    sd.updated_at
  from public.parent_student_links l
  join public.profiles p on p.id = l.student_id
  left join public.student_data sd on sd.student_id = l.student_id
  where l.parent_id = auth.uid()
  order by p.display_name;
end;
$$;

revoke all on function public.get_parent_student_summaries() from public;
grant execute on function public.get_parent_student_summaries() to authenticated;

commit;
