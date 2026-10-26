import { PGlite } from "@electric-sql/pglite";
import { defineRelations } from "drizzle-orm";
import * as p from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/pglite";

export const users = p.pgTable("users", {
  id: p.serial().primaryKey(),
  name: p.text().notNull(),
  email: p.text().notNull(),
  age: p.integer(),
  isActive: p.boolean("is_active").notNull().default(true),
  meta: p.jsonb(),
  created_at: p.timestamp().notNull().defaultNow(),
});

export const posts = p.pgTable("posts", {
  id: p.serial().primaryKey(),
  title: p.text().notNull(),
  tags: p.text().array().notNull().default([]),
  authorId: p.integer("author_id").references(() => users.id),
  publishedAt: p.timestamp("published_at"),
  deletedAt: p.timestamp("deleted_at"),
});

export const auditLogs = p.pgTable("audit_logs", {
  id: p.serial().primaryKey(),
  action: p.text().notNull(),
  resource: p.text().notNull(),
  payload: p.jsonb().notNull(),
  authorId: p.text("author_id").notNull(),
  date: p.timestamp().notNull().defaultNow(),
});

export const schema = { users, posts, auditLogs };

export const relations = defineRelations(schema, (r) => ({
  users: {
    posts: r.many.posts(),
  },
  posts: {
    author: r.one.users({
      from: r.posts.authorId,
      to: r.users.id,
    }),
  },
}));

const createDatabase = async () => {
  const client = new PGlite();
  await client.exec(`
    create table users (
      id serial primary key,
      name text not null,
      email text not null,
      age integer,
      is_active boolean not null default true,
      meta jsonb,
      created_at timestamp not null default now()
    );
    create table posts (
      id serial primary key,
      title text not null,
      tags text[] not null default '{}',
      author_id integer references users(id),
      published_at timestamp,
      deleted_at timestamp
    );
    create table audit_logs (
      id serial primary key,
      action text not null,
      resource text not null,
      payload jsonb not null,
      author_id text not null,
      date timestamp not null default now()
    );
    insert into users (name, email, age, is_active, meta) values
      ('Alice', 'alice@example.com', 30, true, '{"plan":"pro","prefs":{"theme":"dark"}}'),
      ('Bob', 'bob@example.com', 25, false, '{"plan":"free"}'),
      ('Carol', 'carol@example.com', null, true, null),
      ('alfred', 'alfred@example.com', 41, true, '{"plan":"pro"}');
    insert into posts (title, tags, author_id, published_at) values
      ('Hello Drizzle', '{orm,sql}', 1, '2026-01-01'),
      ('Second post', '{sql}', 1, null),
      ('Bob writes', '{misc}', 2, '2026-02-01'),
      ('Orphan', '{}', null, '2026-03-01');
  `);
  return drizzle({ client, relations });
};

export type DemoDb = Awaited<ReturnType<typeof createDatabase>>;

const globalForDb = globalThis as typeof globalThis & {
  drizzleDemo?: Promise<DemoDb>;
};

export const getDatabase = () => {
  globalForDb.drizzleDemo ??= createDatabase();
  return globalForDb.drizzleDemo;
};
