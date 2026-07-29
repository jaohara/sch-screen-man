import express from "express";
import cors from "cors";

import apiRoutes from './routes/apiRoutes.js';

const app = express();
const port = 3000;

// TODO: Add local test IPs as necessary
const corsOriginArray = [
  "http://localhost:5173",
  "http://192.168.1.46:5173",
];


// configure CORS 
app.use(cors({
  // TODO: REPLACE WHEN BACKEND SERVES BUILT FRONTEND WITHOUT VITE
  origin: corsOriginArray,
}))

// use the router defined in ./routes/apiRoutes.js to handle api-relevant routes
app.use('/api', apiRoutes);

// serve static files from ./public
app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Express server listening at http://localhost:${port}`);
});
