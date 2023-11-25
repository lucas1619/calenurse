import { config } from 'dotenv';
import { DataSource } from "typeorm"

config();

export const myDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_DATABASE || 'calenurse',
    entities: ["./entity/*.js"],
    migrations: ["./migration/*.js"],
    migrationsTableName: "migrations_typeorm",
    logging: true,
    synchronize: true,
});