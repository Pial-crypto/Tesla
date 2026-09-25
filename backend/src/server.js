import express from "express";
import { migrateAndSeed } from "./db.js";
import authRoutes from "./routes/auth.routes.js";
import errorMiddleware from "./middleware/error.middleware.js";

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use(errorMiddleware);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Dhaka Tesla Pool API is running",
  });
});

const PORT = process.env.PORT || 5000;

migrateAndSeed()
  .then(() => {
    console.log("Database migration and seeding completed.");
    app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
  })
  .catch((error) => {
    console.error("Error during database migration and seeding:", error);
  });
