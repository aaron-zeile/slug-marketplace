import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Response,
  Route,
  Security,
} from 'tsoa'
import type { Request as ExpressRequest } from 'express'

import {Credentials, Authenticated, SessionUser} from '.'
import {AuthService} from '../service'

interface AuthenticatedRequest extends ExpressRequest {
  user?: SessionUser
}

@Route('login')
export class AuthController extends Controller {
  @Post()
  @Response('401', 'Unauthorised')
  public async login(
    @Body() credentials: Credentials,
  ): Promise<Authenticated|undefined> {
    try {
      return await new AuthService().login(credentials)
    } catch {
      this.setStatus(401)
      return undefined
    }
  }

  @Get('check')
  @Security('jwt', ['member'])
  public async check(
    @Request() request: AuthenticatedRequest,
  ): Promise<SessionUser> {
    return request.user!
  }
}
