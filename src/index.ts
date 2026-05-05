import express from "express";
import {Request, Response} from "express";

const handlerReadiness = (req: Request, res: Response) => 
{
    res.set({"Content-Type" : 'text/plain'});
    res.status(200).send("OK")
}

const PORT = 8080;

const app = express();

app.use("/app", express.static("./src/app/"));
app.get("/healthz", handlerReadiness);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
