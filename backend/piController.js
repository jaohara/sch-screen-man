// this module defines and exports functions for connecting and
//  issuing commands to the networked Pis. It is imported by the 
//  appropriate modules in `./routes/`.
import { Client } from "ssh2";
import piConfig from "./pi-conf.js";



/**
 * Connects to a Pi via SSH and triggers a reboot.
 * 
 * @param {number} piId the id of the pi in the array defined in pi-conf.js. 
 */
export function connectAndReboot(piId) {
  // TODO: Should this be a string for the host? Is there a better way? 
  //  Unique indices in the config array?
  console.log(`connectAndReboot: received piId of '${piId}'`);

  const sshConnection = new Client();

  // hardcoded mez screen config
  const connectionConfig = {
    // host: 'mez-bar1',
    host: 'togo2',
    port: 22,
    username: 'pi',
    // password: 'voivod'
    // password: 'voi42vod'
    password: 'voivod'
  };

  sshConnection.on('ready', () => {
    console.log(`SSH Connection to '${connectionConfig.host}' established.`);
    // restart logic here

    sshConnection.exec('sudo reboot', (err, stream) => {
      // TODO: Maybe use stream for something here? 

      if (err) {
        console.error(`Failed to reboot '${connectionConfig.host}':`, err);
      }

      sshConnection.end();
    });
    // close ssh connection
  }).connect(connectionConfig);
}
