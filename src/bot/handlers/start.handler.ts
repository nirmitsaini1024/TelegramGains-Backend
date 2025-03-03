import type { SendMessageOptions } from "node-telegram-bot-api";
import bot from "../../lib/telegram/config.js";
import {
  JOIN_GROUP,
  REGISTER_GROUP,
} from "../../lib/telegram/utils/constants.js";

const replyKeyboard = {
  reply_markup: {
    keyboard: [
      [{ text: REGISTER_GROUP }, { text: JOIN_GROUP }], // Row 1
    ],
    resize_keyboard: true, // Adjust size
    one_time_keyboard: true, // Hide after selection
  },
} as SendMessageOptions;

export const startHandler = () => {
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, "Choose an option:", replyKeyboard);
  });
};
