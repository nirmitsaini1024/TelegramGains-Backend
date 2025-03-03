import { Hono } from "hono";
import { Transaction } from "../lib/database/model/transaction.model.js";
import { Customer } from "../lib/database/model/customer.model.js";

const orderRoute = new Hono();

orderRoute.get("/order/:key", async (c) => {
  const key = c.req.param("key");

  const transaction = await Transaction.findOne({ anonymous_key: key });

  const customer = await Customer.findOne({ anonymous_key: key });

  const result = { customer, transaction };

  return c.json({ success: true, result }, 200);
});

export default orderRoute;
