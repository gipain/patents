require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

const { sequelize } = require("./models");
const routes = require("./routes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api", routes);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build", "index.html"));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Внутрішня помилка сервера",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Маршрут не знайдено" });
});

// Start server
const startServer = async () => {
  try {
    // Sync database - force: false to not recreate tables
    await sequelize.sync({ force: false });
    console.log("✅ База даних синхронізована");

    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║   Інформаційно-пошукова система центру НТІ та патентів     ║
╠════════════════════════════════════════════════════════════╣
║   🚀 Сервер запущено на порту: ${PORT}                          ║
║   📍 API: http://localhost:${PORT}/api                          ║
║   🌐 Режим: ${
        process.env.NODE_ENV || "development"
      }                                ║
╚════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error("❌ Помилка запуску сервера:", error);
    process.exit(1);
  }
};

startServer();
