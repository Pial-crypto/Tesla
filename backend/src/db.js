import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "./prisma/db.ts";


async function migrateAndSeed() {
  console.log("Starting database seed...");


  const existingUser = await db.orm.public.User
    .where({
      email: "jashim@oitesla.test",
    })
    .first();

  if (existingUser) {
    console.log("Seed data already exists. Skipping seed.");
    return;
  }

 
  const passwordHash = await bcrypt.hash("password123", 10);

  // Create Jashim
  const jashim = await db.orm.public.User.create({
    data: {
      name: "Jashim",
      email: "jashim@oitesla.test",
      passwordHash,
      role: "DRIVER",
    },
  });


  await db.orm.public.User.create({
    data: {
      name: "Nusrat",
      email: "nusrat@oitesla.test",
      passwordHash,
      role: "PASSENGER",
    },
  });

  await db.orm.public.User.create({
    data: {
      name: "Rafiq",
      email: "rafiq@oitesla.test",
      passwordHash,
      role: "PASSENGER",
    },
  });

  await db.orm.public.User.create({
    data: {
      name: "Shirin",
      email: "shirin@oitesla.test",
      passwordHash,
      role: "PASSENGER",
    },
  });

  // Create Bullet Tesla
  await db.orm.public.Vehicle.create({
    data: {
      name: "Bullet",
      driverId: jashim.id,
      capacity: 3,
    },
  });

  console.log("Database seed completed successfully.");
}

export { migrateAndSeed };