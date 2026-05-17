import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CORE_CATEGORY_NAMES } from '@/lib/types';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  // Fetch existing to check if this is a core category
  const { data: existing } = await supabase
    .from('categories')
    .select('name')
    .eq('id', params.id)
    .maybeSingle();

  const isCore = existing && CORE_CATEGORY_NAMES.includes(existing.name);

  const patch: Record<string, unknown> = {};
  for (const k of ['name', 'color', 'text_color', 'description', 'items', 'sort_order']) {
    if (body[k] !== undefined) patch[k] = body[k];
  }

  // Server-side lock: even if client tries to change name/description on a core category, ignore.
  if (isCore) {
    delete patch.name;
    delete patch.description;
  }

  const { data, error } = await supabase
    .from('categories')
    .update(patch)
    .eq('id', params.id)
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Block deletion of core categories
  const { data: existing } = await supabase
    .from('categories')
    .select('name')
    .eq('id', params.id)
    .maybeSingle();

  if (existing && CORE_CATEGORY_NAMES.includes(existing.name)) {
    return NextResponse.json({ error: 'Core categories cannot be deleted' }, { status: 403 });
  }

  const { error } = await supabase.from('categories').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
