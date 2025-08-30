import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'WordPress',
      credentials: {
        username: { label: "Username/Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        try {
          console.log('Attempting WordPress JWT login for:', credentials.username)
          
          // WordPress JWT authentication endpoint
          const response = await fetch(`${process.env.WP_BASE_URL}/wp-json/jwt-auth/v1/token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
          })

          const data = await response.json()
          console.log('JWT Response:', response.status, data)

          if (!response.ok) {
            // Check if it's a 2FA-related error
            const is2FAError = 
              data.code === '[jwt_auth] invalid_application_credentials' ||
              data.code === 'jwt_auth_invalid_application_credentials' ||
              data.message?.includes('API-Anmeldung') ||
              data.message?.includes('API login disabled') ||
              data.message?.includes('deaktiviert')
            
            if (is2FAError) {
              console.log('2FA detected - this system does not support 2FA')
              throw new Error('2FA_NOT_SUPPORTED')
            }
            
            console.log('Authentication failed:', data.message)
            return null
          }

          // If JWT auth succeeded, process the user data
          if (data.token) {
            // Decode JWT token to get user ID
            const tokenParts = data.token.split('.')
            const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString())
            console.log('JWT payload:', payload)
            
            const userId = payload.data?.user?.id
            if (!userId) {
              console.log('No user ID found in JWT payload')
              return null
            }
            
            console.log('Found user ID:', userId)
            
            // Fetch WooCommerce customer data
            let customerData: any = {}
            try {
              const customerResponse = await fetch(`${process.env.WP_BASE_URL}/wp-json/wc/v3/customers/${userId}`, {
                headers: {
                  'Authorization': `Basic ${Buffer.from(`${process.env.WOO_CONSUMER_KEY}:${process.env.WOO_CONSUMER_SECRET}`).toString('base64')}`,
                },
              })
              if (customerResponse.ok) {
                customerData = await customerResponse.json()
              }
            } catch (error) {
              console.log('Could not fetch WooCommerce customer data:', error)
            }

            return {
              id: userId.toString(),
              email: data.user_email,
              name: data.user_display_name,
              token: data.token,
              username: data.user_nicename,
              firstName: customerData.first_name || '',
              lastName: customerData.last_name || '',
              billing: customerData.billing || {},
              shipping: customerData.shipping || {},
              avatar: undefined,
            }
          }
          
          return null
        } catch (error) {
          console.error('Auth error:', error)
          // Re-throw 2FA not supported error
          if (error instanceof Error && error.message === '2FA_NOT_SUPPORTED') {
            throw error
          }
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.accessToken = user.token
        token.username = user.username
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.billing = user.billing
        token.shipping = user.shipping
        token.avatar = user.avatar
        token.jwt = user.token
        token.userId = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          email: token.email as string,
          name: token.name as string,
          username: token.username as string,
          firstName: token.firstName as string,
          lastName: token.lastName as string,
          billing: token.billing as any,
          shipping: token.shipping as any,
          avatar: token.avatar as string,
        }
        session.accessToken = token.accessToken as string
        session.jwt = token.jwt as string
        session.userId = token.userId as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }