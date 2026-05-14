import 'reflect-metadata';
import { buildSchema } from 'type-graphql';
import { createYoga, type Plugin } from 'graphql-yoga';
import { AdminResolver } from './resolvers/admin.resolver';
import { ProfitResolver } from './resolvers/profit.resolver';

export type GraphQLContext = {
  request: Request;
  responseHeaders: Headers;
};

function responseHeadersPlugin(): Plugin<GraphQLContext> {
  return {
    onResponse({ response, serverContext }) {
      const ctx = serverContext as unknown as GraphQLContext | undefined;
      ctx?.responseHeaders?.forEach((value: string, key: string) => {
        response.headers.append(key, value);
      });
    },
  };
}

let _yoga: ReturnType<typeof createYoga<GraphQLContext>> | undefined;

export async function getYoga() {
  if (!_yoga) {
    const schema = await buildSchema({
      resolvers: [AdminResolver, ProfitResolver],
      validate: false,
    });
    _yoga = createYoga<GraphQLContext>({
      schema,
      graphqlEndpoint: '/api/graphql',
      context: ({ request }) => ({
        request,
        responseHeaders: new Headers(),
      }),
      plugins: [responseHeadersPlugin()],
    });
  }
  return _yoga;
}
