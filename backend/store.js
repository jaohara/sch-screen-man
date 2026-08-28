/*
  store.js - a JSON config store for modifiable screen endpoints
*/

import { readFile, rename, mkdir, open } from 'node:fs/promises';
import { dirname } from 'node:path';

// TODO: Point this to the actual location after testing implementation 
// const ROUTE_CONFIG_PATH = 
//   process.env.SSM_ROUTE_CONFIG_PATH ?? '/var/lib/sch-screen-manager/route-config.js';
const ROUTE_CONFIG_PATH = './route-config.js';
const TMP_PATH = `${ROUTE_CONFIG_PATH}.tmp`;
const BAK_PATH = `${ROUTE_CONFIG_PATH}.bak`;

/*
  We'll use the route config to store named endpoints for each of the Screens. Each screen
  will also have a schedule config that allows for per-hour overrides of the default. 

  Example Route Config:

  {
    "revision": 1,
    "endpoints": {
      "mez-1-default": {
        "label": "Mezzanine One Default",
        "url": "https://...",
      },
      "mez-2-default": {
        "label": "Mezzanine Two Default",
        "url": "https://...",
      },
      "mez-1-promo": {
        "label": "Mezzanine One Happy Hour",
        "url": "https://..."
      }
    }
    "screens": {
      "mez-1": {
        "default": "mez-1-default",
        "schedule": { 
          [
            {
              "start": 16:00,
              "end": 18:00,
              "endpoint": "mez-1-promo",
            },
          ]
        }
      },
      "mez-2": {
        //...
      },
      // ...
    }
  }
*/

const DEFAULT_ROUTE_CONFIG = {
  revision: 0,
  endpoints: {},
  screens: {},
};


let cache = null;

// ==================
// Storage Validation
// ==================

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.status = 400;
  }
}

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

function validate(routeConfig) {
  if (!routeConfig || typeof routeConfig !== 'object') {
    throw new ValidationError('Route config must be an object');
  }

  const endpoints = routeConfig.endpoints ?? {};
  const screens = routeConfig.screens ?? {};

  // validate URLS
  for (const [id, endpoint] of Object.entries(endpoints)) {
    if (!endpoint?.url) {
      throw new ValidationError(`Endpoint ${id} has no url.`);
    }
    
    try {
      new URL(endpoint.url);
    } 
    catch {
      throw new ValidationError(`Endpoint ${id} has an invalid url.`);
    }
  }

  // TODO: RESUME HERE
}

function deepFreeze(obj) {
  for (const value of Object.values(obj)) {
    if (value && typeof value === 'object') {
      deepFreeze(value);
    }
  }

  return Object.freeze(obj);
}

// ============
// Writing Data
// ============

async function atomicWrite(obj) {
  const dir = dirname(ROUTE_CONFIG_PATH);
  const json = `${JSON.stringify(obj, null, 2)}\n`;

  const tmpFile = await open(TMP_PATH, "w");

  // write json to temp file
  try {
    await tmpFile.write(json, 'utf8');
    await tmpFile.sync();
  }
  finally {
    await tmpFile.close();
  }

  // make a backup of the current config
  await rename(ROUTE_CONFIG_PATH, BAK_PATH).catch((err) => {
    if (err.code !== "ENOENT") throw err;
  });

  // swap the current temp in place of the original
  await rename(TMP_PATH, ROUTE_CONFIG_PATH);

  // fsync the directory 
  const dirHandle = await open(dir, 'r');

  try {
    await dirHandle.sync();
  }
  finally {
    await dirHandle.close();
  }
}

// ==========
// Public API
// ==========

// call once and await the response before app.listen()
export async function load() {
  await mkdir(dirname(ROUTE_CONFIG_PATH), { recursive: true });

  for (const path of [ROUTE_CONFIG_PATH, BAK_PATH]) {
    try {
      const parsedJson = validate(JSON.parse(await readFile(path, 'utf8')));
      cache = deepFreeze(parsedJson);

      // If this crashed mid-swap last time, promote the backup to primary
      if (path === BAK_PATH) {
        await atomicWrite(parsedJson);
      }
    }
    catch (err) {
      if (err.code !== "ENOENT") {
        console.error(`store: ignoring unusuable ${path}:`, err.message);
      }
    }
  }
}