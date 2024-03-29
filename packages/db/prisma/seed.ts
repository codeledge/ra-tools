import { prismaClient } from "./prismaClient";
import {
  array,
  seriesAll,
  randomEmail,
  randomFullName,
  randomParagraph,
  randomName,
} from "deverything";

async function main() {
  await prismaClient.category.createMany({
    data: array(100, () => ({
      name: randomName(),
    })),
  });

  const parents = await prismaClient.category.findMany({ take: 20 });
  const children = await prismaClient.category.findMany({ take: 20, skip: 20 });

  for (const [index, child] of Object.entries(children)) {
    await prismaClient.category.update({
      where: { id: child.id },
      data: {
        parentCategoryId: parents[index].id,
      },
    });
  }

  // Use seriesAll as createMany does not support nested create
  await seriesAll(
    array(100, (_, index) => {
      return () =>
        prismaClient.user.create({
          data: {
            email: randomEmail(),
            name: randomFullName(),
            settings: {
              create: {
                language: "en",
              },
            },
            post: {
              create: array(100, () => {
                return {
                  text: randomParagraph(),
                  tags: {
                    create: array(5, () => ({
                      name: randomName(),
                    })),
                  },
                  category: {
                    connect: {
                      id: children[index % 20].id,
                    },
                  },
                };
              }),
            },
          },
        });
    })
  );
}

main()
  .then(async () => {
    await prismaClient.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prismaClient.$disconnect();
    process.exit(1);
  });
