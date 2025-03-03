import { assignGroup } from "./handlers/assign.handler.js";
import { keyVerify } from "./handlers/key.handler.js";
import { sendMessage } from "./handlers/message.handler.js";
import { rulesHandler } from "./handlers/rules.handler.js";
import { startHandler } from "./handlers/start.handler.js";

export const initBot = () => {
  // Register Handlers
  startHandler();
  sendMessage()
  rulesHandler()
  assignGroup()
  keyVerify()
};
