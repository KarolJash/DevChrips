import KcAdminClient from "keycloak-admin";
import { Issuer } from "openid-client";

const keycloakConfig = async () => {
  const kcAdminClient = new KcAdminClient();

  // Authorization with username / password
  await kcAdminClient.auth({
    username: "admin",
    password: "admin",
    grantType: "password",
    clientId: "admin-cli",
  });

  const keycloakIssuer = await Issuer.discover(
    "http://localhost:8080/auth/realms/master"
  );

  const client = new keycloakIssuer.Client({
    client_id: "admin-cli", // Same as `clientId` passed to client.auth()
    token_endpoint_auth_method: "none", // to send only client_id in the header
  });

  // Use the grant type 'password'
  let tokenSet = await client.grant({
    grant_type: "password",
    username: "admin",
    password: "admin",
  });

  setInterval(async () => {
    const refreshToken = tokenSet.refresh_token;
    tokenSet = await client.refresh(refreshToken);
    // console.log(tokenSet);
    kcAdminClient.baseUrl = "http://localhost:8080/auth";
    // console.log(kcAdminClient.baseUrl);
    kcAdminClient.setAccessToken(tokenSet.access_token);
  }, 58 * 1000); // 58 seconds

  // Periodically using refresh_token grant flow to get new access token here

  kcAdminClient.setConfig({
    realmName: "keycloak-connect-graphql",
  });
  return kcAdminClient;
};

export default keycloakConfig;
