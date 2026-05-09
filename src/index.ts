import express from "express";
import {middlewareLogResponses, milddlewareMetrics, middlewareError} from "./middleware.js"
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import * as handlers from "./handlers.js"
import { config } from "./config.js";

const migrationClient = postgres(config.dbConfig.dbURL, { max: 1 });
await migrate(drizzle(migrationClient), config.dbConfig.migrationConfig);

const PORT = 8080;

const app = express();

app.use(middlewareLogResponses);
app.use(express.json());

app.use("/app", milddlewareMetrics, express.static("./src/app/"));
app.get("/api/healthz", (req, res, next) => {
  Promise.resolve(handlers.handlerReadiness(req, res)).catch(next);
});
app.get("/admin/metrics", (req, res, next) => {
  Promise.resolve(handlers.hanlderMetrics(req, res)).catch(next);
});
app.post("/admin/reset", (req, res, next) => {
  Promise.resolve(handlers.handlerReset(req, res)).catch(next);
});

app.post("/api/users", (req, res, next) => {
  Promise.resolve(handlers.handlerNewUser(req, res)).catch(next);
});

app.post("/api/login", (req, res, next) => {
  Promise.resolve(handlers.hanlderLogin(req, res)).catch(next);
});

app.post("/api/chirps", (req, res, next) => {
  Promise.resolve(handlers.handlerAddChirp(req, res)).catch(next);
});

app.get("/api/chirps", (req, res, next) => {
  Promise.resolve(handlers.handlerGetChirps(req, res)).catch(next);
});

app.get("/api/chirps/:chirpId", (req, res, next) => {
  Promise.resolve(handlers.handlerGetChirp(req, res)).catch(next);
});

app.use(middlewareError);
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
