export const productSeeds = [
  {
    name: 'Demo Product',
    quantity: 100,
    disabled: false,
  },
];

// Seeder implementation using domain package exports
import { getDbClient, products } from '@flash-sale/domain-core';

const seedData = async () => {
  const connectionString = process.env.DATABASE_CONNECTION_URL;
  if (!connectionString)
    throw new Error('DATABASE_CONNECTION_URL environment variable is required');

  const { db, queryClient } = getDbClient(connectionString, {
    logQueries: process.env.DATABASE_LOG_QUERIES === 'true',
  });

  try {
    console.log('Starting product seeding...');
    await db.transaction(async (tx) => {
      await tx.delete(products);
      await tx.insert(products).values(productSeeds);
    });
    console.log('Product seeding completed successfully!');
  } finally {
    await queryClient.end();
  }
};

try {
  await seedData();
} catch (err) {
  console.error('❌ Error seeding products:', err);
  process.exit(1);
}
