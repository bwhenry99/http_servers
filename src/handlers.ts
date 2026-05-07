import {Request, response, Response} from "express";
import { api_config } from "./config.js";
import { Cipheriv } from "node:crypto";
import { stringify } from "node:querystring";

export const handlerReadiness = (req: Request, res: Response) => 
{
    res.set({"Content-Type" : 'text/plain'});
    res.status(200).send("OK")
}

export const hanlderMetrics = (req: Request, res: Response) =>
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

export const handlerReset = (req: Request, res: Response) =>
{
    api_config.fileserverHits = 0;
    res.send("reset");
}

export const handlerValidate = (req: Request, res:Response) =>
{
    type errorResponse = {
        error: string;
    };

    type parameters = {
        body: string;
    };

    const chirp: parameters = req.body;
    if(chirp.body.length > 140)
    {
        const my_error: errorResponse = {error: "Chirp is too long"};
        res.header("Content-Type", 'application/json');
        res.status(400).send(JSON.stringify(my_error));
    }
    else
    {
        res.header("Content-Type", 'application/json');
        res.status(200).send(JSON.stringify({"valid": true}));
    }
}