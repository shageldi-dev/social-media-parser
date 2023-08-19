import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import router from "./src/routes/router";
import EventEmitter from "events";
import "./src/test-code";
import client from "./src/database/elasticsearch.client";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.get("/test", async (req, res) => {
  console.log("Starting...");
  // testFunction();
  client
    .ping()
    .then(() => {
      res.send("OK");
    })
    .catch((error) => res.send(error));
});

app.use("/", router);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
