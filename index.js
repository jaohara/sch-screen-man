import express from "express";

import apiRoutes from './routes/apiRoutes.js';

const app = express();
const port = 3000;

// use the router for the API Routes on /api
app.use('/api', apiRoutes);

// serve static files from `./public`
app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Express server listening at http://localhost:${port}`);
});
