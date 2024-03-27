import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
async function main() {
  console.log("Start seeding");
  await prisma.user.create({
    data: {
      email: "test@gmail.com",
      name: "test",
    },
  });
  const userId = (await prisma.user.findFirst()).id;

  await prisma.post.createMany({
    data: new Array(1000).fill(0).map((_, index) => ({
      text: `Text ${index}`,
      userId,
    })),
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
