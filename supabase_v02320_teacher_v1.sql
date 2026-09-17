-- LevelUp10 V0.23.2.0 — Teacher V1
-- Run once in Supabase SQL Editor.

create or replace function public.get_teacher_classes()
returns table(id uuid, name text, student_count bigint)
language sql stable security definer set search_path=public
as $$
  select c.id, c.name, count(cm.id)
  from public.classes c
  left join public.class_memberships cm on cm.class_id=c.id
  where c.teacher_id=auth.uid()
    and exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='teacher'::public.account_role)
  group by c.id,c.name
  order by c.name;
$$;

create or replace function public.create_teacher_class(class_name text)
returns uuid
language plpgsql security definer set search_path=public
as $$
declare new_id uuid;
begin
  if auth.uid() is null then raise exception 'You must be signed in'; end if;
  if not exists(select 1 from public.profiles where id=auth.uid() and role='teacher'::public.account_role)
    then raise exception 'Only teacher accounts can create classes'; end if;
  if nullif(trim(class_name),'') is null then raise exception 'Enter a class name'; end if;
  insert into public.classes(teacher_id,name) values(auth.uid(),left(trim(class_name),80)) returning id into new_id;
  return new_id;
end;
$$;

create or replace function public.get_or_create_class_join_code(target_class_id uuid)
returns text
language plpgsql security definer set search_path=public
as $$
declare result_code text;
begin
  if not exists(select 1 from public.classes where id=target_class_id and teacher_id=auth.uid())
    then raise exception 'Class not found'; end if;
  select code into result_code from public.class_join_codes
   where class_id=target_class_id and active=true and (expires_at is null or expires_at>now())
   order by created_at desc limit 1;
  if result_code is null then
    loop
      result_code:=upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));
      exit when not exists(select 1 from public.class_join_codes where upper(code)=result_code);
    end loop;
    insert into public.class_join_codes(class_id,code,active,expires_at)
      values(target_class_id,result_code,true,now()+interval '30 days');
  end if;
  return result_code;
end;
$$;

create or replace function public.get_teacher_class_students(target_class_id uuid)
returns table(student_id uuid, display_name text, avatar text, xp integer, streak integer, updated_at timestamptz, state jsonb)
language sql stable security definer set search_path=public
as $$
  select p.id,p.display_name,p.avatar,coalesce(sd.xp,0)::integer,coalesce(sd.streak,0)::integer,sd.updated_at,coalesce(sd.state,'{}'::jsonb)
  from public.classes c
  join public.class_memberships cm on cm.class_id=c.id
  join public.profiles p on p.id=cm.student_id and p.role='student'::public.account_role
  left join public.student_data sd on sd.student_id=p.id
  where c.id=target_class_id and c.teacher_id=auth.uid()
    and exists(select 1 from public.profiles tp where tp.id=auth.uid() and tp.role='teacher'::public.account_role)
  order by p.display_name;
$$;

revoke all on function public.get_teacher_classes() from public;
revoke all on function public.create_teacher_class(text) from public;
revoke all on function public.get_or_create_class_join_code(uuid) from public;
revoke all on function public.get_teacher_class_students(uuid) from public;
grant execute on function public.get_teacher_classes() to authenticated;
grant execute on function public.create_teacher_class(text) to authenticated;
grant execute on function public.get_or_create_class_join_code(uuid) to authenticated;
grant execute on function public.get_teacher_class_students(uuid) to authenticated;
