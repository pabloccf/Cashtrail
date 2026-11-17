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

// Body of PUT /auth/me. The currency only changes how amounts are shown: nothing is converted
export interface UpdateProfileInput {
  name: string
  currency: string // "EUR", "USD", "GBP" or "CHF"
}
