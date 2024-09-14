import express from "express";

import { piConfig } from "../pi-conf.js";

import { 
  createErrorResponseObject,
  isValidPiConfigId,
  parseAndCheckScreenIdFromRequest,
} from "./utils.js";

// piController functions
import {
  checkIfHostIsUp, 
  connectAndReboot,
} from "../piController.js";

const router = express.Router();

// API routes
router.get('/reboot/:screenId', async (req, res) => {
  /*
    TODO: RETURN ALL RESPONSES AS JSON
    - This will allow your server to receive responses without a reload
  */
  const id = parseAndCheckScreenIdFromRequest(req, res);

  if (!checkIfPiIdIsNull(id, res)) return;
  if (!checkIfPiIdIsValidForConfig(id, piConfig, res)) return;

  // TODO: remove this flag and debug path
  const USE_REBOOT_FUNCTION = true;

  const configObject = piConfig[id];

  if (USE_REBOOT_FUNCTION) {
    console.log(`Checking if Screen ${id} is up before reboot...`);

    const { hostIsUp } = await checkIfHostIsUp(id);

    if (!hostIsUp) {
      const errorObject = createErrorResponseObject("Host can't be reached via ping", "BADHOSTPING");
      res.status(500).json(errorObject);
      console.error(`Error rebooting Screen ${id}: host is not up.`);
      return;
    }

    console.log(`Attempting to reboot Screen ${id}:`, configObject);
    
    // TODO: Activate this code branch
    // const USE_PROMISE_BASED_REBOOT = false;
    const USE_PROMISE_BASED_REBOOT = true;
    
    if (USE_PROMISE_BASED_REBOOT) {
      try {
        const sshResult = await connectAndReboot(id);
        console.log(`Completed promise-based reboot, here is sshResult:`, sshResult);
        res.json(sshResult);
      }
      catch (errorObject) {
        res.status(500).json(errorObject);
      }
    }
    else {
      connectAndReboot(id);
    }

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

router.get('/ping/:screenId', async (req, res) => {
  // check id validity here, as piController::checkIfHostIsUp could be called as a helper
  //  function by piController::connectAndReboot
  const id = parseAndCheckScreenIdFromRequest(req, res);

  if (!checkIfPiIdIsNull(id, res)) return;
  if (!checkIfPiIdIsValidForConfig(id, piConfig, res)) return;

  console.log(`Received request to check if host ${id} is up...`)

  const result = await checkIfHostIsUp(id);
  return res.json(result);
});


// common helper code
/**
 * Checks whether a provided pi id is null and responds to the client with an 
 * appropriate error message.
 * @param {number|string} id the id to check 
 * @param {*} res the express response object
 * @returns boolean value fore whether or not the pi id is null
 */
function checkIfPiIdIsNull(id, res) {
  if (id === null) {
    const errorObject = createErrorResponseObject("No screen ID was provided.", "NULLID");
    console.error(`Error with request:`, errorObject);
    res.status(500).json(errorObject);
    return false;
  }

  return true;
}

/**
 * Checks whether a provided pi id is valid for a provided pi config and responds
 * to the client with an appropriate error message
 * @param {number|string} id the id to check 
 * @param {Array} piConfig the array of config objects  
 * @param {*} res the express response object
 */
function checkIfPiIdIsValidForConfig(id, piConfig, res) {
  if (!isValidPiConfigId(piConfig, id)) {
    const errorString = "Provided ID doesn't correspond to a valid screen.";
    const errorObject = createErrorResponseObject(errorString, "INVALIDID");
    console.error(`Error with request:`, errorObject);
    res.status(500).json(errorObject);
    return false;
  }

  return true;
}

export default router;
