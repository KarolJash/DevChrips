import { DataSource } from "apollo-datasource";
// import { UserInputError } from "apollo-server";
// import getToken from "../../../lib/getToken";

class AccountsDataSource extends DataSource {
  constructor({ kcAdminClient }) {
    super();
    this.kcAdminClient = kcAdminClient;
  }

  async getAccountById(id) {
    return this.kcAdminClient.users.findOne({ id });
  }

  async getAccounts() {
    try {
      const users = await this.kcAdminClient.users.find();
    } catch (err) {
      console.log(err);
    }

    return this.kcAdminClient.users.find();
  }

  async createAccount(username, email, password) {
    try {
      const newUser = await this.kcAdminClient.users.create({
        username,
        email,
        emailVerified: true,
        enabled: true,
      });
      await this.kcAdminClient.users.resetPassword({
        id: newUser.id,
        credential: {
          temporary: false,
          type: "password",
          value: password,
        },
      });

      return {
        id: newUser.id,
        created_at: Date.now(),
        email,
      };
    } catch (err) {
      console.log(err.message);
    }
  }

  async deleteAccount(id) {
    await this.kcAdminClient.users.del({ id });

    return true;
  }

  async updateAccount(id, { email, newPassword, password }) {
    return {
      id: "1",
      created_at: Date.now(),
      email: "karolj@databending.ca",
      isBlocked: false,
      isMoDerator: false,
    };
  }

  async changeAccountModeratorRole(id) {
    return {
      id,
      created_at: Date.now(),
      email: "karolj@databending.ca",
      isBlocked: false,
      isModerator: false,
    };
  }

  async changeAccountBlockedStatus(id) {
    return {
      id,
      created_at: Date.now(),
      email: "karolj@databending.ca",
      isBlocked: false,
      isModerator: false,
    };
  }
}

export default AccountsDataSource;
