import express from "express";

const app = express();

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Dhaka Tesla Pool API is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});