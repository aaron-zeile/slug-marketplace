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

interface LoginError {
  message: string
}

@Route('login')
export class AuthController extends Controller {
  @Post()
  @Response('401', 'Unauthorised')
  public async login(
    @Body() credentials: Credentials,
  ): Promise<Authenticated|LoginError> {
    try {
      return await new AuthService().login(credentials)
    } catch (error) {
      // console.error('[login-service] Login failed in controller', error)
      this.setStatus(401)
      return {
        message: error instanceof Error ? error.message : 'Unknown login error',
      }
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
