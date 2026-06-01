import 'reflect-metadata';
import { Resolver, Query, Mutation, Arg, Ctx } from 'type-graphql';
import bcrypt from 'bcryptjs';
import { getIronSession } from 'iron-session';
import { AdminItem, AdminReport, AdminReview, AuthPayload, SellerMessage } from '../types';
import sql from '@/lib/db';
import { sessionOptions, type AdminSession } from '@/lib/auth';
import type { GraphQLContext } from '../server';

@Resolver()
export class AdminResolver {
  private itemsServiceBaseUrl(): string {
    return (process.env.ITEMS_SERVICE_URL ?? 'http://localhost:4500/graphql').replace(/\/graphql$/, '');
  }

  private adminSecret(): string {
    return process.env.ADMIN_INTERNAL_SECRET ?? 'dev-internal-secret';
  }

  private async requireAdminSession(ctx: GraphQLContext): Promise<AdminSession> {
    const tempResponse = new Response();
    const session = await getIronSession<AdminSession>(ctx.request, tempResponse, sessionOptions);
    if (!session.adminId) {
      throw new Error('Not authenticated');
    }
    return session;
  }

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

  @Query(() => [SellerMessage])
  async sellerMessages(@Ctx() ctx: GraphQLContext): Promise<SellerMessage[]> {
    const tempResponse = new Response();
    const session = await getIronSession<AdminSession>(ctx.request, tempResponse, sessionOptions);
    if (!session.adminId) {
      throw new Error('Not authenticated');
    }

    const rows = await sql<{
      id: string;
      seller_id: string;
      seller_name: string;
      seller_email: string;
      subject: string;
      body: string;
      created_at: Date;
    }[]>`
      SELECT id, seller_id, seller_name, seller_email, subject, body, created_at
      FROM seller_messages
      ORDER BY created_at DESC
    `;

    return rows.map((r) => ({
      id: r.id,
      sellerId: r.seller_id,
      sellerName: r.seller_name,
      sellerEmail: r.seller_email,
      subject: r.subject,
      body: r.body,
      createdAt: r.created_at.toISOString(),
    }));
  }

  @Query(() => [AdminItem])
  async adminItems(@Ctx() ctx: GraphQLContext): Promise<AdminItem[]> {
    await this.requireAdminSession(ctx);
    const res = await fetch(`${this.itemsServiceBaseUrl()}/admin/items`, {
      headers: { 'X-Admin-Secret': this.adminSecret() },
    });
    if (!res.ok) throw new Error('Failed to fetch items from items service');
    const items = await res.json() as Array<{
      id: string;
      name: string;
      seller: { id: string; name: string };
      price: string;
      status: string;
      created_at: string;
    }>;
    return items.map((item) => ({
      id: item.id,
      name: item.name,
      seller: item.seller,
      price: parseFloat(item.price),
      status: item.status,
      createdAt: item.created_at,
    }));
  }

  @Mutation(() => Boolean)
  async adminDeleteItem(
    @Arg('id', () => String) id: string,
    @Ctx() ctx: GraphQLContext,
  ): Promise<boolean> {
    await this.requireAdminSession(ctx);
    const res = await fetch(`${this.itemsServiceBaseUrl()}/admin/items/${id}`, {
      method: 'DELETE',
      headers: { 'X-Admin-Secret': this.adminSecret() },
    });
    if (res.status === 404) throw new Error('Item not found');
    if (!res.ok) throw new Error('Failed to delete item');
    return true;
  }

  @Query(() => [AdminReview])
  async adminReviews(@Ctx() ctx: GraphQLContext): Promise<AdminReview[]> {
    await this.requireAdminSession(ctx);
    const res = await fetch(`${this.itemsServiceBaseUrl()}/admin/reviews`, {
      headers: { 'X-Admin-Secret': this.adminSecret() },
    });
    if (!res.ok) throw new Error('Failed to fetch reviews from items service');
    const reviews = await res.json() as Array<{
      id: string;
      itemId: string;
      itemName: string;
      user: { id: string; name: string };
      content: string;
      rating: number;
      created_at: string;
    }>;
    return reviews.map((r) => ({
      id: r.id,
      itemId: r.itemId,
      itemName: r.itemName,
      user: r.user,
      content: r.content,
      rating: r.rating,
      createdAt: r.created_at,
    }));
  }

  @Mutation(() => Boolean)
  async adminDeleteReview(
    @Arg('id', () => String) id: string,
    @Ctx() ctx: GraphQLContext,
  ): Promise<boolean> {
    await this.requireAdminSession(ctx);
    const res = await fetch(`${this.itemsServiceBaseUrl()}/admin/reviews/${id}`, {
      method: 'DELETE',
      headers: { 'X-Admin-Secret': this.adminSecret() },
    });
    if (res.status === 404) throw new Error('Review not found');
    if (!res.ok) throw new Error('Failed to delete review');
    return true;
  }

  @Query(() => [AdminReport])
  async adminReports(
    @Arg('status', () => String, { nullable: true }) status: string | null,
    @Ctx() ctx: GraphQLContext,
  ): Promise<AdminReport[]> {
    await this.requireAdminSession(ctx);
    const rows = await (status
      ? sql<{
          id: string; type: string; target_id: string; target_name: string;
          reporter_id: string | null; reporter_name: string; reason: string;
          description: string | null; status: string; admin_notes: string | null;
          created_at: Date; resolved_at: Date | null; resolved_by: string | null;
        }[]>`SELECT * FROM reports WHERE status = ${status} ORDER BY created_at DESC`
      : sql<{
          id: string; type: string; target_id: string; target_name: string;
          reporter_id: string | null; reporter_name: string; reason: string;
          description: string | null; status: string; admin_notes: string | null;
          created_at: Date; resolved_at: Date | null; resolved_by: string | null;
        }[]>`SELECT * FROM reports ORDER BY created_at DESC`);
    return rows.map((r) => ({
      id: r.id,
      type: r.type,
      targetId: r.target_id,
      targetName: r.target_name,
      reporterId: r.reporter_id ?? undefined,
      reporterName: r.reporter_name,
      reason: r.reason,
      description: r.description ?? undefined,
      status: r.status,
      adminNotes: r.admin_notes ?? undefined,
      createdAt: r.created_at.toISOString(),
      resolvedAt: r.resolved_at?.toISOString() ?? undefined,
      resolvedBy: r.resolved_by ?? undefined,
    }));
  }

  @Mutation(() => Boolean)
  async adminUpdateReportStatus(
    @Arg('id', () => String) id: string,
    @Arg('status', () => String) status: string,
    @Arg('adminNotes', () => String, { nullable: true }) adminNotes: string | null,
    @Ctx() ctx: GraphQLContext,
  ): Promise<boolean> {
    const session = await this.requireAdminSession(ctx);
    const isTerminal = status === 'resolved' || status === 'dismissed';
    if (isTerminal) {
      await sql`
        UPDATE reports
        SET status = ${status}, admin_notes = ${adminNotes ?? null},
            resolved_at = NOW(), resolved_by = ${session.email}
        WHERE id = ${id}
      `;
    } else {
      await sql`
        UPDATE reports
        SET status = ${status}, admin_notes = ${adminNotes ?? null}
        WHERE id = ${id}
      `;
    }
    return true;
  }

  @Mutation(() => Boolean)
  async adminDeleteReportTarget(
    @Arg('reportId', () => String) reportId: string,
    @Arg('targetType', () => String) targetType: string,
    @Arg('targetId', () => String) targetId: string,
    @Ctx() ctx: GraphQLContext,
  ): Promise<boolean> {
    const session = await this.requireAdminSession(ctx);
    const endpoint = targetType === 'item' ? 'items' : 'reviews';
    const res = await fetch(`${this.itemsServiceBaseUrl()}/admin/${endpoint}/${targetId}`, {
      method: 'DELETE',
      headers: { 'X-Admin-Secret': this.adminSecret() },
    });
    if (res.status === 404) throw new Error(`${targetType} not found`);
    if (!res.ok) throw new Error(`Failed to delete ${targetType}`);
    await sql`
      UPDATE reports
      SET status = 'resolved', resolved_at = NOW(), resolved_by = ${session.email}
      WHERE id = ${reportId}
    `;
    return true;
  }
}
