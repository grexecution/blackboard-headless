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
    enrolledCourseIds?: number[]
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
    jwt: string
    userId: string
    enrolledCourseIds: number[]
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    email: string
    name: string
    accessToken: string
    jwt: string
    userId: string
    username: string
    firstName?: string
    lastName?: string
    billing?: any
    shipping?: any
    avatar?: string
    enrolledCourseIds?: number[]
  }
}