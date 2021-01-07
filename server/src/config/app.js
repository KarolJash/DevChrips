const express = require("express");
const cors = require("cors");
const { defaultPlaygroundOptions } = require("apollo-server-express");

const { configureKeycloak } = require("../lib/configureKeycloak");
const { server } = require("./apollo");

const app = express();
const graphqlPath = "/graphql";
const playgroundPath = "/playground";

const { keycloak } = configureKeycloak(app, graphqlPath);

app.use(playgroundPath, keycloak.protect());

// Handle custom GraphQL Playground to use dynamics header token from keycloak
app.get(playgroundPath, (req, res, next) => {
  const headers = JSON.stringify({
    "X-CSRF-Token": req.kauth.grant.access_token.token,
  });
  expressPlayground({
    ...defaultPlaygroundOptions,
    endpoint: `${graphqlPath}?headers=${encodeURIComponent(headers)}`,
    settings: {
      ...defaultPlaygroundOptions.settings,
      "request.credentials": "same-origin",
    },
    version: "",
    tabs: "",
  })(req, res, next);
});

module.exports = app;
