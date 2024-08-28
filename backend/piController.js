// this module defines and exports functions for connecting and
//  issuing commands to the networked Pis. It is imported by the 
//  appropriate modules in `./routes/`.
import { Client } from "ssh2";
import ping from "ping";
import { piConfig } from "./pi-conf.js";

import { 
  createErrorResponseObject,
  isValidPiConfigId,
} from "./routes/utils.js";

/**
 * Connects to a Pi via SSH and triggers a reboot.
 * 
 * @param {number} piId the id of the pi in the array defined in pi-conf.js. 
 */
export async function connectAndReboot(piId) {
  console.log(`connectAndReboot: received piId of '${piId}'`);

  const sshConnection = new Client();
  const configObject = piConfig[piId];

  const connectionConfig = {
    host: configObject.mdnsHostname,
    // TODO: Should this be put in a top-level constants file?
    port: 22,
    username: configObject.username,
    password: configObject.password,
  };

  // TODO: Handle errors so that server doesn't go down on an error response
  sshConnection.on('error', (error) => {
    // we want to handle: 
    // - error.code === "EHOSTUNREACH"
    //   - host was completely down
    // - error.code === "ECONNREFUSED"
    //   - host actively refused ssh (is in the process of rebooting) 

    /*
      In both cases, we want to have the server not crash, but return
      an error object to the frontend client that explains a bit more.

      We also want to have some failsafes before we reach these points -
      the backend should ping the host in question (maybe via a "checkIfHostIsUp")
    */

    // TODO: create error objs with createErrorResponseObject and return with
    //  return res.json(errorObject);
  });

  sshConnection.on('ready', () => {
    console.log(`SSH Connection to '${connectionConfig.host}' established.`);
    // restart logic here

    sshConnection.exec('sudo reboot', (err, stream) => {
      // TODO: Maybe use stream for something here? 

      if (err) {
        console.error(`Failed to reboot '${connectionConfig.host}':`, err);
      }

      sshConnection.end();
      console.log(`SSH Connection to '${connectionConfig.host}' closed.`);
    });
    // close ssh connection
  }).connect(connectionConfig); // actual connection happens here
}

export async function checkIfHostIsUp(piId) {
  const configObject = piConfig[piId];
  const { mdnsHostname: host } = configObject;

  try {
    const res = await ping.promise.probe(host);
    
    if (res && res.alive) {
      return true;
    }
    
    return false;
  }
  catch (error) {
    console.error(`Error trying to ping host '${host}':`, error);
    return false;
  }
}
