import {NextFunction, Request, Response} from "express";
import { api_config } from "./config.js";"./config.js"

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
    api_config["fileserverHits"] += 1;  
    next();
}