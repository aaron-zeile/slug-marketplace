import { NextResponse } from 'next/server';
import { z } from 'zod';
import sql from '@/lib/db';

const ADMIN_INTERNAL_SECRET = process.env.ADMIN_INTERNAL_SECRET || 'dev-internal-secret';

const IncomingReportSchema = z.object({
  type: z.enum(['item', 'review']),
  targetId: z.string().min(1),
  targetName: z.string().min(1).max(256),
  reporterId: z.string().optional(),
  reporterName: z.string().min(1).max(128).default('Anonymous'),
  reason: z.enum(['spam', 'inappropriate', 'counterfeit', 'misleading', 'other']),
  description: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  const secret = request.headers.get('X-Internal-Secret');
  if (secret !== ADMIN_INTERNAL_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let input;
  try {
    input = IncomingReportSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const [row] = await sql`
    INSERT INTO reports (type, target_id, target_name, reporter_id, reporter_name, reason, description)
    VALUES (
      ${input.type},
      ${input.targetId},
      ${input.targetName},
      ${input.reporterId ?? null},
      ${input.reporterName},
      ${input.reason},
      ${input.description ?? null}
    )
    RETURNING id
  `;

  return NextResponse.json({ ok: true, id: row.id }, { status: 201 });
}
