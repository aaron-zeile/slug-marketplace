import 'reflect-metadata';
import { Resolver, Query, Mutation, Arg, Ctx } from 'type-graphql';
import bcrypt from 'bcryptjs';
import { getIronSession } from 'iron-session';
import { AuthPayload } from '../types';
import sql from '@/lib/db';
import { sessionOptions, type AdminSession } from '@/lib/auth';
import type { GraphQLContext } from '../server';

@Resolver()
export class AdminResolver {
  @Query(() => Boolean)
  health(): boolean {
    return true;
  }

  @Mutation(() => AuthPayload)
  async login(
    @Arg('email', () => String) email: string,
    @Arg('password', () => String) password: string,
    @Ctx() ctx: GraphQLContext,
  ): Promise<AuthPayload> {
    const [admin] = await sql`SELECT * FROM admins WHERE email = ${email} LIMIT 1`;

    if (!admin) {
      return { success: false, message: 'Invalid credentials' };
    }

    const valid = await bcrypt.compare(password, admin.password_hash as string);
    if (!valid) {
      return { success: false, message: 'Invalid credentials' };
    }

    // Write iron-session cookie via a temporary Response then copy Set-Cookie header
    const tempResponse = new Response();
    const session = await getIronSession<AdminSession>(ctx.request, tempResponse, sessionOptions);
    session.adminId = admin.id as number;
    session.email = admin.email as string;
    await session.save();

    tempResponse.headers.forEach((value, key) => {
      ctx.responseHeaders.append(key, value);
    });

    return { success: true };
  }

  @Mutation(() => AuthPayload)
  async logout(
    @Ctx() ctx: GraphQLContext,
  ): Promise<AuthPayload> {
    const tempResponse = new Response();
    const session = await getIronSession<AdminSession>(ctx.request, tempResponse, sessionOptions);
    await session.destroy();

    tempResponse.headers.forEach((value, key) => {
      ctx.responseHeaders.append(key, value);
    });

    return { success: true };
  }
}
