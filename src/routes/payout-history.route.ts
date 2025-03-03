import { Hono } from "hono";
import type { AuthSession } from "../lib/better-auth/auth-types.js";
import { Payout } from "../lib/database/model/payout.model.js";

const payoutHistoryRoute = new Hono<AuthSession>();

payoutHistoryRoute.get("/payout-history", async (c) => {
  const user = c.get("user")!;

  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);

  const payout = await Payout.find({
    owner: user.id,
    createdAt: { $gte: last7Days },
  });

  return c.json({ success: true, message: "", result: payout });
});

export default payoutHistoryRoute;
