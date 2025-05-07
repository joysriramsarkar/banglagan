'use server';

import { seedDatabase } from '@/services/bangla-song-database';

export async function handleSeedDatabase() {
  try {
    console.log("Attempting to seed database from Server Action...");
    await seedDatabase();
    console.log("Database seeding initiated or completed.");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
