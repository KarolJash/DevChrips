import { DataSource } from "apollo-datasource";
import { UserInputError } from "apollo-server";

import Pagination from "../../../lib/Pagination";

class ContentDataSource extends DataSource {
  constructor({ Post, Profile, Reply }) {
    super();
    this.Post = Post;
    this.Profile = Profile;
    this.Reply = Reply;
    this.postPagination = new Pagination(Post);
    this.replyPagination = new Pagination(Reply);
  }

  getPostById(id) {
    return this.Post.findById(id);
  }

  async getPosts({ after, before, first, last, orderBy, filter: rawFilter }) {
    let filter = {};

    // parse the "raw" filter argument into something MongoDB can use
    if (rawFilter && rawFilter.followedBy) {
      const profile = await this.Profile.findOne({
        username: rawFilter.followedBy,
      }).exec();

      if (!profile) {
        throw new UserInputError("User with that username cannot be found.");
      }

      filter.authorProfileId = {
        $in: [...profile.following, profile._id],
      };
    }

    if (rawFilter && rawFilter.includeBlocked === false) {
      filter.blocked = { $in: [null, false] };
    }

    // parse the orderBy enum into something MongoDB can use
    const sort = this._getContentSort(orderBy);

    // get the edges and page info
    const queryArgs = { after, before, first, last, filter, sort };
    const edges = await this.postPagination.getEdges(queryArgs);
    const pageInfo = await this.postPagination.getPageInfo(edges, queryArgs);

    return { edges, pageInfo };
  }

  _getContentSort(sortEnum) {
    let sort = {};

    if (sortEnum) {
      const sortArgs = sortEnum.split("_");
      const [field, direction] = sortArgs;
      sort[field] = direction === "DESC" ? -1 : 1;
    } else {
      sort.createdAt = -1;
    }

    return sort;
  }

  async getOwnPosts({ after, before, first, last, orderBy, authorProfileId }) {
    const sort = this._getContentSort(orderBy);
    const filter = { authorProfileId };
    const queryArgs = { after, before, first, last, filter, sort };
    const edges = await this.postPagination.getEdges(queryArgs);
    const PageInfo = await this.postPagination.PageInfo(edges, queryArgs);

    return { edges, pageInfo };
  }
}

export default ContentDataSource;
