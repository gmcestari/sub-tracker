import { ApolloServer } from 'apollo-server-express';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { verify } from 'jsonwebtoken';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { createTokens } from './auth';
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from './constants';
import { User } from './entity/User';
import { resolvers } from './resolvers';
import { typeDefs } from './typeDefs';

const startServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req, res }: any) => ({ req, res }),
  });

  await createConnection();

  const app = express();

  app.use(cookieParser());

  app.use(async (req: any, res, next) => {
    const accessToken = req.cookies['access-token'];
    const refreshToken = req.cookies['refresh-token'];

    if (!refreshToken && !accessToken) {
      return next();
    }

    try {
      const data = verify(accessToken, ACCESS_TOKEN_SECRET) as any;
      req.userId = data.userId;
      return next();
    } catch {}

    if (!refreshToken) {
      return next();
    }

    let data;

    try {
      data = verify(refreshToken, REFRESH_TOKEN_SECRET) as any;
    } catch {
      return next();
    }

    const user = await User.findOne(data.userId);

    if (!user || user.count !== data.count) {
      return next();
    }

    const tokens = createTokens(user);

    res.cookie('refresh-token', tokens.refreshToken);
    res.cookie('access-token', tokens.accessToken);
    req.userId = user.id;

    next();
  });

  server.applyMiddleware({ app });

  app.listen({ port: 4000 }, () =>
    console.log(`Server ready at http://localhost:4000${server.graphqlPath}`)
  );
};

startServer();
