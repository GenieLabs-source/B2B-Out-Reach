import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { upsertUser } from '../../../lib/users'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: [
            'openid', 'email', 'profile',
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive.file',
            'https://www.googleapis.com/auth/gmail.compose'
          ].join(' '),
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        await upsertUser({
          email: user.email,
          name: user.name,
          avatar: user.image,
          googleId: profile.sub,
          country: null
        })
      } catch (e) {
        console.error('Supabase upsert error:', e.message)
      }
      return true
    },
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at
        token.googleId = profile?.sub
        return token
      }

      // Refresh the Google access token if it's expired or about to expire
      if (token.expiresAt && Date.now() / 1000 > token.expiresAt - 60) {
        try {
          const res = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              client_id: process.env.GOOGLE_CLIENT_ID,
              client_secret: process.env.GOOGLE_CLIENT_SECRET,
              grant_type: 'refresh_token',
              refresh_token: token.refreshToken
            })
          })
          const refreshed = await res.json()
          if (!res.ok) throw refreshed
          token.accessToken = refreshed.access_token
          token.expiresAt = Math.floor(Date.now() / 1000) + refreshed.expires_in
          if (refreshed.refresh_token) token.refreshToken = refreshed.refresh_token
        } catch (e) {
          console.error('Token refresh failed:', e)
          token.refreshError = true
        }
      }

      return token
    },
    async session({ session, token }) {
      // SECURITY: never expose raw Google access/refresh tokens to the client.
      // Server-side API routes read them from the encrypted JWT via getServerSession,
      // not from the session object returned to the browser.
      session.googleId = token.googleId
      session.tokenExpired = token.expiresAt ? Date.now() / 1000 > token.expiresAt : false
      return session
    }
  },
  pages: { signIn: '/login' },
  secret: process.env.NEXTAUTH_SECRET
}

export default NextAuth(authOptions)
