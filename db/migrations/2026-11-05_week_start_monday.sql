-- Move week keys saved on a Sunday to the Monday they actually meant.
--
-- Until 2026-11 the app derived `week_start` with `toISOString()`. For users east
-- of UTC (e.g. Moscow) local Monday 00:00 is still Sunday in UTC, so their menus
-- and shopping lists were stored under the Sunday *before* the week. The app now
-- sends local Mondays (and the API normalises any Sunday it still receives), so
-- these rows must move by one day or they disappear from the app — and the cron
-- reminders, which always looked for Mondays, never saw them.
--
-- Works whether `week_start` is a `date` or a `text` column. Run once, in the
-- Supabase SQL editor. Check first:
--
--   select 'schedules' as t, count(*) from schedules
--    where extract(isodow from week_start::date) = 7
--   union all
--   select 'shopping_list_items', count(*) from shopping_list_items
--    where extract(isodow from week_start::date) = 7;

begin;

-- If a week has both a legacy Sunday row and a Monday row, the Monday one was
-- written by a newer client: keep it, drop the stale Sunday copy.
delete from schedules legacy
using schedules monday
where extract(isodow from legacy.week_start::date) = 7
  and monday.week_start::date = legacy.week_start::date + 1;

update schedules
set week_start = week_start::date + 1
where extract(isodow from week_start::date) = 7;

-- Shopping items have no per-week uniqueness: just move them.
update shopping_list_items
set week_start = week_start::date + 1
where week_start is not null
  and extract(isodow from week_start::date) = 7;

commit;
