import { getYoga } from '@/graphql/server';

const BASE_PATH = '/admin';

function stripBasePath(request: Request): Request {
  const url = new URL(request.url);
  if (url.pathname.startsWith(`${BASE_PATH}/`)) {
    url.pathname = url.pathname.slice(BASE_PATH.length);
    return new Request(url, {
      body: request.body,
      cache: request.cache,
      credentials: request.credentials,
      headers: request.headers,
      integrity: request.integrity,
      keepalive: request.keepalive,
      method: request.method,
      mode: request.mode,
      redirect: request.redirect,
      referrer: request.referrer,
      referrerPolicy: request.referrerPolicy,
      duplex: 'half',
    } as RequestInit & { duplex: 'half' });
  }
  return request;
}

export async function GET(request: Request) {
  const yoga = await getYoga();
  const responseHeaders = new Headers();
  const yogaRequest = stripBasePath(request);
  return yoga.handleRequest(yogaRequest, { request: yogaRequest, responseHeaders });
}

export async function POST(request: Request) {
  const yoga = await getYoga();
  const responseHeaders = new Headers();
  const yogaRequest = stripBasePath(request);
  return yoga.handleRequest(yogaRequest, { request: yogaRequest, responseHeaders });
}
