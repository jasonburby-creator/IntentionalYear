-- Migration 002: redesign updates
-- Run this in Supabase SQL Editor.

-- Add mantra column to planners
alter table planners add column if not exists mantra text default '';

-- Rename default title for any planner still set to the old default
update planners set title = 'INTENTIONAL YEAR' where title = 'LIVE YOUR ADVENTURE';

-- Rename "Kevin's Rule" category to "6x Rule" wherever it still exists
update categories set name = '6x Rule' where name in ('"Kevin''s Rule"', 'Kevin''s Rule');
