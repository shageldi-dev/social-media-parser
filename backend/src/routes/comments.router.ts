import express from "express";
import CommentsController from "../app/comments/comments.controller";

const commentsRouter = express.Router();

const controller = new CommentsController();

commentsRouter.get("/get-video-details", controller.getVideoDetail);
commentsRouter.get("/get-channel-details", controller.getChannelDetails);

export default commentsRouter;
