import express from "express";

import { piConfig } from "../pi-conf.js";

// db access
import { getSettings,  updateSettings } from "../db/settings.js";
import { 
  createContent,
  deleteContent, 
  listContent, 
  getContentById,
  updateContent, 
} from "../db/content.js";


import {
  createErrorResponseObject,
  isValidPiConfigId,
  logTimestamp,
  parseAndCheckIdFromRequest,
} from "./utils.js";

// piController functions
import {
  checkIfHostIsUp,
  connectAndReboot,
  getHostStats,
  getHostUptime,
} from "../piController.js";

const router = express.Router();

// API routes
router.get('/reboot/:screenId', async (req, res) => {
  /*
    TODO: RETURN ALL RESPONSES AS JSON
    - This will allow your server to receive responses without a reload
  */
  const id = parseAndCheckIdFromRequest(req, res, "screenId");

  if (!checkIfIdIsNull(id, res)) return;
  if (!checkIfPiIdIsValidForConfig(id, piConfig, res)) return;

  // TODO: remove this flag and debug path
  const USE_REBOOT_FUNCTION = true;

  const configObject = piConfig[id];

  if (USE_REBOOT_FUNCTION) {
    console.log(`[${logTimestamp()}] Checking if Screen ${id} is up before reboot...`);

    const { hostIsUp } = await checkIfHostIsUp(id, "reboot");

    if (!hostIsUp) {
      const errorObject = createErrorResponseObject("Host can't be reached via ping", "BADHOSTPING");
      res.status(500).json(errorObject);
      console.error(`[${logTimestamp()}] Error rebooting Screen ${id}: host is not up.`);
      return;
    }

    console.log(`Attempting to reboot Screen ${id}:`, configObject);
    
    try {
      const sshResult = await connectAndReboot(id);
      console.log(`Completed reboot, here is sshResult:`, sshResult);
      res.json(sshResult);
    }
    catch (errorObject) {
      res.status(500).json(errorObject);
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
  const id = parseAndCheckIdFromRequest(req, res, "screenId");

  if (!checkIfIdIsNull(id, res)) return;
  if (!checkIfPiIdIsValidForConfig(id, piConfig, res)) return;

  const result = await checkIfHostIsUp(id, "ping");
  return res.json(result);
});

router.get('/uptime/:screenId', async (req, res) => {
  const id = parseAndCheckIdFromRequest(req, res, "screenId");

  if (!checkIfIdIsNull(id, res)) return;
  if (!checkIfPiIdIsValidForConfig(id, piConfig, res)) return;

  console.log(`[${logTimestamp()}] Received request for host ${id} uptime...`);

  const { hostIsUp } = await checkIfHostIsUp(id, "uptime");

  // TODO: Make function for this shared code?
  if (!hostIsUp) {
    const errorObject = createErrorResponseObject("Host can't be reached via ping", "BADHOSTPING");
    res.status(500).json(errorObject);
    console.error(`[${logTimestamp()}] Error getting uptime for Screen ${id}: host is not up.`);
    return;
  }

  try {
    const sshResult = await getHostUptime(id);
    console.log(`Completed uptime request, here is the result:`, sshResult);
    res.json(sshResult);
  }
  catch (errorObject) {
    res.status(500).json(errorObject);
  }

  return;
});

router.get('/stats/:screenId', async (req, res) => {
  const id = parseAndCheckIdFromRequest(req, res, "screenId");

  if (!checkIfIdIsNull(id, res)) return;
  if (!checkIfPiIdIsValidForConfig(id, piConfig, res)) return;

  console.log(`[${logTimestamp()}] Received request for host ${id} stats...`);

  const { hostIsUp } = await checkIfHostIsUp(id, "stats");

  if (!hostIsUp) {
    const errorObject = createErrorResponseObject("Host can't be reached via ping", "BADHOSTPING");
    res.status(500).json(errorObject);
    console.error(`[${logTimestamp()}] Error getting stats for Screen ${id}: host is not up.`);
    return;
  }

  try {
    const stats = await getHostStats(id);
    res.json(stats);
  }
  catch (errorObject) {
    res.status(500).json(errorObject);
  }

  return;
});


// Settings Routes
router.get('/settings', (req, res) => {
  res.json(getSettings());
});

router.patch('/settings', (req, res) => {
  // TODO: Probably needs logic for checking if the request body is alright

  // TODO: Remove logging after testing
  console.log("PATCH:/settings: received req.body:", req.body);
  
  res.json(updateSettings(req.body));
});


// Content Routes

// list all
router.get('/content', (req, res) => {
  res.json(listContent());
});

// get by id
router.get('/content/:contentId', (req, res) => {
  const id = parseAndCheckIdFromRequest(req, res, "contentId");
  if (!checkIfIdIsNull(id, res, "content")) return;
  res.json(getContentById(id));
});

// create content
router.post('/content', (req, res) => {
  // TODO: Remove logging after testing
  console.log("POST:/content: received req.body:", req.body);
  
  res.json(createContent(req.body));
});

// update content
router.patch('/content/:contentId', (req, res) => {
  // TODO: Remove logging after testing
  console.log("PATCH:/content: received req.body:", req.body);
  
  const id = parseAndCheckIdFromRequest(req, res, "contentId");
  if (!checkIfIdIsNull(id, res, "content")) return;
  res.json(updateContent(id, req.body));
});

// delete content
router.delete('/content/:contentId', (req, res) => {
  // TODO: Remove logging after testing
  console.log("DELETE:/content: received req.body:", req.body);
  
  const id = parseAndCheckIdFromRequest(req, res, "contentId");
  if (!checkIfIdIsNull(id, res, "content")) return;
  res.json(deleteContent(id));
});


// common helper code
/**
 * Checks whether a provided pi id is null and responds to the client with an 
 * appropriate error message.
 * @param {number|string} id the id to check 
 * @param {*} res the express response object
 * @returns boolean value fore whether or not the pi id is null
 */
function checkIfIdIsNull(id, res, idType) {
  if (id === null) {
    const errorString = `No ${idType ? idType + " " : ""}ID was provided.`;
    const errorObject = createErrorResponseObject(errorString, "NULLID");
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
