import { Router, Request, Response } from "express";
import { createRouteHandler } from "uploadthing/express";
import { uploadRouter } from "../uploadthing";

export const profileRouter: Router = Router();

profileRouter.use(
  "/api/uploadthing",
  createRouteHandler({
    router: uploadRouter,
    //    config: { ... },
  }),
);
