import { createClient } from '@/lib/supabase/server';
import PlannerApp from '@/components/PlannerApp';

export default async function SharePage({ params }: { params: { token: string } }) {
  const supabase = createClient();

  const { data: planner } = await supabase
    .from('planners')
    .select('*')
    .eq('share_token', params.token)
    .maybeSingle();

  if (!planner) {
    return (
      <div style={{ padding: 60, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif' }}>Not found</h1>
        <p style={{ color: '#666' }}>This share link is invalid or has been disabled.</p>
      </div>
    );
  }

  const [{ data: categories }, { data: entries }] = await Promise.all([
    supabase.from('categories').select('*').eq('planner_id', planner.id).order('sort_order'),
    supabase.from('entries').select('*').eq('planner_id', planner.id),
  ]);

  return (
    <PlannerApp
      planner={planner}
      categories={categories || []}
      entries={entries || []}
      availableYears={[planner.year]}
      userEmail=""
      readOnly={true}
    />
  );
}
