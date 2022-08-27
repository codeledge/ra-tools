import type { NextApiRequest, NextApiResponse } from "next";
import { apiHandler } from "../../middlewares/apiHandler";
import { Prisma } from "@prisma/client";
import { getDMMF } from "@prisma/internals";

export default apiHandler(
  async (req: NextApiRequest, res: NextApiResponse, auth) => {
    const tables = Object.keys(Prisma.ModelName);
    const dmmf = await getDMMF({
      datamodel: `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Post {
  id         Int       @id @default(autoincrement())
  categoryId Int? /// dasdfas
  userId     String //asdf
  text       String ///@owner(test)
  createdAt  DateTime  @default(now())
  updatedAt  DateTime? @updatedAt
  user       User      @relation(fields: [userId], references: [id])
  tags       Tag[]
  category   Category? @relation(fields: [categoryId], references: [id], onDelete: NoAction, onUpdate: NoAction)
  ///@hidden

}

model Tag {
  id        Int       @id @default(autoincrement())
  name      String
  createdAt DateTime  @default(now())
  updatedAt DateTime? @updatedAt
  posts     Post[]
}

model Category {
  id                 Int        @id @default(autoincrement())
  name               String
  parentCategoryId   Int?
  //@admin
  createdAt          DateTime   @default(now())
  updatedAt          DateTime?  @updatedAt
  childrenCategories Category[] @relation("SubCategories")
  parentCategory     Category?  @relation("SubCategories", fields: [parentCategoryId], references: [id], onDelete: NoAction, onUpdate: NoAction)
  Post               Post[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id            String        @id @default(cuid())
  name          String?
  email         String?       @unique
  emailVerified DateTime?
  image         String?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime?     @updatedAt
  post          Post[]
  accounts      Account[]
  sessions      Session[]
  settings      UserSettings?
}

model UserSettings {
  id       String @id @default(cuid())
  userId   String @unique
  user     User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  language String
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model AdminAccount {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user AdminUser @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model AdminSession {
  id           String    @id @default(cuid())
  sessionToken String    @unique
  userId       String
  expires      DateTime
  user         AdminUser @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model AdminUser {
  id            String         @id @default(cuid())
  name          String?
  email         String?        @unique
  emailVerified DateTime?
  image         String?
  role          Role?
  accounts      AdminAccount[]
  sessions      AdminSession[]
  audit         Audit[]
}

model AdminVerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model Audit {
  id       String     @id @default(cuid())
  date     DateTime   @default(now())
  resource String
  action   String
  payload  Json?
  authorId String?
  author   AdminUser? @relation(fields: [authorId], references: [id], onDelete: Cascade)
}

enum Role {
  COLLABORATOR
  OWNER
  READER
}
`,
    });
    const models = dmmf.datamodel.models;
    res.json(models);
    // let output = "";
    // for (const model of models) {
    //   output += `<Resource
    //     name="${model.name}"
    //     list=`;
    //   for (const field of model.fields) {
    //     if (field.type === "String")
    //       output += `<TextInput source="${field.name}" />\n`;
    //     output += `  ${field.name} ${field.type}\n`;
    //   }
    //   output += `}\n`;
    // }

    // res.send(output);

    // res.json(tables);
  }
);
