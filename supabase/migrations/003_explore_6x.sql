-- Migration 003: rename "6x Rule" to "Explore 6x" on existing categories
-- Run this in Supabase SQL Editor.

update categories set name = 'Explore 6x' where name in ('6x Rule', '"Kevin''s Rule"', 'Kevin''s Rule');
