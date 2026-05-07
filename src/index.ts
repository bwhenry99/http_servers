import express from "express";
import {Request, Response} from "express";
import {middlewareLogResponses, milddlewareMetrics} from "./middleware.js"
import { api_config } from "./config.js";

const handlerReadiness = (req: Request, res: Response) => 
{
    res.set({"Content-Type" : 'text/plain'});
    res.status(200).send("OK")
}

const hanlderMetrics = (req: Request, res: Response) =>
{
    res.set({"Content-Type" : 'text/html'});
    res.status(200).send(
    `<html>
    <body>
        <h1>Welcome, Chirpy Admin</h1>
        <p>Chirpy has been visited ${api_config.fileserverHits} times!</p>
    </body>
    </html>`
    );
}

const handlerReset = (req: Request, res: Response) =>
{
    api_config.fileserverHits = 0;
    res.send("reset");
}

const PORT = 8080;

const app = express();

app.use(middlewareLogResponses);
app.use("/app", milddlewareMetrics, express.static("./src/app/"));
app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics", hanlderMetrics);
app.get("/admin/reset", handlerReset);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
