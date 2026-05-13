import {Request, Response} from "express";
import { config } from "./config.js";
import * as errorTypes from "./errorTypes.js"
import { createUser, getUser, updateUser, upgradeUser } from "./db/queries/users.js";
import * as tables from "./db/schema.js";
import { db } from "./db/index.js";
import { createChirp, getChirps, getChirp, deleteChirp, getChirpsByUser } from "./db/queries/chirps.js";
import * as auth from "./auth.js"
import * as refresh from "./db/queries/refresh.js"
import { log } from "node:console";
import { userInfo } from "node:os";

type returnUser = Omit<tables.NewUser, "hashed_password">
function scrubPassword(user:tables.NewUser): returnUser
{
    const retUser: returnUser = {
        "id": user.id,
        "email": user.email,
        "createdAt": user.createdAt,
        "updatedAt": user.updatedAt,
        "isChirpyRed": user.isChirpyRed
    };
    return retUser;
}

type tokenUser = returnUser & {token: string, refreshToken: string};
function appendToken(user:returnUser, token: string, refreshToken: string): tokenUser
{
    const tokUser: tokenUser = {
        "id": user.id,
        "email": user.email,
        "createdAt": user.createdAt,
        "updatedAt": user.updatedAt,
        "isChirpyRed": user.isChirpyRed,
        "token": token,
        "refreshToken": refreshToken
    };
    return tokUser;
}

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
    };

    const chirp: parameters = req.body;

    const token = auth.getBearerToken(req);

    // validate token
    const userID = auth.validateJWT(token, config.secret)

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

        if(chirp.body && userID)
        {
            const newChirp: tables.NewChirp = {"body": clean_body, "userId": userID};
            const added = await createChirp(newChirp);
            res.header("Content-Type", 'application/json');
            res.status(201).send(added);
        }
    }
}

export async function handlerGetChirps(req: Request, res: Response)
{
    let authorId = "";
    let authorIdQuery = req.query.authorId;
    if (typeof authorIdQuery === "string") {
        authorId = authorIdQuery;
    }

    let allChirps;
    if(authorId)
    {
        allChirps = await getChirpsByUser(authorId);
    } 
    else
    {
        allChirps = await getChirps();
    }
    res.header("Content-Type", 'application/json');
    res.status(200).send(allChirps);
}

export async function handlerGetChirp(req: Request, res: Response)
{
    if(!req.params.chirpId)
        throw errorTypes.BadRequestError;

    if(typeof(req.params.chirpId) == "string")
    {
        const chirpId = req.params.chirpId;
        const chirp = await getChirp(chirpId);

        if(chirp){
            res.header("Content-Type", 'application/json');
            res.status(200).send(chirp);
        }
        else {
            throw new errorTypes.NotFoundError("Chirp not found");
        }
    }
    else{
        throw errorTypes.BadRequestError;
    }
}

export async function handlerDeleteChirp(req: Request, res: Response)
{
    const token = auth.getBearerToken(req);
    const userID = auth.validateJWT(token, config.secret)

    if(!req.params.chirpId)
        throw errorTypes.BadRequestError;

    if(typeof(req.params.chirpId) == "string")
    {

        const chirpId = req.params.chirpId;
        let chirpUser = "";
        try
        {
            const chirp = await getChirp(chirpId);
            chirpUser = chirp.userId;
        }
        catch
        {
            throw new errorTypes.NotFoundError("Chirp not found");
        }


        if(!(userID == chirpUser))
        {
            throw new errorTypes.ForbiddenError("Cannot delete chirp")
        }

        await deleteChirp(chirpId, userID);
        res.header("Content-Type", 'application/json');
        res.status(204).send();
    }
    else{
        throw new errorTypes.BadRequestError("No chirp ID");
    }
}

export async function handlerNewUser(req: Request, res:Response) 
{    
    type parameters = {
        password: string;
        email: string;
    };

    const registration: parameters = req.body;

    if(registration.email && registration.password)
    {
        const hashed_password = await auth.hashPassword(registration.password);
        const usertoAdd: tables.NewUser = {"email": registration.email, "hashed_password": hashed_password};
        const user = await createUser(usertoAdd)
        res.header("Content-Type", 'application/json');
        res.status(201).send(scrubPassword(user));
    }
    else{
        throw errorTypes.BadRequestError;
    }
}

export async function handlerEditUser(req: Request, res:Response) 
{
        type parameters = {
        password: string;
        email: string;
    };

    const registration: parameters = req.body;
    
    const token = auth.getBearerToken(req);
    const userID = auth.validateJWT(token, config.secret)

    if(registration.email && registration.password)
    {
        const hashed_password = await auth.hashPassword(registration.password);
        const user = await updateUser(userID, registration.email, hashed_password);
        res.header("Content-Type", 'application/json');
        res.status(200).send(scrubPassword(user));
    }
    else{
        throw errorTypes.BadRequestError;
    }
}

export async function handlerUpgradeUser(req: Request, res:Response) 
{
    type parameters = {
        event: string;
        data: {
            userId: string;
        }
    };

    const token = auth.getPolkaToken(req);
    console.log(token);
    if(!(token == config.polka_key))
    {
        res.status(401).send();
        return;
    }

    const event: parameters = req.body;
    if(!(event.event == "user.upgraded"))
    {
        res.status(204).send();
        return;
    }

    try
    {
        upgradeUser(event.data.userId);
        res.status(204).send();
    }
    catch
    {
        throw new errorTypes.NotFoundError("User not found")
    }
}

export async function hanlderLogin(req: Request, res:Response) 
{    
    type parameters = {
        password: string;
        email: string;
    };

    const login: parameters = req.body;

    if(login.email && login.password)
    {
        const user = await getUser(login.email);
        if(!user)
            throw new errorTypes.UnauthorizedError("incorrect email or password");
        
        const success = await auth.verifyPassword(login.password, user["hashed_password"]);
        if(!success)
            throw new errorTypes.UnauthorizedError("incorrect email or password");

        const token = auth.makeJWT(user.id, 3600, config.secret);
        const refreshToken = auth.makeRefreshToken();
        const newRefresh: tables.NewRefresh = {userId: user.id, token: refreshToken};
        await refresh.createRefresh(newRefresh)
        res.header("Content-Type", 'application/json');
        res.status(200).send(appendToken(scrubPassword(user), token, refreshToken));
    }
    else{
        throw errorTypes.BadRequestError;
    }
}

export async function handlerRefresh(req: Request, res:Response) 
{
    const refreshToken = auth.getRefreshToken(req);
    if(await refresh.verifyToken(refreshToken))
    {
        const userId = await refresh.getUserFromToken(refreshToken);
        const token = auth.makeJWT(userId, 3600, config.secret);
        res.header("Content-Type", 'application/json');
        res.status(200).send({token: token});
    }
    else{
        throw new errorTypes.UnauthorizedError("Bad Refresh Token")
    }
}

export async function handlerRevoke(req: Request, res:Response)
{
    const refreshToken = auth.getRefreshToken(req);
    if(!await refresh.verifyToken(refreshToken))
        throw new errorTypes.BadRequestError("Token doesn't exist");

    await refresh.revokeToken(refreshToken);
    res.status(204).send();
}