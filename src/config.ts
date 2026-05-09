import type { MigrationConfig } from "drizzle-orm/migrator";

process.loadEnvFile();

function dbValidate(): string
{
    if(process.env.DB_URL)
    {
        return process.env.DB_URL;
    }

    throw Error("NO DB Defined")
}

function platformValidate(): string
{
    if(process.env.PLATFORM)
    {
        return process.env.PLATFORM;
    }

    throw Error("NO Platform Defined")
}

const migrationConfig: MigrationConfig = {
  migrationsFolder: "./src/db/migrations",
};

type DbConfig = {
    dbURL: string;
    migrationConfig: MigrationConfig;
}

type APIConfig = {
    fileserverHits: number;
    platform: string;
    dbConfig: DbConfig;
}

export const config: APIConfig = {
    fileserverHits: 0,
    platform: platformValidate(),
    dbConfig: {
        dbURL: dbValidate(),
        migrationConfig: migrationConfig
    }
};