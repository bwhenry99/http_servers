import { datetime } from "drizzle-orm/mysql-core";
import { db } from "../index.js";
import { NewRefresh, refresh_tokens } from "../schema.js";
import { eq, and, not } from "drizzle-orm";
import { timestamp } from "drizzle-orm/gel-core";

export async function createRefresh(token: NewRefresh) {
  const [result] = await db
    .insert(refresh_tokens)
    .values(token)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function verifyToken(token: string)
{
    const [tok] = await db.select()
        .from(refresh_tokens)
        .where(eq(refresh_tokens.token, token));
    if(tok)
        if(!tok.revoked_at)
            return true;
    return false;
}

export async function getUserFromToken(token: string)
{
    const [usr] = await db.select({userId: refresh_tokens.userId})
        .from(refresh_tokens)
        .where(eq(refresh_tokens.token, token));

    return usr.userId;
}

export async function revokeToken(token: string)
{
    await db.update(refresh_tokens)
        .set({revoked_at: new Date()})
        .where(eq(refresh_tokens.token, token));
}