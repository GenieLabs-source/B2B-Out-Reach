import { getToken } from 'next-auth/jwt'
import { getServerSession } from 'next-auth'
import { authOptions } from '../pages/api/auth/[...nextauth]'

/**
 * SECURITY: this is the only place API routes should pull the Google access token from.
 * It reads from the encrypted, httpOnly JWT cookie — never from the client-visible session object.
 * Returns { session, accessToken, googleId } or null if not authenticated / token refresh failed.
 */
export async function getAuthedRequest(req, res) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return null

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token || token.refreshError) return null

  return {
    session,
    accessToken: token.accessToken,
    googleId: token.googleId
  }
}
