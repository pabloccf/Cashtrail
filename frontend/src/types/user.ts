// Public user data returned by /auth/register, /auth/login and /auth/me (never the password hash)
export interface User {
  id: string
  email: string
  name: string
  currency: string
  createdAt: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}
