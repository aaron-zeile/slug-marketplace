import 'server-only'

import { cookies } from 'next/headers'

import { Credentials, Authenticated } from '.'

const TEXT_ENCODED_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET)
const JWE_ALGORITHM = 'A128CBC-HS256'


export class AuthService {
public async login(credentials: Credentials): Promise<Authenticated>  {
    return new Promise((resolve, reject) => {
      const doLogin = async (): Promise<void> => {

        if (user) {
          const authToken = await new EncryptJWT({id: user.id})
            .setProtectedHeader({ alg: 'dir', enc: JWE_ALGORITHM })
            .setIssuedAt()
            .setExpirationTime('2h')
            .encrypt(TEXT_ENCODED_SECRET)
          const expiresAt = new Date(Date.now() + 30 * 60 * 1000)
          const cookieStore = await cookies()
          cookieStore.set('session', authToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            expires: expiresAt,
            sameSite: 'lax',
            path: '/',
          })
          resolve({name: user.name})
        } else {
          reject(new Error("Unauthorized"))
        }
      }
      void doLogin()
    })
  }



}