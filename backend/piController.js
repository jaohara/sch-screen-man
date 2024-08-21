// this module defines and exports functions for connecting and
//  issuing commands to the networked Pis. It is imported by the 
//  appropriate modules in `./routes/`.
import { Client } from "ssh2";
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
export function connectAndReboot(piId) {
  // TODO: Should this be a string for the host? Is there a better way? 
  //  Unique indices in the config array?
  console.log(`connectAndReboot: received piId of '${piId}'`);

  // unnecessary path - reboot route function already checks if the id is valid
  // if (!isValidPiConfigId(piId)) {
  //   //bad path, log error and return null
  //   console.error(`connectAndReboot:: '${piId}' is not a valid pi id.`);

  //   const errorObject = createErrorResponseObject("Provided ID is not valid", "INVALID_ID");
  //   // unfinished from this point
  // }

  const sshConnection = new Client();

  // TODO: Remove this and build from piConfig
  //  - are the properties from the objs in pi-conf similarly named, or do i 
  //    need to build the object here?
  // hardcoded mez screen config
  // const oldConnectionConfig = {
  //   // host: 'mez-bar1',
  //   host: 'togo2',
  //   port: 22,
  //   username: 'pi',
  //   // password: 'voivod'
  //   // password: 'voi42vod'
  //   password: 'voivod'
  // };

  const configObject = piConfig[piId];

  const connectionConfig = {
    host: configObject.mdnsHostname,
    // TODO: Should this be put in a top-level constants file?
    port: 22,
    username: configObject.username,
    password: configObject.password,
  };

  // TODO: Handle errors so that server doesn't go down on an error response
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
  }).connect(connectionConfig);
}

export function pingScreenHost(piId) {
  // TODO: Build this function

  // - grab the configObject for the specified pi from the piConfig 
  // - do a ping operation and return the status to the caller
  // - 

  // considerations:
  // - should this be able to be called by connectAndReboot() to prevent reboot
  //   attempts while the host is down?
  // - should the ping code itself be pulled out into another function that this 
  //   one calls?
}
