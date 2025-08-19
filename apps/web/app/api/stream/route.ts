import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function GET() {
  // This is a simple SSE endpoint streaming new visitor_events every 2s (polling, not true push)
  const encoder = new TextEncoder()
  let lastId: string | null = null

  const stream = new ReadableStream({
    async start(controller) {
      async function push() {
        // Get new events since lastId
        let query = supabaseServer.from('visitor_events').select('*').order('created_at', { ascending: false }).limit(5)
        if (lastId) query = query.neq('id', lastId)
        const { data } = await query
        if (data && data.length > 0) {
          lastId = data[0].id
          for (const event of data) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
          }
        }
        setTimeout(push, 2000)
      }
      push()
    },
    cancel() {}
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  })
}
