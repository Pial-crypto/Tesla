import bcrypt from "bcryptjs";
import { db } from "../prisma/db.ts";

async function signup({ name, email, password, role = "PASSENGER" }) {
  const normalizedEmail = email.toLowerCase();

  const existingUser = await db.orm.public.User
    .where({
      email: normalizedEmail,
    })
    .first();

  if (existingUser) {
    const error = new Error("email already registered");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await db.orm.public.User.create({
    name,
    email: normalizedEmail,
    passwordHash,
    role,
  });

  return user;
}

async function login({ email, password }) {
  const normalizedEmail = email.toLowerCase();

  const user = await db.orm.public.User
    .where({
      email: normalizedEmail,
    })
    .first();

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    const error = new Error("invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  return user;
}

export { signup, login };