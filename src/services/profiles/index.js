import { ApolloServer } from "apollo-server";
import { applyMiddleware } from "graphql-middleware";
import { buildFederatedSchema } from "@apollo/federation";

import initMongoose from "../../config/mongoose";
import permissions from "./permissions";

import Profile from "../../models/Profile";
import ProfilesDataSource from "./datasources/ProfilesDataSource";
import resolvers from "./resolvers";
import typeDefs from "./typeDefs";
import keycloakConfig from "../../config/keycloak";

(async () => {
  const kcAdminClient = await keycloakConfig();
  const port = process.env.PROFILES_SERVICE_PORT;

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
        profilesAPI: new ProfilesDataSource({ kcAdminClient, Profile }),
      };
    },
  });

  initMongoose();

  const { url } = await server.listen({ port });
  console.log(`Profiles service ready at ${url}`);
})();
