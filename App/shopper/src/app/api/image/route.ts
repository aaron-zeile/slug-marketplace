import { NextRequest, NextResponse } from 'next/server';

import { isAllowedRemoteImageUrl } from '@/lib/imageProxy';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url || !isAllowedRemoteImageUrl(url)) {
    return NextResponse.json({ error: 'Invalid image url' }, { status: 400 });
  }

  try {
    const upstream = await fetch(url, {
      headers: {
        Accept: 'image/*',
        'User-Agent': 'SlugMarketplace/1.0',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(10_000),
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: 'Upstream image request failed' },
        { status: 502 },
      );
    }

    const contentType = upstream.headers.get('content-type') ?? '';
    if (!contentType.startsWith('image/')) {
      return NextResponse.json(
        { error: 'URL did not return an image' },
        { status: 400 },
      );
    }

    const body = await upstream.arrayBuffer();
    return new NextResponse(body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch image' },
      { status: 502 },
    );
  }
}
