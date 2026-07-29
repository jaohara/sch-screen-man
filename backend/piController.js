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

  // TODO: Could I take out this SSH code to avoid reuse with other SSH functions (getUptime)?
  //   - is this worth it? The usage is trivial and doing this doesn't offer much for me

  const sshConnection = new Client();
  const configObject = piConfig[piId];

  const connectionConfig = {
    host: configObject.mdnsHostname,
    // TODO: Should this be put in a top-level constants file?
    port: 22,
    username: configObject.username,
    password: configObject.password,
  };

  return new Promise((resolve, reject) => {
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
      });
    }).connect(connectionConfig); // actual connection happens here
  });
}


export async function getHostUptime(piId) {
  const sshConnection = new Client();
  const configObject = piConfig[piId];

  // const hostCommand = 'uptime';
  const hostCommand = 'cat /proc/uptime';

  const connectionConfig = {
    host: configObject.mdnsHostname,
    port: 22,
    username: configObject.username,
    password: configObject.password,
  };

  return new Promise((resolve, reject) => {
    sshConnection.on('error', (error) => {
      console.error(`SSH Connection error: `, error);
      const errorString = "SSH Connection error";
      const errorObject = createErrorResponseObject(errorString, "SSHCONNERROR");
      reject(errorObject);
    });

    sshConnection.on('ready', () => {
      sshConnection.exec(hostCommand, (err, stream) => {
        if (err) {
          console.error(`Failed to get uptime for '${connectionConfig.host}:`, err);
          const errorString = "Failure while trying to get uptime from host.";
          const errorObject = createErrorResponseObject(errorString, "UPTIMEFAILURE");
          reject(errorObject);
        }

        let commandOutput = "";

        stream.on('data', (data) => {
          // data is passed in as an ssh2 buffer, which is the binary data output of the command
          const uptimeResult = data.toString().split(" ")[0];
          commandOutput += uptimeResult;
        });

        stream.stderr.on('data', (data) => {
          console.error(`Host STDERR: ${data}`);
          // TODO: Maybe don't reject here? No guarantee output to STDERR is an outright error
          // reject(data.toString());
        });

        stream.on('close', (code, signal) => {
          console.log(`Stream closed with code ${code}${signal ? `, signal ${signal}` : ""}.`);
          sshConnection.end();
          console.log(`SSH Connection to '${connectionConfig.host}' closed.`);
          resolve(commandOutput.trim());
        });
      });
    }).connect(connectionConfig);
  });
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
