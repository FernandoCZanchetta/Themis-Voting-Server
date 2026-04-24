import { NextFunction, Response } from 'express'
import jwt, { JsonWebTokenError, JwtPayload, NotBeforeError, TokenExpiredError } from 'jsonwebtoken'
import { AuthRequest, AuthUser } from '@types'

const { JWT_SIGNING_SECRET } = process.env

export function auth(req: AuthRequest, res: Response, next: NextFunction) {
  console.info('[Auth Middleware] Getting request headers...')
  const authHeader = req.headers.authorization

  console.info('[Auth Middleware] Checking for authorization header...')
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized', cause: 'Missing authorization header!' })
  }

  console.info('[Auth Middleware] Extracting scheme and token from auth header...')
  const [scheme, token] = authHeader.split(' ')

  console.info('[Auth Middleware] Checking if scheme and token are valid...')
  if (!/^Bearer$/i.test(scheme) || !token) {
    return res.status(401).json({ error: 'Unauthorized', cause: 'Invalid authorization header!' })
  }

  try {
    console.info('[Auth Middleware] Verifying JWT and inserting user into request...')
    const jwtDecodedData = jwt.verify(token, JWT_SIGNING_SECRET!) as JwtPayload & AuthUser
    req.user = jwtDecodedData
    return next()
  } catch (err: unknown) {
    if (err instanceof TokenExpiredError) {
      console.error('[ERROR] [Auth Middleware] Expired JWT! (' + err.message + ')')
      return res.status(401).json({ error: 'Unauthorized', cause: 'Expired JWT! Please, authenticate again!' })
    }

    if (err instanceof NotBeforeError) {
      console.error('[ERROR] [Auth Middleware] Not Active JWT! (' + err.message + ')')
      return res
        .status(401)
        .json({ error: 'Unauthorized', cause: 'JWT not active! Please, wait for the token to become active!' })
    }

    if (err instanceof JsonWebTokenError) {
      console.error('[ERROR] [Auth Middleware] Malformed JWT! (' + err.message + ')')
      return res
        .status(401)
        .json({ error: 'Unauthorized', cause: 'Malformed JWT! Good try, but, please, insert a valid token!' })
    }

    if (err instanceof Error) {
      console.error('[ERROR] [Auth Middleware] Unexpected Auth Error: ' + err.message)
      return res.status(401).json({ error: 'Unauthorized', cause: 'Unexpected Auth Error! Retry Later!' })
    }

    console.error('[ERROR] [Auth Middleware] Unknown Auth Error!')
    return res.status(401).json({ error: 'Unauthorized', cause: 'Unknown Auth Error! Retry later or contact us!' })
  }
}
