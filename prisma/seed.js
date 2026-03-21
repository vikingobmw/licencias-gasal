const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // 1. Producto Base
  const gasal = await prisma.producto.upsert({
    where: { nombre: 'GASAL' },
    update: {},
    create: {
      nombre: 'GASAL',
    },
  });

  console.log('Producto base creado:', gasal);

  // 2. Licencia Demo
  const demoLicense = await prisma.licencia.upsert({
    where: { key: 'GASAL-DEMO-2026' },
    update: {
        productoId: gasal.id,
        activa: true,
        maxActivaciones: 5,
        maxAsociaciones: 3,
    },
    create: {
      key: 'GASAL-DEMO-2026',
      productoId: gasal.id,
      nombreUsuario: 'Usuario Demo',
      maxActivaciones: 5,
      maxAsociaciones: 3,
    },
  });

  console.log('Licencia demo creada:', demoLicense);

  // 3. Admin User (Gestor)
  const hashedPassword = await bcrypt.hash('gestor123', 10);
  const gestor = await prisma.admin.upsert({
    where: { username: 'gestor' },
    update: { password: hashedPassword },
    create: {
      username: 'gestor',
      password: hashedPassword,
    },
  });

  console.log('Usuario gestor creado:', gestor);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
