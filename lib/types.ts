export type Planner = {
  id: string;
  user_id: string;
  year: number;
  title: string;
  owner_name: string;
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

export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'planner_id'>[] = [
  { name: 'Misogi', color: '#c4b5fd', text_color: '#2e1065', description: 'Taking on ONE challenge that sets the tone for your entire year. Lock in on a year-defining event.', items: [], sort_order: 0 },
  { name: '"Kevin\'s Rule"', color: '#fca5a5', text_color: '#7f1d1d', description: 'One day every other month, do something that you normally wouldn\'t do. Add 6 new adventures this year.', items: [], sort_order: 1 },
  { name: 'Mini Adventures', color: '#93c5fd', text_color: '#1e3a8a', description: 'Trips, adventures, getaways, etc.', items: [], sort_order: 2 },
  { name: '2026 Habits', color: '#fde68a', text_color: '#78350f', description: 'Add a new winning habit every quarter (improve your health, mindset, relationships, work, and your life).', items: [], sort_order: 3 },
  { name: '"Biz" Trips', color: '#86efac', text_color: '#14532d', description: 'Blocking out work-related travel to see how it lays out through the year to ensure balance.', items: [], sort_order: 4 },
  { name: 'Daily Vitamins', color: '#d1d5db', text_color: '#1f2937', description: 'Aim to do 2-3+ vitamin items each day that support more overall health and wellbeing.', items: [], sort_order: 5 },
];

export const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

export function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}
