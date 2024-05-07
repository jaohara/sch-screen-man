import express from "express";
import { Client } from "ssh2";

import { connectAndReboot } from "../piController.js";

const router = express.Router();

// API routes
router.get('/restart/:screenId', (req, res) => {
  const { screenId } = req.params;

  // hardcoded right coffee screen test
  if (screenId === '420') {
    // console.log("Testing Right togo/coffee screen restart...");
    console.log("Testing left mez screen restart...");
    // res.send("Route /api/restart/420 triggering reboot of left mez screen...");
    res.send("Route /api/restart/420 triggering reboot of right coffee screen...");

    connectAndReboot(420);

    return;
  }

  // TODO: Where do import my array of screens from? Should I have screens.js or something
  //  similar, and then manually input the IPs?

  // also, how do I use the SSH keys?

  res.send(`Route /api/restart/ reached with a screenId of ${screenId}.`);
});

export default router;
