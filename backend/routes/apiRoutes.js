import express from "express";

import { piConfig } from "../pi-conf.js";

// db access
import { getSettings,  updateSettings } from "../db/settings.js";

import { 
  createContent,
  deleteContent, 
  listContent,
  listContentWithRelations,
  getContentById,
  getContentByIdWithRelations,
  updateContent, 
} from "../db/content.js";

import {
  createScreen,
  deleteScreenById,
  getScreenById,
  getScreenByHostname,
  listScreens,
  updateScreen,
} from "../db/screens.js";

import {
  createScreenSchedule,
  deleteScreenSchedule,
  getScreenScheduleById,
  getScreenSchedulesByContentId,
  getScreenSchedulesByScreenId,
  listScreenSchedules,
  updateScreenSchedule,
} from "../db/screenSchedules.js";

import {
  createScreenGroup,
  deleteScreenGroup,
  getScreenGroupById,
  getScreenGroupByName,
  listScreenGroups,
  updateScreenGroup,
} from "../db/screenGroups.js";

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
  // res.json(listContent());
  res.json(listContentWithRelations());
});

// list all without appending screens
router.get('/content/raw', (req, res) => {
  res.json(listContent());
});

// get by id without appending screens
router.get('/content/raw/:contentId', (req, res) => {
  const id = parseAndCheckIdFromRequest(req, res, "contentId");
  if (!checkIfIdIsNull(id, res, "content")) return;
  res.json(getContentById(id));
});

// get by id
router.get('/content/:contentId', (req, res) => {
  const id = parseAndCheckIdFromRequest(req, res, "contentId");
  if (!checkIfIdIsNull(id, res, "content")) return;
  res.json(getContentByIdWithRelations(id));
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
  const id = parseAndCheckIdFromRequest(req, res, "contentId");
  if (!checkIfIdIsNull(id, res, "content")) return;
  res.json(deleteContent(id));
});


// Screen Routes

// list all screens
router.get('/screens', (req, res) => {
  res.json(listScreens());
});

// get screen by hostname
router.get('/screens/hostname/:hostname', (req, res) => {
  // TODO: Should have some check for a valid hostname, right?
  const { hostname } = req.params;
  res.json(getScreenByHostname(hostname));
});

// get screen by DB id
// TODO: Uses DB screen ID, not the one from the pi-conf array approach
router.get('/screens/id/:screenId', (req, res) => {
  const id = parseAndCheckIdFromRequest(req, res, "screenId");
  if (!checkIfIdIsNull(id, res, "screen")) return;
  res.json(getScreenById(id));
});

// create screen
router.post('/screens', (req, res) => {
  // TODO: Remove logging after testing
  console.log("POST:/screens: received req.body:", req.body);
  res.json(createScreen(req.body));
});

// update screen
router.patch('/screens/id/:screenId', (req, res) => {
  const id = parseAndCheckIdFromRequest(req, res, "screenId");
  if (!checkIfIdIsNull(id, res, "screen")) return;
  
  // TODO: Remove logging after testing
  console.log(`PATCH:/screens/id/${id}: received req.body:`, req.body);
  
  res.json(updateScreen(id, req.body));
});

// delete screen by db id
router.delete('/screens/id/:screenId', (req, res) => {
  const id = parseAndCheckIdFromRequest(req, res, "screenId");
  if (!checkIfIdIsNull(id, res, "screen")) return;
  res.json(deleteScreenById(id));
});


// screenSchedules routes

// list all screen schedules
router.get('/schedules', (req, res) => {
  res.json(listScreenSchedules());
});

// get screen schedule by db id
router.get('/schedules/id/:scheduleId', (req, res) => {
  const id = parseAndCheckIdFromRequest(req, res, "scheduleId");
  if (!checkIfIdIsNull(id, res, "schedule")) return;
  res.json(getScreenScheduleById(id));
});

// get screen schedules by screen id
router.get('/schedules/screen/:screenId', (req, res) => {
  const id = parseAndCheckIdFromRequest(req, res, "screenId");
  if (!checkIfIdIsNull(id, res, "screen")) return;
  res.json(getScreenSchedulesByScreenId(id));
});

// get screen schedules by content id
router.get('/schedules/content/:contentId', (req, res) => {
  const id = parseAndCheckIdFromRequest(req, res, "contentId");
  if (!checkIfIdIsNull(id, res, "content")) return;
  res.json(getScreenSchedulesByContentId(id));
});

// create screen schedule
router.post('/schedules', (req, res) => {
  // TODO: Remove logging after testing
  console.log("POST:/schedules: received req.body:", req.body);
  res.json(createScreenSchedule(req.body));
});

// update screen schedule
router.patch('/schedules/id/:scheduleId', (req, res) => {
  const id = parseAndCheckIdFromRequest(req, res, "scheduleId");
  if (!checkIfIdIsNull(id, res, "schedule")) return;

  // TODO: Remove logging after testing
  console.log(`PATCH:/schedules/id/${id}: received req.body:`, req.body);

  res.json(updateScreenSchedule(id, req.body));
});

// delete screen schedule by db id
router.delete('/schedules/id/:scheduleId', (req, res) => {
  const id = parseAndCheckIdFromRequest(req, res, "scheduleId");
  if (!checkIfIdIsNull(id, res, "schedule")) return;
  res.json(deleteScreenSchedule(id));
});


// screenGroups routes

// list all screen groups
router.get('/groups', (req, res) => {
  const excludeEmpty = req.query.excludeEmpty !== "false";
  const excludeHidden = req.query.excludeHidden === "true";
  res.json(listScreenGroups(excludeEmpty, excludeHidden));
});

// get screen group by name
router.get('/groups/name/:name', (req, res) => {
  const { name } = req.params;
  res.json(getScreenGroupByName(name));
});

// get screen group by db id
router.get('/groups/id/:groupId', (req, res) => {
  const id = parseAndCheckIdFromRequest(req, res, "groupId");
  if (!checkIfIdIsNull(id, res, "group")) return;
  res.json(getScreenGroupById(id));
});

// create screen group
router.post('/groups', (req, res) => {
  // TODO: Remove logging after testing
  console.log("POST:/groups: received req.body:", req.body);
  res.json(createScreenGroup(req.body));
});

// update screen group
router.patch('/groups/id/:groupId', (req, res) => {
  const id = parseAndCheckIdFromRequest(req, res, "groupId");
  if (!checkIfIdIsNull(id, res, "group")) return;

  // TODO: Remove logging after testing
  console.log(`PATCH:/groups/id/${id}: received req.body:`, req.body);

  res.json(updateScreenGroup(id, req.body));
});

// delete screen group by db id
router.delete('/groups/id/:groupId', (req, res) => {
  const id = parseAndCheckIdFromRequest(req, res, "groupId");
  if (!checkIfIdIsNull(id, res, "group")) return;
  res.json(deleteScreenGroup(id));
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
