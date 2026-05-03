import { getYoga } from '@/graphql/server';

export async function GET(request: Request) {
  const yoga = await getYoga();
  const responseHeaders = new Headers();
  return yoga.handleRequest(request, { request, responseHeaders });
}

export async function POST(request: Request) {
  const yoga = await getYoga();
  const responseHeaders = new Headers();
  return yoga.handleRequest(request, { request, responseHeaders });
}
