import { gql } from "apollo-server";

const { KeycloakTypeDefs } = require("keycloak-connect-graphql");

// Defining a root query
const typeDefs = gql`
  ${KeycloakTypeDefs}
  scalar DateTime

  """
  An account is a keycloak user that provides authentication details.
  """
  type Account @key(fields: "id") {
    "The unique ID associated with the account."
    id: ID!
    "The date and time the account was created."
    created_at: DateTime!
    "The email associated with the account (must be unique)."
    email: String
    "Whether the account is blocked."
    isBlocked: Boolean
    "Whether the account has a moderator role."
    isModerator: Boolean
  }

  extend type Query {
    "Retrieves a single account by ID."
    account(id: ID!): Account!

    "Retrives a list of accounts."
    accounts: [Account]

    "Retrives the currently logged in account from keycloak."
    viewer: Account
  }

  """
  Provides data to create a new account.
  """
  input CreateAccountInput {
    "The new account's username"
    username: String!
    "The new account's email (must be unique)."
    email: String!
    "The new account's password."
    password: String!
  }

  """
  Provides the unique ID of an existing account.
  """
  input AccountWhereUniqueInput {
    "The unique ID associated with the account."
    id: ID!
  }

  """
  Provides data to update an existing account.

  A current password and new password are required to update a password.

  Password and email fields cannot be updated simultaneously.
  """
  input UpdateAccountInput {
    "The updated account email"
    email: String
    "The updated account password."
    newPassword: String
    "The existing account password."
    password: String
  }

  extend type Mutation {
    "Escalates or deescalates moderator role permissions."
    changeAccountModeratorRole(where: AccountWhereUniqueInput!): Account!

    "Blocks or unblocks an account from authenticating."
    changeAccountBlockedStatus(where: AccountWhereUniqueInput!): Account!

    "Created a new account."
    createAccount(data: CreateAccountInput!): Account!

    "Deletes an account."
    deleteAccount(where: AccountWhereUniqueInput!): Boolean!

    "Updates an account's details."
    updateAccount(
      data: UpdateAccountInput!
      where: AccountWhereUniqueInput!
    ): Account!
  }
`;

export default typeDefs;
