import { DataSource } from "typeorm"

export const myDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "root",
    database: "calenurse",
    entities: ["./entity/*.js"],
    migrations: ["./migration/*.js"],
    migrationsTableName: "migrations_typeorm",
    logging: true,
    synchronize: true,
})