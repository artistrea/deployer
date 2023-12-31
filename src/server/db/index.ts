import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { env } from "~/env";
import * as schema from "./schema";
import { registerService } from "~/utils/registerService";

const connection = await mysql.createConnection({
  uri: env.DATABASE_URL,
});

export const db = registerService("db", () =>
  drizzle(connection, { schema: schema, mode: "default" }),
);
