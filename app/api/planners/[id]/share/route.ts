import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { randomBytes } from 'crypto';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { enable } = await req.json();
  const token = enable ? randomBytes(16).toString('hex') : null;

  const { data, error } = await supabase
    .from('planners')
    .update({ share_token: token })
    .eq('id', params.id)
    .eq('user_id', user.id)
    .select('share_token')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ share_token: data.share_token });
}
