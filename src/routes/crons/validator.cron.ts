import { Hono } from "hono";
import { Subscription } from "../../lib/database/model/subscription.model.js";
import { Group } from "../../lib/database/model/group.model.js";
import { removeUserFromGroup } from "../../lib/telegram/utils/index.js";

const validatorCron = new Hono();

validatorCron.get("/ban-user", async (c) => {
  const subscriptions = await Subscription.find({ status: "canceled" });

  for (const subscription of subscriptions) {
    const group = await Group.findOne({ _id: subscription.of_group });

    if (!group) {
      return c.text("error", 404);
    }

    await removeUserFromGroup(group.group_id, subscription.telegram_user_id);
  }

  return c.text("ok", 200);
});

export default validatorCron;
