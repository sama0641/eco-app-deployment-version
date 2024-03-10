require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const csrf = require("csurf");
const cookieParser = require("cookie-parser");
// const https = require("https");
const fs = require("fs");

const connectWithDatabase = require("./utils/database-connection");
//Route imports
const authRoutes = require("./routes/auth-route");
const forumRoutes = require("./routes/forum-route");
const userRoutes = require("./routes/user-route");
const adminRoutes = require("./routes/admin-route");

//Connecting with database
connectWithDatabase();

//Making request usable
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/uploads")));
app.use(
  cors({
    origin: [
      "https://localhost:5173",
      "http://localhost:5173",
      "https://web.postman.co",
    ],
    methods: "GET, POST, PUT, DELETE, PATCH",
    credentials: true,
  })
);

// CSRF protection
const csrfProtection = csrf({
  cookie: {
    httpOnly: true, // Help prevent XSS attacks
  },
});

app.use(csrfProtection);

//SSL/TLS encryption
// const options = {
//   key: fs.readFileSync("server.key"),
//   cert: fs.readFileSync("server.cert"),
// };

// Include CSRF Token in Response Headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Headers", "CSRF-Token");
  res.header("CSRF-Token", req.csrfToken());
  next();
});

// Authentication Routes (Signup, Login )
app.use("/api", authRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/forum", userRoutes);
app.use("/api/admin", adminRoutes);

// Endpoint to get CSRF token
app.get("/api/csrf-token", (req, res) => {
  console.log("Token asked");
  return res.json({ csrfToken: req.csrfToken() });
});

// Test route
app.get("/api/test", (req, res, next) => {
  return res.json({
    message: "Success",
  });
});

app.use(express.static(path.join(__dirname, "./client/dist")));
app.get("*", (req, res, next) => {
  res.sendFile(path.join(__dirname, "./client/dist/index.html"));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    // CSRF token validation failed
    return res.status(403).json({
      success: false,
      status: 403,
      message: "CSRF token validation failed",
    });
  }

  const statusCode = err.status || 500;
  const message = err.message || "Something went wrong";
  return res.status(statusCode).json({
    success: false,
    status: statusCode,
    message,
  });
});

// Creating server
const SERVERPORT = process.env.SERVERPORT || 3000;
// const server = https.createServer(options, app);

mongoose.connection.once("open", () => {
  app.listen(SERVERPORT, () => {
    console.log(`Server running on http://localhost:${SERVERPORT}`);
  });
});

mongoose.connection.on("error", () => {
  console.log(
    "Probably due to connection with the database server, Server closed"
  );
  process.exit(1);
});
