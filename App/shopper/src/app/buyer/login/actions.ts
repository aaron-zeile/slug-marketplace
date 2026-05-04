'use server'

import { cookies } from 'next/headers'


export async function login(credentials: Credentials) : Promise<Authenticated|undefined> {
  try {
    return await new AuthService().login(credentials)
  }
  catch {
    return undefined
  }
}

export async function logout() {
   const cookieStore = await cookies()
   cookieStore.delete('session')
}
