import { Request, Response } from "express";
import FbService from "./fb-comments.service";

export default class FbController {
  async test(req: Request, res: Response) {
    const service = new FbService();
    const result = await service.test();
    res.json(result);
  }
}
