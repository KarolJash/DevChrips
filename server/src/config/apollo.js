const { ApolloGateway, RemoteGraphQLDataSource } = require("@apollo/gateway");
const { ApolloServer } = require("apollo-server-express");
const { KeycloakContext } = require("keycloak-connect-graphql");

const gateway = new ApolloGateway({
  serviceList: [{ name: "accounts", url: process.env.ACCOUNTS_SERVICE_URL }],
  buildService({ url }) {
    return new RemoteGraphQLDataSource({
      url,
      willSendRequest({ request, context }) {
        if (context.kauth && context.kauth.accessToken) {
          request.http.headers.set(
            "Authorization",
            "bearer " + context.kauth.accessToken.token
          );
        }
      },
    });
  },
  __exposeQueryPlanExperimental: false,
});

const server = new ApolloServer({
  gateway,

  engine: false,
  subscriptions: false,

  context: ({ req }) => {
    return {
      kauth: new KeycloakContext({ req }),
    };
  },
});

module.exports = server;
