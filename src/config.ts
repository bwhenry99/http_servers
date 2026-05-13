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

function secretValidate(): string
{
    if(process.env.SECRET)
    {
        return process.env.SECRET;
    }

    throw Error("NO Platform Defined")
}

function polkaValidate(): string
{
    if(process.env.POLKA_KEY)
    {
        return process.env.POLKA_KEY;
    }

    throw Error("No Polka Key")
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
    secret: string;
    polka_key: string;
    dbConfig: DbConfig;
}

export const config: APIConfig = {
    fileserverHits: 0,
    platform: platformValidate(),
    secret: secretValidate(),
    polka_key: polkaValidate(),
    dbConfig: {
        dbURL: dbValidate(),
        migrationConfig: migrationConfig
    }
};