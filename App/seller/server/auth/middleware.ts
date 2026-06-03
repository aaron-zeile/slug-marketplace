import type {NextFunction, Request, Response} from 'express'
import {check, checkApiKey, type SessionUser} from './service.js'

declare module 'express-serve-static-core' {
  interface Request {
    user?: SessionUser
    sessionToken?: string
  }
}

function getCookie(req: Request, name: string): string | undefined {
  const cookies = req.headers.cookie ?? ''
  return cookies
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.slice(name.length + 1)
}

function getApiKey(req: Request): string | undefined {
  const value = req.headers['x-api-key']
  return typeof value === 'string' && value ? value : undefined
}

export async function doCheck(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = getCookie(req, 'session')
  const apiKey = getApiKey(req)

  if (apiKey) {
    const authenticated = await checkApiKey(apiKey)

    if (!authenticated) {
      res.sendStatus(401)
      return
    }

    req.user = {
      id: authenticated.id,
      email: authenticated.email,
      name: authenticated.name,
    }
    req.sessionToken = authenticated.token
    next()
    return
  }

  if (!token) {
    res.sendStatus(401)
    return
  }

  req.sessionToken = token
  const user = await check(token)

  if (!user) {
    res.sendStatus(401)
    return
  }

  req.user = user
  next()
}
