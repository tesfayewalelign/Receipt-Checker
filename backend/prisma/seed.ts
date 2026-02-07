import prisma from "../src/config/database";

async function main() {
  await prisma.bank.createMany({
    data: [
      { name: "Commercial Bank of Ethiopia", code: "CBE" },
      { name: "TeleBirr", code: "TELEBIRR" },
    ],
    skipDuplicates: true,
  });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
