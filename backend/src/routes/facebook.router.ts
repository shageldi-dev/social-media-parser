import express from "express";
import FbController from "../app/facebook/comments/fb-comments.controller";

const facebookRouter = express.Router();
const controller = new FbController();
facebookRouter.get("/test", controller.test);

export default facebookRouter;
