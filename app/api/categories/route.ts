import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { data, error } = await supabase
    .from('categories')
    .insert({
      planner_id: body.planner_id,
      name: body.name ?? 'New Category',
      color: body.color ?? '#e5e5e0',
      text_color: body.text_color ?? '#1a1a1a',
      description: body.description ?? '',
      items: body.items ?? [],
      sort_order: body.sort_order ?? 999,
    })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
