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

  // const USE_PROMISE_BASED_REBOOT = false;
  const USE_PROMISE_BASED_REBOOT = true;

  if (USE_PROMISE_BASED_REBOOT) {
    return new Promise((resolve, reject) => {
      console.log("Starting promise-based reboot...");

      sshConnection.on('error', (error) => {
        let errorMessage;

        if (error.code === "EHOSTUNREACH") {
          // host is completely down
          errorMessage = "Host is unreachable, device is offline.";
        }
        else if (error.code === "ECONNREFUSED") {
          // host actively refused SSH
          errorMessage = "Host refused SSH connection - is it already rebooting?";
        }
        else {
          errorMessage = "There was an error connecting to the host.";
        }

        let errorObject = createErrorResponseObject(errorMessage, error.code);
        sshConnection.end();
        // reject wrapping promise with error object, to be handled as arg for  
        //  the route handler's catch block 
        reject(errorObject);
      });

      sshConnection.on('ready', () => {
        console.log(`SSH Connection to '${connectionConfig.host}' established.`);
        // restart logic here

        sshConnection.exec('sudo reboot', (err, stream) => {
          if (err) {
            console.error(`Failed to reboot '${connectionConfig.host}':`, err);
            const errorString = "Failure while attemping to reboot host.";
            const errorObject = createErrorResponseObject(errorString, "REBOOTFAILURE");
            reject(errorObject);
          }
          else {
            console.log("Reached successful path on reboot");
            const successObject = {
              result: "success",
              message: "Successfully began reboot of host.",
            };

            resolve(successObject);
          }

          stream.on('data', (data) => {
            console.log(`Host STDOUT: ${data}`);
          });
  
          stream.stderr.on('data', (data) => {
            console.error(`Host STDERR: ${data}`);
          });
  
          stream.on('close', (code, signal) => {
            console.log(`Stream closed with code ${code}${signal ? `, signal ${signal}` : ""}.`);
            sshConnection.end();
            console.log(`SSH Connection to '${connectionConfig.host}' closed.`);
          });

          // sshConnection.end();
          // console.log(`SSH Connection to '${connectionConfig.host}' closed.`);
        });
      }).connect(connectionConfig); // actual connection happens here
    });
  }
  // original behavior, without promises
  else {
    // TODO: Handle errors so that server doesn't go down on an error response
    sshConnection.on('error', (error) => {
      // we want to handle: 
      // - error.code === "EHOSTUNREACH"
      //   - host was completely down
      // - error.code === "ECONNREFUSED"
      //   - host actively refused ssh (is in the process of rebooting) 
      let errorMessage;

      if (error.code === "EHOSTUNREACH") {
        // host is completely down
        errorMessage = "Host is unreachable, device is offline.";
      }
      else if (error.code === "ECONNREFUSED") {
        // host actively refused SSH
        errorMessage = "Host refused SSH connection - is it already rebooting?";
      }
      else {
        errorMessage = "There was an error connecting to the host.";
      }

      let errorObject = createErrorResponseObject(errorMessage, error.code);

      // How do I return this errorObject to the caller?

      /*
        In both cases, we want to  have the server not crash, but return
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
        console.log(`Attempting to reboot host at ${connectionConfig.host}...`);

        if (err) {
          console.error(`Failed to reboot '${connectionConfig.host}':`, err);
        }

        // TODO: Bring this to the promise-based code branch
        // BEGIN CODE ==============================================
        stream.on('data', (data) => {
          console.log(`Host STDOUT: ${data}`);
        });

        stream.stderr.on('data', (data) => {
          console.error(`Host STDERR: ${data}`);
        });

        stream.on('close', (code, signal) => {
          console.log(`Stream closed with code ${code}${signal ? `, signal ${signal}` : ""}.`);
          sshConnection.end();
          console.log(`SSH Connection to '${connectionConfig.host}' closed.`);
        });

        // END =====================================================

        // TODO: Remove this in the promise-based code branch
        // sshConnection.end();
        // console.log(`SSH Connection to '${connectionConfig.host}' closed.`);
      });
    }).connect(connectionConfig); // actual connection happens here
  }
}

export async function checkIfHostIsUp(piId) {
  const configObject = piConfig[piId];
  const { mdnsHostname: host, name: screenName } = configObject;

  const resultObject = {
    hostIsUp: false,
    message: `Host #${piId} (${screenName}) is down.`,
    name: screenName,
    piId: piId,
  };

  try {
    const res = await ping.promise.probe(host);
    
    if (res && res.alive) {
      resultObject.hostIsUp = true;
      resultObject.message = `Host #${piId} (${screenName}) is up`;
    }
    
    return resultObject;
  }
  catch (error) {
    console.error(`Error trying to ping host '${host}':`, error);
    resultObject.message = "Error trying top ping host, see error object in response.";
    resultObject.error = error;
    return resultObject;
  }
}
