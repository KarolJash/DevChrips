import { DataSource } from "apollo-datasource";
import { UserInputError } from "apollo-server";
import gravatarUrl from "gravatar-url";

import Pagination from "../../../lib/Pagination";

class ProfilesDataSource extends DataSource {
  constructor({ kcAdminClient, Profile }) {
    super();
    this.kcAdminClient = kcAdminClient;
    this.Profile = Profile;
    this.pagination = new Pagination(Profile);
  }

  getProfile(filter) {
    return this.Profile.findOne(filter).exec();
  }

  async getProfiles({ after, before, first, last, orderBy }) {
    const sort = this._getProfileSort(orderBy);
    const queryArgs = { after, before, first, last, sort };
    const edges = await this.pagination.getEdges(queryArgs);
    const pageInfo = await this.pagination.getPageInfo(edges, queryArgs);

    return { edges, pageInfo };
  }

  getProfileById(id) {
    return this.Profile.findById(id);
  }

  async checkViewerFollowsProfile(viewerAccountId, profileId) {
    const viewerProfile = await this.Profile.findOne({
      accountId: viewerAccountId,
    }).exec();
    return viewerProfile.following.includes(profileId);
  }

  async createProfile(profile) {
    const account = await this.kcAdminClient.users.findOne({
      id: profile.accountId,
    });
    const avatar = gravatarUrl(account.email, { default: "mm" });
    profile.avatar = avatar;
    const newProfile = new this.Profile(profile);

    return newProfile.save();
  }

  updateProfile(currentUsername, { description, fullName, username }) {
    if (!description && !fullName && !username) {
      throw new UserInputError("You must supply some profile data to update.");
    }

    const data = {
      ...(description && { description }),
      ...(fullName && { fullName }),
      ...(username && { username }),
    };

    return this.Profile.findOneAndUpdate({ username: currentUsername }, data, {
      new: true,
    });
  }

  async deleteProfile(username) {
    const deletedProfile = await this.Profile.findOneAndDelete({
      username,
    }).exec();
    return deletedProfile._id;
  }

  followProfile(username, profileIdToFollow) {
    return this.Profile.findOneAndUpdate(
      { username },
      { $addToSet: { following: profileIdToFollow } },
      { new: true }
    );
  }

  unfollowProfile(username, profileIdToFollow) {
    return this.Profile.findOneAndUpdate(
      { username },
      { $pull: { following: profileIdToFollow } },
      { new: true }
    );
  }

  async getFollowedProfiles({
    after,
    before,
    first,
    last,
    orderBy,
    following,
  }) {
    const sort = this._getProfileSort(orderBy);
    const filter = { _id: { $in: following } };
    const queryArgs = { after, before, first, last, filter, sort };
    const edges = await this.pagination.getEdges(queryArgs);
    const pageInfo = await this.pagination.getPageInfo(edges, queryArgs);

    return { edges, pageInfo };
  }

  _getProfileSort(sortEnum) {
    let sort = {};

    if (sortEnum) {
      const sortArgs = sortEnum.split("_");
      const [field, direction] = sortArgs;
      sort[field] = direction === "DESC" ? -1 : 1;
    } else {
      // { username: 1 }

      sort.username = 1;
      // or
      // sort["username"] = 1;
    }

    return sort;
  }

  async searchProfiles({ after, first, searchString }) {
    const sort = { score: { $meta: "textScore" }, _id: -1 };
    const filter = { $text: { $search: searchString } };
    const queryArgs = { after, first, filter, sort };
    const edges = await this.pagination.getEdges(queryArgs);
    const pageInfo = await this.pagination.getPageInfo(edges, queryArgs);

    return { edges, pageInfo };
  }
}

export default ProfilesDataSource;
