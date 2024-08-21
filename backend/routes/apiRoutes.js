import express from "express";
import { Client } from "ssh2";

import { piConfig } from "../pi-conf.js";

import { 
  createErrorResponseObject,
  parseAndCheckScreenIdFromRequest,
  isValidPiConfigId,
} from "./utils.js";
import { connectAndReboot } from "../piController.js";

const router = express.Router();

// API routes
router.get('/reboot/:screenId', (req, res) => {
  /*
    TODO: RETURN ALL RESPONSES AS JSON
    - This will allow your server to receive responses without a reload
    - You could also have more robust **error handling** this way
  */

  // TODO: Remove dead code after refactor
  // const { screenId } = req.params;
  // const id = parseInt(screenId);

  // if (id === NaN) {
  //   const errorObject = createErrorResponseObject("Provided ID is not a number.");
  //   res.json(errorObject);
  //   return;
  // }
  const id = parseAndCheckScreenIdFromRequest(req, res);

  if (id === null) {
    return;
  }

  if (!isValidPiConfigId(piConfig, id)) {
    const errorObject = createErrorResponseObject("Provided ID doesn't correspond to a valid screen.");
    console.error()
    res.json(errorObject);
    return;
  }

  const USE_REBOOT_FUNCTION = true;
  const configObject = piConfig[id];

  if (USE_REBOOT_FUNCTION) {
    console.log(`Attempting to reboot Screen ${id}:`, configObject);
    res.send("Route /api/reboot/${id} triggering reboot of right coffee screen...");
    connectAndReboot(id);
    return;
  }
  // debug path, return corresponding object without reboot
  else {
    // for now, just return the corresponding object
    console.log(`Received reboot request for Screen ${id}:`, configObject);
    res.json(configObject);
  }
  return;
});

export default router;
