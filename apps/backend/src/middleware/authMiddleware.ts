import { NextFunction, Request, Response } from "express";
import { auth } from "../util/auth";
import { fromNodeHeaders } from "better-auth/node";
import { notAdmin, unauthorized } from "../util/lib";

export async function authMiddlewareUser(req: Request, res: Response, next: NextFunction) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  if (!session) {
    return unauthorized(res);
  } else {
    res.locals.session = session;
    req.userId = session.user.id;
    req.user = session.user;
    req.session = session;
    next();
  }
}

export async function authMiddlewareAdmin(req: Request, res: Response, next: NextFunction) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session) return unauthorized(res);
  if (!session.user.isAdmin) return notAdmin(res);
  res.locals.session = session;
  req.userId = session.user.id;
  req.user = session.user;
  req.session = session;
  next();
}
