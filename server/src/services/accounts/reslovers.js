const dayjs = require("dayjs");
import { UserInputError } from "apollo-server";

const resolvers = {
  Account: {
    __resolveReference(reference, { dataSources }, info) {
      return dataSources.accountsAPI.getAccountById(reference.id);
    },
    id(account, args, context, info) {
      return account.id;
    },
    created_at(account, args, context, info) {
      const d = dayjs(account.createdTimestamp).format("MMMM YYYY");
      return d;
    },
    isBlocked(account, args, context, info) {
      return account.blocked;
    },
    isModerator(account, args, context, info) {
      return (
        account.app_metadata &&
        account.app_metadata.roles &&
        account.app_metadata.roles.includes("moderator")
      );
    },
  },

  Query: {
    async account(_, { id }, { dataSources, kauth }, info) {
      const fetchedAccount = await dataSources.accountsAPI.getAccountById(id);
      console.log(fetchedAccount);
      return fetchedAccount;
    },
    accounts(parent, args, { dataSources, kauth }, info) {
      return dataSources.accountsAPI.getAccounts();
    },
    viewer(parent, args, { dataSources, kauth }, info) {
      if (kauth.accessToken) {
        return dataSources.accountsAPI.getAccountById(
          kauth.accessToken.content.sub
        );
      }
      return null;
    },
  },
  Mutation: {
    changeAccountBlockedStatus(
      parent,
      { where: { id } },
      { dataSources },
      info
    ) {
      return dataSources.accountsAPI.changeAccountBlockedStatus(id);
    },
    changeAccountModeratorRole(
      parent,
      { where: { id } },
      { dataSources },
      info
    ) {
      return dataSources.accountsAPI.changeAccountModeratorRole(id);
    },
    createAccount(
      parent,
      { data: { username, email, password } },
      { dataSources },
      info
    ) {
      return dataSources.accountsAPI.createAccount(username, email, password);
    },
    deleteAccount(parent, { where: { id } }, { dataSources }, info) {
      return dataSources.accountsAPI.deleteAccount(id);
    },
    updateAccount(parent, { data, where: { id } }, { dataSources }, info) {
      return dataSources.accountsAPI.updateAccount(id, data);
    },
  },
};

export default resolvers;
