import { Hono } from "hono";
import type { AuthSession } from "../lib/better-auth/auth-types.js";

const sessionRoute = new Hono<AuthSession>();

sessionRoute.get("/session", async (c) => {
  const session = c.get("session");
  const user = c.get("user");

  if (!user) return c.body(null, 401);

  return c.json(
    {
      session,
      user,
    },
    200
  );
});

export default sessionRoute