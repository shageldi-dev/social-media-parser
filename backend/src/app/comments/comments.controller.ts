import { Request, Response } from "express";
import CommentsService from "./comments.service";

export default class CommentsController {
  async getVideoDetail(req: Request, res: Response) {
    const service = new CommentsService();
    service.getVideoDetail(`${req.query.videoId}`).then((data) => {
      res.json(data);
    });
  }

  async getChannelDetails(req: Request, res: Response) {
    const service = new CommentsService();
    service
      .getChannelDetails(`${req.query.channelId}`)
      .then((data) => res.json(data));
  }

  async searchComments(req: Request, res: Response) {
    
  }
}
