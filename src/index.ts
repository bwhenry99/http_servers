import express from "express";
import {middlewareLogResponses, milddlewareMetrics} from "./middleware.js"
import * as handlers from "./handlers.js"

const PORT = 8080;

const app = express();

app.use(middlewareLogResponses);
app.use("/app", milddlewareMetrics, express.static("./src/app/"));
app.get("/api/healthz", handlers.handlerReadiness);
app.get("/admin/metrics", handlers.hanlderMetrics);
app.post("/admin/reset", handlers.handlerReset);
app.post("/api/validate_chirp", handlers.handlerValidate);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
