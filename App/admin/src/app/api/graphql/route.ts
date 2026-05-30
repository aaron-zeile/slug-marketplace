import { getYoga } from '@/graphql/server';

const BASE_PATH = '/admin';

function stripBasePath(request: Request): Request {
  const url = new URL(request.url);
  if (url.pathname.startsWith(`${BASE_PATH}/`)) {
    url.pathname = url.pathname.slice(BASE_PATH.length);
    return new Request(url, request);
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
