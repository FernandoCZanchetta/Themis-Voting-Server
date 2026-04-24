import type { Request } from 'express'

export interface AuthRequest<TParams = any> extends Request<TParams> {
  user?: AuthUser
}

export interface AuthUser {
  sub: string
  nUSPHash: string
  course?: string
  courseCode?: number
  institute?: string
  instituteCode?: number
  campus?: string
}
