import * as argon2 from "argon2";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { UnauthorizedError } from "./errorTypes.js"
import { Request } from "express";
import { randomBytes } from "crypto";

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export async function hashPassword(password: string)
{
    return await argon2.hash(password)
}

export async function verifyPassword(password: string, hashed_password: string)
{
  if (!password) return false;
  try {
      return await argon2.verify(hashed_password, password);
  } catch {
      return false;
  }
}

export function makeJWT(userID: string, expiresIn: number, secret: string) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + expiresIn;
  const token = jwt.sign(
    {
      iss: "chirpy",
      sub: userID,
      iat: issuedAt,
      exp: expiresAt,
    } satisfies payload,
    secret,
    { algorithm: "HS256" },
  );

  return token;
}

export function validateJWT(tokenString: string, secret: string) {
  let decoded: payload;
  try {
    decoded = jwt.verify(tokenString, secret) as JwtPayload;
  } catch (e) {
    throw new UnauthorizedError("Invalid token");
  }

  if (decoded.iss !== "chirpy") {
    throw new UnauthorizedError("Invalid issuer");
  }

  if (!decoded.sub) {
    throw new UnauthorizedError("No user ID in token");
  }

  return decoded.sub;
}

export function getBearerToken(req: Request): string
{
  const bearerString = req.get("Authorization");
  if(!bearerString)
  {
    throw new UnauthorizedError("No token presented");
  }
  return bearerString.split(' ')[1];
}

export function makeRefreshToken(): string
{
  return randomBytes(32).toString('hex');
}

export function getRefreshToken(req: Request): string
{
  const refreshString = req.get("Authorization");
  if(!refreshString)
  {
    throw new UnauthorizedError("No token presented");
  }
  return refreshString.split(' ')[1];
}