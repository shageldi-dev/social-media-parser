import express from "express";
import commentsRouter from "./comments.router";
import facebookRouter from "./facebook.router";

const router = express.Router();
router.use("/comments", commentsRouter);
router.use("/fb", facebookRouter);

export default router;
