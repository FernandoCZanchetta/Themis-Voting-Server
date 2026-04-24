import { NextFunction, Response } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { AuthRequest, AuthUser } from '@types'

const { JWT_SIGNING_SECRET } = process.env

export function auth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized', cause: 'Missing authorization header!' })
  }

  const [scheme, token] = authHeader.split(' ')

  if (!/^Bearer$/i.test(scheme) || !token) {
    return res.status(401).json({ error: 'Unauthorized', cause: 'Invalid authorization header!' })
  }

  try {
    const jwtDecodedData = jwt.verify(token, JWT_SIGNING_SECRET!) as JwtPayload & AuthUser
    req.user = jwtDecodedData
    return next()
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('[ERROR] [Auth Middleware] Unexpected Auth Error: ' + err.message)
      return res.status(401).json({ error: 'Unauthorized', cause: 'Unexpected Auth Error! Retry Later!' })
    }

    console.error('[ERROR] [Auth Middleware] Unknown Auth Error!')
    return res.status(401).json({ error: 'Unauthorized', cause: 'Unknown Auth Error! Retry later or contact us!' })
  }
}
