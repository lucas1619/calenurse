import { DataSource } from "typeorm"

export const myDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    schema: "public",
    username: "postgres",
    password: "123456",
    database: "calenurse2",
    entities: ["src/entity/*.ts"],
    migrations: ["migration/*.ts"],
    migrationsTableName: "migrations_typeorm",
    logging: true,
    synchronize: true,
})