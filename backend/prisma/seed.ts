import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create a demo user with password for testing login
  const demoEmail = 'demo@bahiago.com';
  const demoPassword = 'Demo123!';
  const existingUser = await prisma.user.findUnique({ where: { email: demoEmail } });
  if (!existingUser) {
    const hash = await bcrypt.hash(demoPassword, 10);
    await prisma.user.create({
      data: {
        email: demoEmail,
        passwordHash: hash,
        role: 'ADMIN',
      },
    });
    console.log(`Demo user created: ${demoEmail} / ${demoPassword}`);
  } else {
    console.log(`Demo user already exists: ${demoEmail}`);
  }

  // Create sample boats
  const boats = [
    {
      name: 'Yate de Lujo',
      type: 'yacht',
      description: 'Yate elegante para eventos especiales',
      price: 500.0,
      pricePerDay: 500.0,
      location: 'Cartagena',
      capacity: 10,
      imageUrl: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      ]),
      published: true,
    },
    {
      name: 'Lancha Rápida',
      type: 'speedboat',
      description: 'Lancha deportiva para aventuras',
      price: 150.0,
      pricePerDay: 150.0,
      location: 'Cartagena',
      capacity: 6,
      imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      ]),
      published: true,
    },
    {
      name: 'Jetski Azul',
      type: 'jetski',
      description: 'Jetski para diversión acuática',
      price: 50.0,
      pricePerDay: 50.0,
      location: 'Cartagena',
      capacity: 1,
      imageUrl: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?auto=format&fit=crop&w=1200&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      ]),
      published: true,
    },
  ];

  for (const boat of boats) {
    await prisma.boat.create({ data: boat });
  }

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });