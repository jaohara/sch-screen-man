import express from "express";
const router = express.Router();

// API routes
router.get('/restart/:screenId', (req, res) => {
  const { screenId } = req.params;

  // TODO: Where do import my array of screens from? Should I have screens.js or something
  //  similar, and then manually input the IPs?

  // also, how do I use the SSH keys?

  res.send(`Route /api/restart/ reached with a screenId of ${screenId}.`);
});

export default router;
