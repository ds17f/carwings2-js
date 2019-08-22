import winston from "winston";
import config from "./config";
import { sleep } from "../utils";

import { createSession } from "../carwings";

const POLL_RESULT_INTERVAL = 10000;
const POLL_LIMIT = 10;

const logger = winston;
winston.configure({
  level: "info",
  format: winston.format.simple(),
  transports: [new winston.transports.Console()]
});

const session = createSession(config.username, config.password);
session
  .connect()
  .catch(er => {
    logger.error(`failed: ${er}`);
  })
  .then(async () => {
    // TODO: Snapshot the last update time, then run until that time changes
    await session.leafRemote.requestUpdate();
    /* eslint-disable no-await-in-loop */
    for (let i = 0; i < POLL_LIMIT; i += 1) {
      await sleep(1000);
      const batteryStatus = await session.leafRemote.getLatestBatteryStatus();
      logger.warn(`Battery Status: ${JSON.stringify(batteryStatus, null, 2)}`);
      logger.warn(`Sleeping for ${POLL_RESULT_INTERVAL} seconds`);
      await sleep(POLL_RESULT_INTERVAL);
    }
  });