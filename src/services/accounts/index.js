import express from "express";
import { ApolloServer, SchemaDirectiveVisitor } from "apollo-server-express";
import { buildFederatedSchema } from "@apollo/federation";

import AccountsDataSource from "./datasources/AccountsDataSource";
import resolvers from "./reslovers";
import typeDefs from "./typeDefs";
import {
  KeycloakContext,
  KeycloakSchemaDirectives,
} from "keycloak-connect-graphql";

import { configureKeycloak } from "../../lib/configureKeycloak";
import keycloakConfig from "../../config/keycloak";

(async () => {
  const kcAdminClient = await keycloakConfig();
  const app = express();
  const graphqlPath = "/graphql";
  const port = process.env.ACCOUNTS_SERVICE_PORT;
  const schema = buildFederatedSchema([{ typeDefs, resolvers }]);
  const directives = KeycloakSchemaDirectives;

  SchemaDirectiveVisitor.visitSchemaDirectives(schema, directives);
  const server = new ApolloServer({
    schema,
    context: ({ req }) => {
      return {
        kauth: new KeycloakContext({ req }),
      };
    },
    dataSources: () => ({
      accountsAPI: new AccountsDataSource({ kcAdminClient }),
    }),
  });

  const { keycloak } = configureKeycloak(app, graphqlPath);

  app.use(graphqlPath, keycloak.middleware());

  server.applyMiddleware({ app });

  app.listen({ port }, () => {
    console.log(
      `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`
    );
  });
})();
