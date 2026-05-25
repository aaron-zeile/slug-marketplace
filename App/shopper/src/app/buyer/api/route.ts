import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

import { check, getSessionToken } from '../../../server/auth/service';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'STRIPE_SECRET_KEY is not configured' },
        { status: 500 },
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const token = await getSessionToken();
    const user = token ? await check(token) : undefined;

    if (!user) {
      return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
    }

    const { amount, addressId } = await request.json();

    if (!addressId || typeof addressId !== 'string') {
      return NextResponse.json(
        { error: 'addressId is required' },
        { status: 400 },
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        buyerId: user.id,
        addressId,
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Internal Error:', error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error}` },
      { status: 500 },
    );
  }
}
