import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  await prisma.bank.upsert({
    where: { code: "CBE" },
    update: {},
    create: {
      name: "Commercial Bank of Ethiopia",
      code: "CBE",
    },
  });

  console.log("✅ Seeded CBE bank");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
