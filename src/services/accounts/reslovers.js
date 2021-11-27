import { DateTimeResolver } from "../../lib/customScalars";

const resolvers = {
  DateTime: DateTimeResolver,

  Account: {
    __resolveReference(reference, { dataSources }, info) {
      return dataSources.accountsAPI.getAccountById(reference.id);
    },
    id(account, args, context, info) {
      return account.id;
    },
    created_at(account, args, context, info) {
      const d = new Date(account.created_at);
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
    async account(_, { id }, { dataSources }, info) {
      return dataSources.accountsAPI.getAccountById(id);
    },
    accounts(parent, args, { dataSources }, info) {
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
