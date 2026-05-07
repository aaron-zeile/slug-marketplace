import {Request} from "express"
import {AuthService} from '../service'
import {SessionUser} from '.'

export function expressAuthentication(
  request: Request,
  securityName: string,
  scopes?: string[]
): Promise<SessionUser> {
  // console.log('expressAuthentication hit')
  return new AuthService().check(request.headers.authorization, scopes)
}
