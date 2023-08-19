import { getChannelDetails, getVideoDetail } from "./function/comments.funs";
import client from "../../database/elasticsearch.client";

export default class CommentsService {
  async getVideoDetail(videoId: string) {
    return getVideoDetail(videoId);
  }
  async getChannelDetails(channelId: string) {
    return getChannelDetails(channelId);
  }
  async searchComments(query: string) {
    // return client.search({
    //   query: {
    //   }
    // })
  }
}
