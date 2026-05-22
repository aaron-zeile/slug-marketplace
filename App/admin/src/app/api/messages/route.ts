import { NextResponse } from 'next/server';
import { z } from 'zod';
import sql from '@/lib/db';

const ADMIN_INTERNAL_SECRET = process.env.ADMIN_INTERNAL_SECRET || 'dev-internal-secret';

const IncomingMessageSchema = z.object({
  sellerId: z.string().min(1),
  sellerName: z.string().min(1),
  sellerEmail: z.string().email(),
  subject: z.string().min(1).max(256),
  body: z.string().min(1).max(2048),
});

export async function POST(request: Request) {
  const secret = request.headers.get('X-Internal-Secret');
  if (secret !== ADMIN_INTERNAL_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let input;
  try {
    input = IncomingMessageSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  await sql`
    INSERT INTO seller_messages (seller_id, seller_name, seller_email, subject, body)
    VALUES (${input.sellerId}, ${input.sellerName}, ${input.sellerEmail}, ${input.subject}, ${input.body})
  `;

  return NextResponse.json({ ok: true }, { status: 201 });
}
