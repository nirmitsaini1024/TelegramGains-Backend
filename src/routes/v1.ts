import { Hono } from "hono";
import groupRoute from "./group.route.js";
import sessionRoute from "./session.route.js";
import publicGroupRoute from "./public-group.route.js";
import paddleWebhookRoute from "./paddle-webhook.route.js";
import statsRoute from "./stats.route.js";
import orderRoute from "./order.route.js";
import paypalRoute from "./paypal-payout.route.js";
import walletRoute from "./wallet.route.js";
import payoutHistoryRoute from "./payout-history.route.js";
import paypalWebhook from "./paypal-webhook.route.js";
import validatorCron from "./crons/validator.cron.js";
import paypalCronRoute from "./crons/paypal.cron.js";

const routes = new Hono();

// Protected Route - Dashboard
routes.route("/v1/dashboard", groupRoute);
routes.route("/v1/dashboard", statsRoute);
routes.route("/v1/dashboard", walletRoute);
routes.route("/v1/dashboard", payoutHistoryRoute);

// Protected Route - Payment
routes.route("/v1/dashboard/paypal", paypalRoute);

// Public Route - Groups for order
routes.route("/v1", publicGroupRoute);
routes.route("/v1", orderRoute); // For Thankyou page

// Public Route - Paddle webhook
routes.route("/v1/webhook", paddleWebhookRoute);
routes.route("/v1/webhook", paypalWebhook);

// Public Route - To get session on client side
routes.route("/v1/user", sessionRoute);

// Crons
routes.route("/v1/cron", validatorCron) // To ban user
routes.route("/v1/cron", paypalCronRoute)

export default routes;
