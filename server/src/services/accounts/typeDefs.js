import { gql } from "apollo-server";

const { KeycloakTypeDefs } = require("keycloak-connect-graphql");

// Defining a root query
const typeDefs = gql`
  ${KeycloakTypeDefs}

  type Account @key(fields: "id") {
    id: ID!
    created_at: String
    email: String
    isBlocked: Boolean
    isModerator: Boolean
  }

  extend type Query {
    account(id: ID!): Account!
    accounts: [Account]
    viewer: Account
  }

  input CreateAccountInput {
    username: String!
    email: String!
    password: String!
  }

  input AccountWhereUniqueInput {
    id: ID!
  }

  input UpdateAccountInput {
    email: String
    newPassword: String
    password: String
  }

  extend type Mutation {
    changeAccountModeratorRole(where: AccountWhereUniqueInput!): Account!
    changeAccountBlockedStatus(where: AccountWhereUniqueInput!): Account!
    createAccount(data: CreateAccountInput!): Account!
    deleteAccount(where: AccountWhereUniqueInput!): Boolean!
    updateAccount(
      data: UpdateAccountInput!
      where: AccountWhereUniqueInput!
    ): Account!
  }
`;

export default typeDefs;
