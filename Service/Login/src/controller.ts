import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Path,
  Post,
  Put,
  Request,
  Response,
  Route,
  Security,
} from 'tsoa'
import type { Request as ExpressRequest } from 'express'

import {Credentials, Authenticated, SessionUser} from '.'
import type {
  CorporateApiKeyCreated,
  CorporateApiKeyRequest,
  ShippingAddress,
  ShippingAddressInput,
} from '.'
import {AddressService} from '../address-service'
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

@Route('corporate-keys')
export class CorporateApiKeyController extends Controller {
  @Post()
  @Security('jwt', ['member'])
  @Response('401', 'Unauthorised')
  public async create(
    @Request() request: ExpressRequest,
    @Body() body: CorporateApiKeyRequest,
  ): Promise<CorporateApiKeyCreated> {
    return new AuthService().createCorporateApiKey(
      request.headers.authorization,
      body,
    )
  }

  @Get('check')
  @Response('401', 'Unauthorised')
  public async check(
    @Request() request: ExpressRequest,
  ): Promise<Authenticated|LoginError> {
    try {
      return await new AuthService().checkCorporateApiKey(
        request.headers.authorization,
      )
    } catch (error) {
      this.setStatus(401)
      return {
        message: error instanceof Error ? error.message : 'Invalid API key',
      }
    }
  }
}

@Route('addresses')
export class AddressController extends Controller {
  @Get()
  @Security('jwt', ['member'])
  public async list(
    @Request() request: AuthenticatedRequest,
  ): Promise<ShippingAddress[]> {
    return new AddressService().list(request.user!.id)
  }

  @Post()
  @Security('jwt', ['member'])
  public async create(
    @Request() request: AuthenticatedRequest,
    @Body() body: ShippingAddressInput,
  ): Promise<ShippingAddress> {
    return new AddressService().create(request.user!.id, body)
  }

  @Put('{id}')
  @Security('jwt', ['member'])
  public async update(
    @Request() request: AuthenticatedRequest,
    @Path() id: string,
    @Body() body: ShippingAddressInput,
  ): Promise<ShippingAddress> {
    return new AddressService().update(request.user!.id, id, body)
  }

  @Delete('{id}')
  @Security('jwt', ['member'])
  public async remove(
    @Request() request: AuthenticatedRequest,
    @Path() id: string,
  ): Promise<void> {
    await new AddressService().remove(request.user!.id, id)
    this.setStatus(204)
  }

  @Patch('{id}/default')
  @Security('jwt', ['member'])
  public async setDefault(
    @Request() request: AuthenticatedRequest,
    @Path() id: string,
  ): Promise<ShippingAddress> {
    return new AddressService().setDefault(request.user!.id, id)
  }
}
