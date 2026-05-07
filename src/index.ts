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
    res.set({"Content-Type" : 'text/plain'});
    res.status(200).send(`Hits: ${api_config.fileserverHits}`);
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
app.get("/healthz", handlerReadiness);
app.get("/metrics", hanlderMetrics);
app.get("/reset", handlerReset);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
