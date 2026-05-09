import {NextFunction, Request, Response} from "express";
import { config } from "./config.js";"./config.js"
import * as errorTypes from "./errorTypes.js"

export async function middlewareLogResponses(req: Request, res: Response, next: NextFunction) 
{
    res.on("finish", () => {
        if(res.statusCode != 200)
        {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${res.statusCode}`);
        }
    });
    next();
}

export async function milddlewareMetrics(req: Request, res: Response, next: NextFunction) 
{
    config["fileserverHits"] += 1;  
    next();
}

export async function middlewareError(err: Error, req: Request, res: Response, next: NextFunction) 
{
    console.log(err);
    if (err instanceof errorTypes.BadRequestError) {
        res.header("Content-Type", 'application/json');
        res.status(400).send(JSON.stringify({error: err.message}));
    } 
    else if (err instanceof errorTypes.UnauthorizedError) {
        res.header("Content-Type", 'application/json');
        res.status(401).send(JSON.stringify({error: "Unauthorized"}));
    } 
    else if (err instanceof errorTypes.ForbiddenError) {
        res.header("Content-Type", 'application/json');
        res.status(403).send(JSON.stringify({error: "Forbidden"}));
    } 
    else if (err instanceof errorTypes.NotFoundError) {
        res.header("Content-Type", 'application/json');
        res.status(404).send(JSON.stringify({error: "Not Found"}));
    } 
    else
    {
    res.header("Content-Type", 'application/json');
    res.status(500).send(JSON.stringify({error: "Internal Server Error"}));
    }
}