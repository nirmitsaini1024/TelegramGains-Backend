import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { initBot } from "./bot/index.js";
import routes from "./routes/v1.js";
import errorHandler from "./middleware/error.middleware.js";
import db from "./lib/database/db.js";
import configCors from "./middleware/cors.middleware.js";
import { auth } from "./lib/better-auth/auth.js";
import addSession from "./middleware/session.middleware.js";
import sessionValidator from "./middleware/unauthorized-access.middleware.js";
import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { CLIENT_DOMAIN } from "./lib/env.js";

const app = new Hono();
const port = Number(process.env.PORT) || 8080;

// Middleware stack
app.use(logger());
app.use(addSession);
app.use(configCors);
app.use(sessionValidator);

app.onError(errorHandler);

// Database
db();

// Auth Route
app.on(["POST", "GET"], "/api/auth/**", (c) => {
  return auth.handler(c.req.raw);
});

// Main Route
app.get("/", (c) => c.text("Welcome to the Telegram Bot API!"));

// Routes
app.route("/api", routes);

// Telegram Bot
initBot();

const server = serve({
  fetch: app.fetch,
  port,
});

const io = new Server(server as HttpServer, {
  cors: {
    origin: CLIENT_DOMAIN,
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  },
});

// WebSocket Connection Setup
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join", (key) => {
    socket.join(key);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

export { io };
