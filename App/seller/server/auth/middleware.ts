import type {NextFunction, Request, Response} from 'express'
import {check, type SessionUser} from './service.js'

const TEMP_SELLER_ID = process.env.TEMP_SELLER_ID || 'dbdb10af-685c-41ff-b8e1-676b98c1732a';

declare module 'express-serve-static-core' {
  interface Request {
    user?: SessionUser
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

export async function doCheck(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = getCookie(req, 'session')

  if (!token && process.env.NODE_ENV === 'development' && TEMP_SELLER_ID) {
    req.user = {
      id: TEMP_SELLER_ID,
      email: 'test-seller@email.com',
      name: 'Test Seller'
    }
    next()
    return
  }

  if (!token) {
    res.sendStatus(401)
    return
  }

  const user = await check(token)

  if (!user) {
    res.sendStatus(401)
    return
  }

  req.user = user
  next()
}