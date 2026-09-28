import express from "express";
import { migrateAndSeed } from "./db.js";
import driverRoutes from "./routes/driver.routes.js";
import authRoutes from "./routes/auth.routes.js";
import errorMiddleware from "./middleware/error.middleware.js";
import rideRoutes from "./routes/ride.routes.js";
import cors from "cors";
const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://tesla-seven-mocha.vercel.app",
    ],
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use(errorMiddleware);
app.use("/api/rides", rideRoutes);
app.use("/api/driver", driverRoutes);
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
