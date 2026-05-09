import {Request, response, Response} from "express";
import { config } from "./config.js";
import * as errorTypes from "./errorTypes.js"
import { createUser } from "./db/queries/users.js";
import { NewUser, users } from "./db/schema.js";
import { db } from "./db/index.js";

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
    await db.delete(users);
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
        //const my_error: errorResponse = {error: "Chirp is too long"};
        //res.header("Content-Type", 'application/json');
        //res.status(400).send(JSON.stringify(my_error));
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

        res.header("Content-Type", 'application/json');
        res.status(200).send(JSON.stringify({"cleanedBody": clean_body}));
    }
}

export async function handlerUser(req: Request, res:Response) 
{    
    type parameters = {
        email: string;
    };

    const registration: parameters = req.body;

    if(registration.email)
    {
        const usertoAdd: NewUser = {"email": registration.email};
        const user = await createUser(usertoAdd)
        console.log(user);
        res.header("Content-Type", 'application/json');
        res.status(201).send(user);
    }
}