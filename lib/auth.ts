import { SignJWT, jwtVerify } from 'jose'

const AUTH_COOKIE = 'auth'

export function getJwtSecret() {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    throw new Error('AUTH_SECRET env var is not set')
  }
  return new TextEncoder().encode(secret)
}

export async function signAuthToken(payload: { sub: string; role: string }) {
  const secret = getJwtSecret()
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
  return token
}

export async function verifyAuthToken(token: string) {
  const secret = getJwtSecret()
  const { payload } = await jwtVerify(token, secret)
  return payload as { sub: string; role: string; iat: number; exp: number }
}

export { AUTH_COOKIE }
