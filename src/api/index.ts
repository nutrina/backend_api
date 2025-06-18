import express from "express";
import { handleErrors, injectDatabase } from "./middleware";
import { router } from "./router";

export const app = express();

app.use(express.json());
app.use(injectDatabase);

app.use("/v1", router);

app.use(handleErrors);
