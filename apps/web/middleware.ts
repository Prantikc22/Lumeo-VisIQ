import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  // Protect /dashboard routes (skip auth for now, just a stub)
  // TODO: Add real auth check when ready
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
