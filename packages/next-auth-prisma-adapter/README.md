# Next Auth + Prisma 🤝

You want to have 2 instances of next-auth writing on the same database? (and in different tables)

No problem - a dead simple adapter for Prisma that lets you override the model names.

## How to use it

install it

```
pnpm i next-auth-prisma-adapter
```

open you `schema.prisma` and add the models you need

```prisma
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
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime? @updatedAt
  post          Post[]
  accounts      Account[]
  sessions      Session[]
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
}

model AdminVerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

enum Role {
  COLLABORATOR
  OWNER
  READER
}
```

Run a migration `npx prisma migrate dev`

You can now override in your second app the model names:

```js
import { PrismaAdapter } from "next-auth-prisma-adapter";
import { prismaClient } from "path/to/your/client";
...

  return await NextAuth(req, res, {
    ...
    adapter: PrismaAdapter(prismaClient, {
      userModel: "adminUser",
      accountModel: "adminAccount",
      sessionModel: "adminSession",
      verificationTokenModel: "adminVerificationToken",
    }),
    ...
```

wohoo!

### License

MIT
