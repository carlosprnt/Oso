import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Gmail OAuth callback.
 *
 * Supabase redirects here after the user grants Gmail read access.
 * We capture the provider_token (Google access token) from the session
 * and store it in a short-lived httpOnly cookie so our API route can use it.
 *
 * Setup required in Supabase dashboard:
 *   Authentication → Providers → Google → "Save User Token" must be enabled.
 *   The redirectTo URL must be added to the Supabase "Allowed Redirect URLs" list.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  const redirectBase = (() => {
    const forwardedHost = request.headers.get('x-forwarded-host')
    if (process.env.NODE_ENV !== 'development' && forwardedHost) {
      return `https://${forwardedHost}`
    }
    return origin
  })()

  if (!code) {
    return NextResponse.redirect(`${redirectBase}/subscriptions?gmail_error=no_code`)
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.session) {
    return NextResponse.redirect(`${redirectBase}/subscriptions?gmail_error=auth_failed`)
  }

  const token = data.session.provider_token

  if (!token) {
    // provider_token is only available if "Save User Token" is enabled in Supabase dashboard.
    // Without it, the user needs to configure Supabase to forward provider tokens.
    return NextResponse.redirect(`${redirectBase}/subscriptions?gmail_error=no_token`)
  }

  // Store the Gmail access token in a secure httpOnly cookie.
  // Google access tokens expire after ~1 hour.
  const response = NextResponse.redirect(`${redirectBase}/subscriptions`)
  response.cookies.set('gmail_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 3500, // 58 minutes — slightly under Google's 1-hour expiry
    path: '/',
  })

  return response
}
