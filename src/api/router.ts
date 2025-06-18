import express from "express";
import { auth } from "../data";
import { authRequest } from "./middleware";
import type { UserStats } from "./types";

export const router = express.Router();

router.post("/auth/createUser", (req, res) => {
  const userId = auth.createUser(req.body);

  res.send(userId);
});

// routes in this router are authenticated and require a user and password query parameter
// e.g. add ?user=admin&password=admin to the URL to authenticate
const authedRouter = express.Router();
authedRouter.use(authRequest);
router.use(authedRouter);

router.post("/auth/changePassword", (req, res) => {
  const user = req.body.user as string;
  const password = req.body.password as string;

  auth.changePassword(user, password);

  res.send("ok");
});

authedRouter.post("/message", async (req, res) => {
  const user = req.body.user as string;
  const message = req.body.message as string;

  const id = await req.db.createMessage(user, message);

  res.send(id);
});

authedRouter.get("/message", async (req, res) => {
  const limit = req.query.limit as string;
  const offset = req.query.offset as string;

  const messages = await req.db.getMessages({ limit: +limit, offset: +offset });

  res.send(messages);
});

authedRouter.get("/message/delete/:id", async (req, res) => {
  const id = req.params.id as string;

  res.send(await req.db.deleteMessage(+id));
});

authedRouter.get("/user/:username/message", async (req, res) => {
  const limit = req.query.limit as string;
  const offset = req.query.offset as string;
  const user = req.params.username as string;

  const messages = await req.db.getMessages({
    user,
    limit: +limit,
    offset: +offset,
  });

  res.send(messages);
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
