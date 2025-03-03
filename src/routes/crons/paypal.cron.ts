import { Hono } from "hono";
import { Payout } from "../../lib/database/model/payout.model.js";
import { paypalV1AxiosInstance } from "../../lib/axios/config.js";
import { generatePaypalAccessToken } from "../../lib/paypal/utils.js";
import { io } from "../../index.js";
import { Wallet } from "../../lib/database/model/wallet.model.js";

const paypalCronRoute = new Hono();

paypalCronRoute.get("/paypal", async (c) => {
  const pendingPayouts = await Payout.find({ status: "PENDING" });

  const token = await generatePaypalAccessToken();

  for (const pendingPayout of pendingPayouts) {
    const payoutItemDetail = await paypalV1AxiosInstance.get(
      `/payments/payouts-item/${pendingPayout.paypal.payout_item_id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const payoutItemStatus = payoutItemDetail.data.transaction_status;

    await Payout.updateOne(
      { _id: pendingPayout._id },
      { status: payoutItemStatus }
    );

    if (payoutItemStatus === "SUCCESS") {
      await Wallet.updateOne(
        { owner: pendingPayout.owner },
        {
          $inc: {
            balance: -pendingPayout.amount,
            withdraw: pendingPayout.amount,
          },
        }
      );
    }

    io.to(pendingPayout.owner as string).emit("update-payout", "refetch");
    io.to(pendingPayout.owner as string).emit("update-wallet", "refetch");
  }

  return c.text("ok", 200);
});

export default paypalCronRoute;
