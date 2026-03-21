const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.licencia.update({
    where: { key: 'GASAL-DEMO-2026' },
    data: { initialPassword: 'initial-pass-123' }
  });
  console.log('Password set for GASAL-DEMO-2026');
}

main().catch(console.error).finally(() => prisma.$disconnect());
