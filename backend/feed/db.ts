import { SQLDatabase } from "encore.dev/storage/sqldb";

export const feedDB = new SQLDatabase("feed", {
  migrations: "./migrations",
});
