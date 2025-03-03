import TelegramBot from "node-telegram-bot-api";

const telegramToken = process.env.TELEGRAM_TOKEN || "";

const bot = new TelegramBot(telegramToken, { polling: true });

export default bot;
