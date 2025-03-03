import { Hono } from "hono";
import crypto from "crypto";
import CRC32 from "crc-32";
import fs from "fs/promises";
import { PAYPAL_WEBHOOK_ID } from "../lib/env.js";

const paypalWebhook = new Hono();

// Directory to cache PayPal certificates
const CACHE_DIR = "./cache";

// Ensure the cache directory exists
fs.mkdir(CACHE_DIR, { recursive: true }).catch((err) => {
  console.error("Failed to create cache directory:", err);
});

// PayPal Webhook Endpoint
paypalWebhook.post("/paypal", async (c) => {
  try {
    // Extract required headers
    const headers = c.req.header();
    const transmissionId = headers["paypal-transmission-id"];
    const timeStamp = headers["paypal-transmission-time"];
    const certUrl = headers["paypal-cert-url"];
    const signature = headers["paypal-transmission-sig"];

    // Validate headers
    if (!transmissionId || !timeStamp || !certUrl || !signature) {
      return c.json({ error: "Missing required PayPal headers" }, 400);
    }

    // Parse the raw event body
    const rawEvent = await c.req.text();
    const event = JSON.parse(rawEvent);

    console.log("Verifying PayPal webhook signature...");

    // Verify the signature
    const isSignatureValid = await verifySignature(rawEvent, {
      transmissionId,
      timeStamp,
      certUrl,
      signature,
    });

    if (!isSignatureValid) {
      console.error("Invalid signature for event:", event.id);
      return c.json({ error: "Invalid signature" }, 401);
    }

    console.log("Signature is valid. Processing event:", event.id);

    // Process the webhook event (e.g., update database, trigger workflows)
    await processWebhookEvent(event);

    // Return a 200 response to acknowledge receipt
    return c.text("OK", 200);
  } catch (error) {
    console.error("Error processing PayPal webhook:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Verify PayPal Webhook Signature
async function verifySignature(
  rawEvent: string,
  {
    transmissionId,
    timeStamp,
    certUrl,
    signature,
  }: {
    transmissionId: string;
    timeStamp: string;
    certUrl: string;
    signature: string;
  }
): Promise<boolean> {
  try {
    // Calculate CRC32 checksum of the raw event data
    const crc = CRC32.str(rawEvent)

    // Construct the message to verify
    const message = `${transmissionId}|${timeStamp}|${PAYPAL_WEBHOOK_ID}|${crc}`;

    // Download and cache the PayPal certificate
    const certPem = await downloadAndCache(certUrl, "paypal-cert");

    // Create a verification object
    const verifier = crypto.createVerify("SHA256");
    verifier.update(message);

    // Verify the signature
    return verifier.verify(certPem, Buffer.from(signature, "base64"));
  } catch (error) {
    console.error("Error verifying signature:", error);
    return false;
  }
}

// Download and Cache PayPal Certificates
async function downloadAndCache(url: string, cacheKey?: string): Promise<string> {
  if (!cacheKey) {
    cacheKey = url.replace(/\W+/g, "-");
  }
  const filePath = `${CACHE_DIR}/${cacheKey}.pem`;

  try {
    // Check if the certificate is already cached
    const cachedData = await fs.readFile(filePath, "utf-8");
    return cachedData;
  } catch {
    // Download the certificate if not cached
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download certificate from ${url}`);
    }
    const data = await response.text();

    // Cache the certificate
    await fs.writeFile(filePath, data);
    return data;
  }
}

// Process Webhook Event (Replace with your business logic)
async function processWebhookEvent(event: any): Promise<void> {
  console.log("Processing event:", event);
  
}

export default paypalWebhook;