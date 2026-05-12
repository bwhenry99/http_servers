import { db } from "../index.js";
import { NewChirp, chirps } from "../schema.js";
import { asc, eq, and } from "drizzle-orm";

export async function createChirp(chirp: NewChirp) {
  const [result] = await db
    .insert(chirps)
    .values(chirp)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function getChirps()
{
    const result = await db
        .select().from(chirps).orderBy(asc(chirps.createdAt));
    return result;
}

export async function getChirp(id: string)
{
    const [result] = await db
        .select().from(chirps).where(eq(chirps.id, id));
    return result;
}

export async function deleteChirp(id: string, userID: string) 
{
    const [deleted] = await db
        .delete(chirps)
        .where(eq(chirps.id, id))
        .returning();
    return deleted;
}