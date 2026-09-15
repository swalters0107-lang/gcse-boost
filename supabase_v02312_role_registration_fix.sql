-- LevelUp10 V0.23.1.2
-- Persist the account type selected during Supabase Auth sign-up.
-- Safe roles are limited to the existing account_role enum values.

create or replace function public.prevent_profile_role_change()
returns trigger
language plpgsql
set search_path to 'public'
as $function$
begin
  -- Normal signed-in users must never be able to promote/change their own role.
  -- Backend auth trigger work runs without an end-user auth.uid(), allowing the
  -- role chosen at account creation to be applied once during signup.
  if old.role is distinct from new.role and auth.uid() is not null then
    raise exception 'Account role cannot be changed by the user';
  end if;
  return new;
end;
$function$;

create or replace function public.levelup10_apply_signup_role()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  requested text;
begin
  requested := lower(coalesce(new.raw_user_meta_data ->> 'requested_role', 'student'));

  if requested not in ('student', 'parent', 'teacher') then
    requested := 'student';
  end if;

  -- The existing profile-creation trigger runs first in the current LevelUp10
  -- setup. This trigger is deliberately named with z_ so it runs afterwards.
  update public.profiles
     set role = requested::public.account_role,
         updated_at = now()
   where id = new.id;

  return new;
end;
$function$;

-- Recreate only our role-application trigger; leave the existing profile
-- creation trigger untouched.
drop trigger if exists z_levelup10_apply_signup_role on auth.users;
create trigger z_levelup10_apply_signup_role
after insert on auth.users
for each row execute function public.levelup10_apply_signup_role();
