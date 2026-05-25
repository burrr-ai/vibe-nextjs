import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const configTable = sqliteTable('config', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  label: text('label').notNull(),
  description: text('description').notNull(),
  value: text('value').notNull(),
});
