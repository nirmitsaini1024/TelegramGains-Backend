import { Hono } from "hono";
import { paypalV1AxiosInstance } from "../lib/axios/config.js";
import { generatePaypalAccessToken } from "../lib/paypal/utils.js";
import type { AuthSession } from "../lib/better-auth/auth-types.js";
import { Integration } from "../lib/database/model/integration.model.js";
import { randomBytes } from "crypto";
import { Payout } from "../lib/database/model/payout.model.js";
import { io } from "../index.js";
import { Wallet } from "../lib/database/model/wallet.model.js";

const paypalRoute = new Hono<AuthSession>();

paypalRoute.post("/payout", async (c) => {
  const user = c.get("user")!;
  const { amount } = await c.req.json();

  const recipient = randomBytes(10).toString("hex");

  const token = await generatePaypalAccessToken();

  const integration = await Integration.findOne({ owner: user.id });

  const wallet = await Wallet.findOne({ owner: user.id });

  if (!wallet) {
    throw "Server error. Please try again.";
  }

  if (!integration) {
    return c.json(
      {
        success: true,
        message: "Integrate paypal payout account before payout",
        result: null,
      },
      200
    );
  }

  const {
    paypal: { currency, email },
  } = integration;

  const { balance } = wallet;

  if (amount > balance) {
    return c.json(
      {
        success: true,
        message: `Insufficient balance. You have ${balance}`,
        result: null,
      },
      200
    );
  }

  const resPayoutCreate = await paypalV1AxiosInstance.post(
    "/payments/payouts",
    {
      sender_batch_header: {
        sender_batch_id: `batch-${recipient}`,
        email_subject: "You have a payout!",
      },
      items: [
        {
          recipient_type: "EMAIL",
          amount: {
            value: amount,
            currency: currency,
          },
          receiver: email,
          note: "Thank you for your service!",
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const payoutBatchId = resPayoutCreate.data.batch_header.payout_batch_id;

  // Get Batch item details
  const resPayoutDetails = await paypalV1AxiosInstance.get(
    `/payments/payouts/${payoutBatchId}?total_required=true`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const payoutItemId = resPayoutDetails.data.items[0].payout_item_id;
  const payoutItemStatus = resPayoutDetails.data.items[0].transaction_status;

  const payout = await Payout.create({
    owner: user.id,
    amount,
    paypal: {
      payout_batch_id: payoutBatchId,
      payout_item_id: payoutItemId,
    },
    status: payoutItemStatus,
  });

  io.to(user.id).emit("update-payout", "refetch");

  return c.json(
    { success: true, message: "Payout requested successful", result: payout },
    200
  );
});

paypalRoute.post("/connect", async (c) => {
  const user = c.get("user")!;
  const { email } = await c.req.json();

  let integration = await Integration.findOne({ owner: user.id });

  if (integration) {
    integration = await Integration.findOneAndUpdate(
      { owner: user.id },
      {
        paypal: {
          email: email,
        },
      },
      { new: true }
    );
  } else {
    integration = await Integration.create({
      owner: user.id,
      paypal: {
        email: email,
      },
    });
  }

  return c.json(
    { success: true, message: "Paypal connected!", result: integration },
    201
  );
});

paypalRoute.get("/connect", async (c) => {
  const user = c.get("user")!;

  const integration = await Integration.findOne({ owner: user.id });

  return c.json({ success: true, message: "", result: integration }, 200);
});

export default paypalRoute;
