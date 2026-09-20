/*
  store.js - a JSON config store for modifiable screen endpoints
*/

import { readFile, rename, mkdir, open } from 'node:fs/promises';
import { dirname } from 'node:path';

// TODO: Point this to the actual location after testing implementation 
// const ENDPOINT_CONFIG_PATH = 
//   process.env.SSM_ENDPOINT_CONFIG_PATH ?? '/var/lib/sch-screen-manager/endpoint-config.json';
const ENDPOINT_CONFIG_PATH = './endpoint-config.json';
const TMP_PATH = `${ENDPOINT_CONFIG_PATH}.tmp`;
const BAK_PATH = `${ENDPOINT_CONFIG_PATH}.bak`;

/*
  We'll use the route config to store named endpoints for each of the Screens. Each screen
  will also have a schedule config that allows for per-hour overrides of the default. 

  Example Endpoint Config:

  {
    "revision": 1,
    "endpoints": {
      "mez-1-default": {
        "label": "Mezzanine One Default",
        "url": "https://..."
      },
      "mez-2-default": {
        "label": "Mezzanine Two Default",
        "url": "https://..."
      },
      "mez-1-promo": {
        "label": "Mezzanine One Happy Hour",
        "url": "https://..."
      }
    },
    "screens": {
      "mez-1": {
        "default": "mez-1-default",
        "schedule": [
          {
            "start": "16:00",
            "end": "18:00",
            "endpoint": "mez-1-promo",
          },
        ]
      },
      "mez-2": {
        //...
      },
      // ...
    }
  }
*/

const DEFAULT_ENDPOINT_CONFIG = {
  revision: 0,
  endpoints: {},
  screens: {},
};


let cache = null;
let writeChain = Promise.resolve();

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

function validate(endpointConfig) {
  if (!endpointConfig || typeof endpointConfig !== 'object') {
    throw new ValidationError('Endpoint config must be an object');
  }

  const endpoints = endpointConfig.endpoints ?? {};
  const screens = endpointConfig.screens ?? {};

  // validate endpoint URLS
  for (const [id, endpoint] of Object.entries(endpoints)) {
    if (!endpoint?.url) {
      throw new ValidationError(`Endpoint ${id} has no url.`);
    }
    
    try {
      const parsedUrl = new URL(endpoint.url);
      
      if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
        throw new ValidationError(`Endpoint ${id} must be http or https.`);
      }
    } 
    catch {
      throw new ValidationError(`Endpoint ${id} has an invalid url.`);
    }
  }

  // fn to check if endpoint references exist, throws ValidationError if not
  const checkEndpoint = (endpointRef, configLocation) => {
    if (endpointRef !== null && endpointRef !== undefined && !(endpointRef in endpoints)) {
      throw new ValidationError(
        `${configLocation} references unknown endpoint "${endpointRef}"`
      );
    }
  }

  // validate screen configs, checking if endpoints and times are valid
  for (const [id, screen] of Object.entries(screens)) {
    if (!screen.default) {
      throw new ValidationError(`screen "${id}" has no default endpoint.`)
    }

    checkEndpoint(screen.default, `screen "${id}" default`);

    //check scheduled endpoints
    for (const slot of screen.schedule ?? []) {
      checkEndpoint(slot.endpoint, `screen "${id}" schedule`);

      // validate times
      if (!TIME_REGEX.test(slot.start ?? '') || !TIME_REGEX.test(slot.end ?? '')) {
        throw new ValidationError(`screen "${id}" has a slot with a bad time (should be HH:MM)`);
      }
    }
  }

  return endpointConfig;
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
  const dir = dirname(ENDPOINT_CONFIG_PATH);
  const json = `${JSON.stringify(obj, null, 2)}\n`;

  const tmpFile = await open(TMP_PATH, "w");

  // write json to temp file
  try {
    await tmpFile.writeFile(json, 'utf8');
    await tmpFile.sync();
  }
  finally {
    await tmpFile.close();
  }

  // make a backup of the current config
  await rename(ENDPOINT_CONFIG_PATH, BAK_PATH).catch((err) => {
    if (err.code !== "ENOENT") throw err;
  });

  // swap the current temp in place of the original
  await rename(TMP_PATH, ENDPOINT_CONFIG_PATH);

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
  await mkdir(dirname(ENDPOINT_CONFIG_PATH), { recursive: true });

  for (const path of [ENDPOINT_CONFIG_PATH, BAK_PATH]) {
    try {
      const parsedJson = validate(JSON.parse(await readFile(path, 'utf8')));
      cache = deepFreeze(parsedJson);

      // If this crashed mid-swap last time, promote the backup to primary
      if (path === BAK_PATH) {
        await atomicWrite(parsedJson);
      }

      return cache;
    }
    catch (err) {
      if (err.code !== "ENOENT") {
        console.error(`store: ignoring unusuable ${path}:`, err.message);
      }
    }
  }

  // create a default config if one doesn't exist
  cache = deepFreeze(structuredClone(DEFAULT_ENDPOINT_CONFIG));
  await atomicWrite(cache);
  console.warn(`store: wrote a fresh config to ${ENDPOINT_CONFIG_PATH}`);
  return cache;
}

// Read cached config data in another module.
// Synchronous and frozen, safe to call on every poll.
export function read() {
  if (!cache) {
    throw new Error("store: config hasn't finished loading");
  }

  return cache;
}

// Update the config 
export function update(mutate) {
  const result = writeChain.then(async () => {
    const draft = structuredClone(cache);
    const next = validate(mutate(draft) ?? draft);

    next.revision = (cache.revision ?? 0) + 1;

    await atomicWrite(next);
    cache = deepFreeze(next);

    return cache;
  });

  // keep the chain alive after a rejection, or else every later write will also fail
  writeChain = result.then(
    () => {},
    () => {},
  );

  return result;
}
