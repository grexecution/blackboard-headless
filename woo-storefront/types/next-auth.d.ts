import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    name: string
    token: string
    username: string
    firstName?: string
    lastName?: string
    billing?: any
    shipping?: any
    avatar?: string
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      username: string
      firstName?: string
      lastName?: string
      billing?: any
      shipping?: any
      avatar?: string
    }
    accessToken: string
  }
}