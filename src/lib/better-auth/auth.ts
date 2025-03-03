import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import client from "./db.js";
import {
  CLIENT_DOMAIN,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
} from "../env.js";
import { createAuthMiddleware } from "better-auth/api";
import db from "../database/db.js";
import { Wallet } from "../database/model/wallet.model.js";
import { ObjectId } from "mongodb";

const dbClient = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(dbClient),
  trustedOrigins: [CLIENT_DOMAIN],
  socialProviders: {
    google: {
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    },
  },
  hooks: {
    after: createAuthMiddleware(async (c) => {
      const newSession = c.context.newSession;
      const user = newSession?.user;

      if (newSession && user) {
        try {
          await db();

          const isWalletAvail = !!(await Wallet.findOne({ owner: user.id }));

          if (isWalletAvail) {
            return;
          }

          const wallet = await Wallet.create({
            owner: user.id,
          });

          const userCollection = dbClient.collection("user");

          await userCollection.updateOne(
            {
              _id: new ObjectId(user.id),
            },
            {
              $set: { wallet: wallet._id },
            }
          );
        } catch (error) {
          console.log(
            "Error in creating subscription in auth before hook: ",
            error
          );

          throw c.redirect("/sign-in");
        }
      }
    }),
  },
  appName: "Group Gains",
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
    },
  },
});
