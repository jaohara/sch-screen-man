import express from "express";
import { Client } from "ssh2";

import piConfig from "../pi-conf.js";

import { createErrorResponseObject } from "./utils.js";
import { connectAndReboot } from "../piController.js";

const router = express.Router();

const isValidPiConfigId = (id) => id >= 0 && id < piConfig.length;

// API routes
router.get('/restart/:screenId', (req, res) => {
  /*
    TODO: RETURN ALL RESPONSES AS JSON
    - This will allow your server to receive responses without a reload
    - You could also have more robust **error handling** this way
  */

  const { screenId } = req.params;
  const id = parseInt(screenId);

  if (id === NaN) {
    const errorObject = createErrorResponseObject("Provided ID is not a number.");
    res.json(errorObject);
    return;
  }

  if (!isValidPiConfigId(id)) {
    const errorObject = createErrorResponseObject("Provided ID doesn't correspond to a valid screen.");
    res.json(errorObject);
    return;
  }

  // hardcoded screen reboot test
  // if (id === '420') {
  if (false) {
    // console.log("Testing left mez screen restart...");
    console.log("Testing Right togo/coffee screen restart...");
    // res.send("Route /api/restart/420 triggering reboot of left mez screen...");
    res.send("Route /api/restart/420 triggering reboot of right coffee screen...");
    connectAndReboot(420);
    return;
  }

  // Good path
  // for now, just return the corresponding object
  const configObject = piConfig[id];
  res.json(configObject);
  return;
});

export default router;
