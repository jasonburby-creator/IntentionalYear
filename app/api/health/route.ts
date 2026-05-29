import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Lightweight health check endpoint.
// Runs a minimal Supabase query to keep the project active.
// Called every 5 days by the GitHub Actions keep-alive workflow.
export async function GET() {
  try {
    const supabase = await createClient();

    // Minimal query — just count planners. Fast, read-only, no auth needed.
    const { count, error } = await supabase
      .from('planners')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return NextResponse.json(
        { status: 'error', message: error.message, ts: new Date().toISOString() },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'ok',
      planners: count,
      ts: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { status: 'error', message: String(err), ts: new Date().toISOString() },
      { status: 500 }
    );
  }
}
