-- LevelUp10 V0.23.7.0 — class lessons / assignments
create table if not exists public.class_lessons (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  title text not null,
  topic text not null default 'All',
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.class_lessons enable row level security;

drop policy if exists "Teachers manage own class lessons" on public.class_lessons;
create policy "Teachers manage own class lessons" on public.class_lessons
for all to authenticated
using (exists(select 1 from public.classes c where c.id=class_lessons.class_id and c.teacher_id=auth.uid()))
with check (exists(select 1 from public.classes c where c.id=class_lessons.class_id and c.teacher_id=auth.uid()));

drop policy if exists "Students read joined class lessons" on public.class_lessons;
create policy "Students read joined class lessons" on public.class_lessons
for select to authenticated
using (exists(select 1 from public.class_memberships cm where cm.class_id=class_lessons.class_id and cm.student_id=auth.uid()));

create or replace function public.get_student_class_lessons()
returns table(class_id uuid,class_name text,subject text,teacher_name text,joined_at timestamptz,lesson_id uuid,lesson_title text,lesson_topic text)
language sql stable security definer set search_path=public as $$
 select c.id,c.class_name,c.subject,coalesce(tp.display_name,'Teacher'),cm.joined_at,
        l.id,l.title,l.topic
 from public.class_memberships cm
 join public.classes c on c.id=cm.class_id
 left join public.profiles tp on tp.id=c.teacher_id
 left join lateral (
   select cl.id,cl.title,cl.topic from public.class_lessons cl
   where cl.class_id=c.id and cl.active=true order by cl.created_at desc limit 1
 ) l on true
 where cm.student_id=auth.uid()
 order by cm.joined_at desc,c.class_name;
$$;
revoke all on function public.get_student_class_lessons() from public;
grant execute on function public.get_student_class_lessons() to authenticated;

create or replace function public.get_teacher_class_lesson(target_class_id uuid)
returns table(lesson_id uuid,lesson_title text,lesson_topic text)
language sql stable security definer set search_path=public as $$
 select cl.id,cl.title,cl.topic from public.class_lessons cl
 join public.classes c on c.id=cl.class_id
 where cl.class_id=target_class_id and c.teacher_id=auth.uid() and cl.active=true
 order by cl.created_at desc limit 1;
$$;
revoke all on function public.get_teacher_class_lesson(uuid) from public;
grant execute on function public.get_teacher_class_lesson(uuid) to authenticated;

create or replace function public.set_teacher_class_lesson(target_class_id uuid, lesson_title text, lesson_topic text default 'All')
returns uuid language plpgsql security definer set search_path=public as $$
declare new_id uuid;
begin
 if not exists(select 1 from public.classes where id=target_class_id and teacher_id=auth.uid()) then raise exception 'Not authorised'; end if;
 if nullif(trim(lesson_title),'') is null then raise exception 'Lesson title is required'; end if;
 update public.class_lessons set active=false where class_id=target_class_id and active=true;
 insert into public.class_lessons(class_id,title,topic) values(target_class_id,trim(lesson_title),coalesce(nullif(trim(lesson_topic),''),'All')) returning id into new_id;
 return new_id;
end $$;
revoke all on function public.set_teacher_class_lesson(uuid,text,text) from public;
grant execute on function public.set_teacher_class_lesson(uuid,text,text) to authenticated;
