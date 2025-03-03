import { Hono } from "hono";
import type { AuthSession } from "../lib/better-auth/auth-types.js";
import { Group, type IGroup } from "../lib/database/model/group.model.js";
import paddle from "../lib/paddle/config.js";
import { PADDLE_PRODUCT_ID } from "../lib/env.js";

const groupRoute = new Hono<AuthSession>();

groupRoute.get("/groups", async (c) => {
  const user = c.get("user");

  const groups = await Group.find({ owner: user!.id }).sort({ createdAt: -1 });

  return c.json(
    {
      success: true,
      message: "User groups have been successfully retrieved.",
      result: groups,
    },
    200
  );
});

groupRoute.post("/groups", async (c) => {
  const user = c.get("user");
  const { body } = await c.req.json();

  const priceToUpdate = (Number(body.price) * 100).toString();

  const groupInfo = await Group.findOne({ _id: body.id });

  if (!groupInfo) {
    throw "Something went wrong. Please try again.";
  }

  let isPriceAvail: any;
  let updatedGroup: IGroup | null;

  try {
    isPriceAvail = await paddle.prices.get(groupInfo.price_id);
  } catch (error) {
    console.log("Price is not exist. Let's create a new price here");
  }

  if (isPriceAvail) {
    const price = await paddle.prices.update(groupInfo.price_id, {
      unitPrice: {
        amount: priceToUpdate,
        currencyCode: "USD",
      },
    });

    updatedGroup = await Group.findOneAndUpdate(
      { _id: body.id },
      {
        price: body.price,
        price_id: price.id,
      },
      { new: true }
    );
  } else {
    const price = await paddle.prices.create({
      name: `Price for ${groupInfo?.name}`,
      productId: PADDLE_PRODUCT_ID,
      billingCycle: {
        interval: "month",
        frequency: 1,
      },
      taxMode: "external",
      description: `Created by user ${user?.email}`,
      unitPrice: {
        amount: priceToUpdate,
        currencyCode: "USD",
      },
      quantity: {
        minimum: 1,
        maximum: 9999999,
      },
    });

    updatedGroup = await Group.findOneAndUpdate(
      { _id: body.id },
      {
        price: body.price,
        price_id: price.id,
      },
      { new: true }
    );
  }

  return c.json(
    {
      success: true,
      message: "Group has been updated successfully",
      result: updatedGroup,
    },
    200
  );
});

groupRoute.delete("/groups/:id", async (c) => {
  const id = c.req.param("id");

  await Group.deleteOne({ _id: id });

  return c.json(
    {
      success: true,
      message: "Group has been deleted successfully",
      result: id,
    },
    200
  );
});

export default groupRoute;
