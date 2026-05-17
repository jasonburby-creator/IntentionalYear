import { createClient } from '@/lib/supabase/server';
import { DEFAULT_CATEGORIES } from '@/lib/types';
import { redirect } from 'next/navigation';
import PlannerApp from '@/components/PlannerApp';

export default async function HomePage({ searchParams }: { searchParams: { year?: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const year = parseInt(searchParams.year || String(new Date().getFullYear()));

  // Get or create planner for this year
  let { data: planner } = await supabase
    .from('planners')
    .select('*')
    .eq('user_id', user.id)
    .eq('year', year)
    .maybeSingle();

  if (!planner) {
    const ownerName = (user.user_metadata?.full_name || user.email?.split('@')[0] || 'YOU').toUpperCase().split(' ')[0];
    const { data: created } = await supabase
      .from('planners')
      .insert({ user_id: user.id, year, owner_name: ownerName, title: 'INTENTIONAL YEAR', mantra: '' })
      .select('*')
      .single();
    planner = created;

    if (planner) {
      const rows = DEFAULT_CATEGORIES.map(c => ({ ...c, planner_id: planner!.id }));
      await supabase.from('categories').insert(rows);
    }
  }

  if (!planner) {
    return <div style={{ padding: 40 }}>Could not load planner. Check Supabase setup.</div>;
  }

  const [{ data: categories }, { data: entries }, { data: allPlanners }] = await Promise.all([
    supabase.from('categories').select('*').eq('planner_id', planner.id).order('sort_order'),
    supabase.from('entries').select('*').eq('planner_id', planner.id),
    supabase.from('planners').select('id, year').eq('user_id', user.id).order('year'),
  ]);

  return (
    <PlannerApp
      planner={planner}
      categories={categories || []}
      entries={entries || []}
      availableYears={(allPlanners || []).map(p => p.year)}
      userEmail={user.email || ''}
      readOnly={false}
    />
  );
}
