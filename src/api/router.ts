import express from "express";
import { auth } from "../data";
import { authRequest, handleErrors } from "./middleware";
import type { UserStats } from "./types";
import type { Filter } from "../data/database";
import { users } from "../data/auth";
export const router = express.Router();

router.use(express.json());

router.post("/auth/createUser", (req, res) => {
  const userId = auth.createUser(req.body);

  res.send(userId);
});

// routes in this router are authenticated and require a user and password query parameter
// e.g. add ?user=admin&password=admin to the URL to authenticate
const authedRouter = express.Router();
authedRouter.use(express.json());
authedRouter.use(authRequest);
router.use(authedRouter);

// Add error handling to all routers
router.use(handleErrors);
authedRouter.use(handleErrors);

router.post("/auth/changePassword", (req, res) => {
  const user = req.body.user as string;
  const password = req.body.password as string;

  if (!(user in users)) {
    res.status(400).send({ message: "User does not exist" });
  } else {
    auth.changePassword(user, password);
    res.send({ status: "ok" });
  }
});

router.post("/user", (req, res) => {
  const user = req.body.user as string;
  const password = req.body.password as string;

  try {
    auth.createUser({ user, password });
    res.send({ status: "ok" });
  } catch (error) {
    // createUser might throw if a user with this name already exists
    if (error instanceof Error) {
      res.send({ message: error.message }).status(400);
    }
    // else will let the default handler report 500 ...
  }
});

authedRouter.post("/message", async (req, res) => {
  const user = req.body.user as string;
  const message = req.body.message as string;

  const id = await req.db.createMessage(user, message);

  res.send({ id });
});

authedRouter.get("/message", async (req, res) => {
  // We need to check for the validity of the input parameters and:
  // a. either reject the call and return error if params are invalid. A framework like https://www.npmjs.com/package/express-validator can be usefull
  // b. use dafaults if inputs are invalid
  //
  // For this exercise I chose b

  const limit = +(req.query.limit as string); // We'll just default to 10
  const offset = +(req.query.offset as string); // We'll default to 0
  const filter: Filter = {};

  // We'll only set valid inputs on filter, so the defaults that are specified in
  // getMessages can be used otherwise
  if (!isNaN(limit)) {
    filter["limit"] = limit;
  }

  if (!isNaN(offset)) {
    filter["offset"] = offset;
  }

  const messages = await req.db.getMessages(filter);

  res.send({ messages });
});

authedRouter.delete("/message/:id", async (req, res) => {
  const id = req.params.id as string;
  const isDeletedOk = await req.db.deleteMessage(+id);
  if (isDeletedOk) {
    res.send({
      status: "ok",
    });
  } else {
    res
      .send({
        error: "Failed to delete message (bad id)",
      })
      .status(400);
  }
});

authedRouter.get("/user/:username/message", async (req, res) => {
  // TODO: handle validation of parameters ...

  const limit = req.query.limit as string;
  const offset = req.query.offset as string;
  const user = req.params.username as string;

  const messages = await req.db.getMessages({
    user,
    limit: +limit,
    offset: +offset,
  });

  res.send({ messages });
});

authedRouter.get("/user/:username/stats", async (req, res) => {
  const user = req.params.username as string;

  const messageStats = await req.db.getUserMessageStats(user);
  const [firstMessage] = await req.db.getMessages({
    user,
    offset: 0,
    limit: 1,
    sort: "desc",
  });

  const response: UserStats = {
    username: user,
    firstMessage: firstMessage.message,
    ...messageStats,
  };

  res.send(response);
});

authedRouter.get("/top-user-stats", async (req, res) => {
  return req.db.getTopUsers(5).then(async (topUsers) => {
    const response: UserStats[] = [];

    for (const user of topUsers) {
      const messageStats = await req.db.getUserMessageStats(user);
      const [firstMessage] = await req.db.getMessages({
        user,
        offset: 0,
        limit: 1,
        sort: "asc",
      });

      response.push({
        username: user,
        firstMessage: firstMessage.message,
        ...messageStats,
      });
    }

    res.send(response);
  });
});
