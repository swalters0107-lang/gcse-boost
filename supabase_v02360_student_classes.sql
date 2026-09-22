-- LevelUp10 V0.23.6.0 — student-visible class memberships
-- Read-only RPC: a signed-in student can see only classes they have joined.
create or replace function public.get_student_classes()
returns table (
  class_id uuid,
  class_name text,
  subject text,
  teacher_name text,
  joined_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.id as class_id,
    c.class_name,
    c.subject,
    coalesce(tp.display_name, 'Teacher') as teacher_name,
    cm.joined_at
  from public.class_memberships cm
  join public.classes c on c.id = cm.class_id
  left join public.profiles tp on tp.id = c.teacher_id
  where cm.student_id = auth.uid()
    and exists (
      select 1 from public.profiles me
      where me.id = auth.uid()
        and me.role = 'student'::public.account_role
    )
  order by cm.joined_at desc, c.class_name;
$$;

revoke all on function public.get_student_classes() from public;
grant execute on function public.get_student_classes() to authenticated;
