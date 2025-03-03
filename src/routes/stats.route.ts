import { Hono } from "hono";
import type { AuthSession } from "../lib/better-auth/auth-types.js";
import { Group } from "../lib/database/model/group.model.js";
import { Customer } from "../lib/database/model/customer.model.js";
import { Transaction } from "../lib/database/model/transaction.model.js";

const statsRoute = new Hono<AuthSession>();

statsRoute.get("/overview", async (c) => {
  const user = c.get("user")!;

  const last30Days = new Date();
  const last7Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);
  last7Days.setDate(last7Days.getDate() - 7);

  // 1. Calculate Total Revenue from Groups
  const groups = await Group.find({
    owner: user.id,
    createdAt: { $gte: last30Days },
  });
  const earnings = groups.reduce((sum, group) => sum + group.revenue, 0);

  // 2. Count Transactions in the Last 30 Days
  const transactionCount = await Transaction.find({
    owner: user.id,
    createdAt: { $gte: last7Days },
  }).countDocuments();

  const transactionDetails = await Transaction.find({
    owner: user.id,
    createdAt: { $gte: last7Days },
  }).sort({ createdAt: -1 });

  // 3. Count Customers in the Last 30 Days
  const customerCount = await Customer.find({
    owner: user.id,
    createdAt: { $gte: last7Days },
  }).countDocuments();

  const customerDetails = await Customer.find({
    owner: user.id,
    createdAt: { $gte: last7Days },
  }).sort({ createdAt: -1 });

  // Format Results
  const result = {
    earnings: earnings || 0,
    totalCustomers: customerCount || 0,
    customerDetails: customerDetails || [],
    totalTransactions: transactionCount || 0,
    transactionDetails: transactionDetails || [],
  };

  return c.json({ status: true, message: "", result }, 200);
});

export default statsRoute;
