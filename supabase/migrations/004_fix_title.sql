-- Migration 004: clean up existing planner titles
-- Run this in Supabase SQL Editor to rename any old "LIVE YOUR ADVENTURE" titles
-- to "INTENTIONAL YEAR" on existing planners.

update planners
set title = 'INTENTIONAL YEAR'
where title in ('LIVE YOUR ADVENTURE', 'Live Your Adventure', 'live your adventure');

-- That's it. Your existing planner will now show the correct branding.
