const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./src/routes/authRoutes");
const vendorRoutes = require("./src/routes/vendorRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    message: "Vendor Management System API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth/login",
      vendors: "/api/vendors",
      hierarchy: "/api/vendors/hierarchy",
    },
  });
});

// Mount API routes
app.use("/api/auth", authRoutes);
app.use("/api/vendors", vendorRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Not Found",
    message: `Cannot ${req.method} ${req.path}`,
  });
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      details: err,
    }),
  });
});

app.listen(PORT, () => {});

module.exports = app;
