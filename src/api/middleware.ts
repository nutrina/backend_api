import { NextFunction, Request, Response } from "express";
import { auth, db } from "../data";

declare global {
  namespace Express {
    interface Request {
      db: db.Db;
    }
  }
}

export const injectDatabase = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  req.db = new db.Db();
  next();
};

export const authRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.query.user as string;
  const password = req.query.password as string;

  const isValid = auth.validateCredentials(user, password);

  if (!isValid) {
    res.status(400).send("Unauthorized");
  }

  next();
};

export const handleErrors = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(err.stack);
  res.status(500).send(err.message);
};
