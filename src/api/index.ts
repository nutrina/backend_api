import express from "express";
import { handleErrors, injectDatabase } from "./middleware";
import { router } from "./router";

// Import node error handler to catch top level 
// unhandled errors and rejections (that express does not catch)
// This shall prevent the server from crashing
import "./node_error_handler";

export const app = express();

app.use(express.json());
app.use(injectDatabase);

app.use("/v1", router);

app.use(handleErrors);
