// TODO: Add auth check when ready
import { NextResponse } from 'next/server'

export async function GET() {
  // Stub: return fake billing data
  return NextResponse.json({
    plan: 'Free',
    usage: 1234,
    quota: 10000,
    billingHistory: []
  })
}
