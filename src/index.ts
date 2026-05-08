import express from "express";
import {middlewareLogResponses, milddlewareMetrics, middlewareError} from "./middleware.js"
import * as handlers from "./handlers.js"
import postgres from "postgres";
import { config } from "./config.js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";

const migrationClient = postgres(config.dbConfig.dbURL, { max: 1 });
await migrate(drizzle(migrationClient), config.dbConfig.migrationConfig);

const PORT = 8080;

const app = express();

app.use(middlewareLogResponses);
app.use(express.json());

app.use("/app", milddlewareMetrics, express.static("./src/app/"));
app.get("/api/healthz", handlers.handlerReadiness);
app.get("/admin/metrics", handlers.hanlderMetrics);
app.post("/admin/reset", handlers.handlerReset);
app.post("/api/validate_chirp", handlers.handlerValidate);

app.use(middlewareError);
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
