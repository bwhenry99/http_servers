import {Request, response, Response} from "express";
import { config } from "./config.js";
import * as errorTypes from "./errorTypes.js"
import { createUser } from "./db/queries/users.js";
import * as tables from "./db/schema.js";
import { db } from "./db/index.js";
import { createChirp, getChirps } from "./db/queries/chirps.js";

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
        <p>Chirpy has been visited ${config.fileserverHits} times!</p>
    </body>
    </html>`
    );
}

export async function handlerReset(req: Request, res: Response) 
{
    if(config.platform != "dev")
        throw errorTypes.ForbiddenError;

    config.fileserverHits = 0;
    await db.delete(tables.users);
    res.send("reset");
}

export async function handlerAddChirp(req: Request, res:Response) 
{
    type parameters = {
        body: string;
        userId: string;
    };

    const chirp: parameters = req.body;
    if(chirp.body.length > 140)
    {
        throw new errorTypes.BadRequestError("Chirp is too long. Max length is 140");
    }
    else
    {
        const words = chirp.body.split(" ");
        for(let i = 0; i < words.length; i++)
        {
            if(words[i].toLowerCase() == "kerfuffle" || words[i].toLowerCase() == "sharbert" || words[i].toLowerCase() == "fornax")
            {
                words[i] = "****";
            }
        }

        const clean_body = words.join(" ");

        if(chirp.body && chirp.userId)
        {
            const newChirp: tables.NewChirp = {"body": clean_body, "userId": chirp.userId};
            const added = await createChirp(newChirp);
            res.header("Content-Type", 'application/json');
            res.status(201).send(added);
        }
    }
}

export async function handlerGetChirps(req: Request, res: Response)
{
    const allChirps = await getChirps();
    res.header("Content-Type", 'application/json');
    res.status(200).send(allChirps);
}


export async function handlerUser(req: Request, res:Response) 
{    
    type parameters = {
        email: string;
    };

    const registration: parameters = req.body;

    if(registration.email)
    {
        const usertoAdd: tables.NewUser = {"email": registration.email};
        const user = await createUser(usertoAdd)
        res.header("Content-Type", 'application/json');
        res.status(201).send(user);
    }
}
