import { ApolloServer } from "apollo-server";
import { applyMiddleware } from "graphql-middleware";
import { buildFederatedSchema } from "@apollo/federation";

import initMongoose from "../../config/mongoose";
import permissions from "./permissions";

import Post from "../../models/Post";
import Profile from "../../models/Profile";
import Reply from "../../models/Reply";

import ContentDataSource from "./datasources/ContentDataSource";
import resolvers from "./resolvers";
import typeDefs from "./typeDefs";
import keycloakConfig from "../../config/keycloak";

(async () => {
  const kcAdminClient = await keycloakConfig();
  const port = process.env.CONTENT_SERVICE_PORT;

  const schema = applyMiddleware(
    buildFederatedSchema([{ typeDefs, resolvers }]),
    permissions
  );

  const server = new ApolloServer({
    schema,
    context: ({ req }) => {
      const user = req.headers.user ? JSON.parse(req.headers.user) : null;
      return { user };
    },
    dataSources: () => {
      return {
        contentAPI: new ContentDataSource({
          Post,
          Profile,
          Reply,
        }),
      };
    },
  });

  initMongoose();

  const { url } = await server.listen({ port });
  console.log(`Profiles service ready at ${url}`);
})();
