export type Planner = {
  id: string;
  user_id: string;
  year: number;
  title: string;
  owner_name: string;
  mantra: string;
  share_token: string | null;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  planner_id: string;
  name: string;
  color: string;
  text_color: string;
  description: string;
  items: string[];
  sort_order: number;
  is_core?: boolean;
};

export type Entry = {
  id: string;
  planner_id: string;
  category_id: string | null;
  label: string;
  month: number;     // 0-11
  start_day: number; // 1-31
  end_day: number;   // 1-31
};

// Core categories are the load-bearing pillars of the framework.
// Their NAME and DESCRIPTION cannot be edited (color and items can).
// They also cannot be deleted.
export const CORE_CATEGORY_NAMES = ['Misogi', 'Explore 6x', 'Habits'];

export function isCoreCategory(cat: Pick<Category, 'name'> | null | undefined): boolean {
  if (!cat) return false;
  return CORE_CATEGORY_NAMES.includes(cat.name);
}

// Field Guide palette — warm, earthy, grown-up. Print-friendly.
export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'planner_id'>[] = [
  { name: 'Misogi',          color: '#7c5cb0', text_color: '#ffffff', description: 'One year-defining challenge. Hard enough that you\'re not sure you can do it. The thing the year is built around.', items: [], sort_order: 0 },
  { name: 'Explore 6x',      color: '#c2553c', text_color: '#ffffff', description: 'Six times this year, do something you wouldn\'t normally do. Roughly one every other month. Single days, weekends, experiments.', items: [], sort_order: 1 },
  { name: 'Mini Adventures', color: '#3d6b87', text_color: '#ffffff', description: 'Trips, getaways, weekend pilgrimages.', items: [], sort_order: 2 },
  { name: 'Habits',          color: '#b88a3f', text_color: '#ffffff', description: 'One new habit per quarter. Not twelve at once. Stack them slowly, let each one become automatic before adding the next.', items: [], sort_order: 3 },
  { name: 'Biz Trips',       color: '#5b7a3a', text_color: '#ffffff', description: 'Block work-related travel to see how it lays out across the year and stay in balance.', items: [], sort_order: 4 },
  { name: 'Daily Vitamins',  color: '#6b6258', text_color: '#ffffff', description: 'Small daily practices that compound. The unglamorous stuff that builds the foundation.', items: [], sort_order: 5 },
];

export const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
export const MONTHS_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}
