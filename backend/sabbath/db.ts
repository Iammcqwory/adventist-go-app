import { SQLDatabase } from "encore.dev/storage/sqldb";

export const sabbathDB = new SQLDatabase("sabbath", {
  migrations: "./migrations",
});
