// this module defines and exports functions for connecting and
//  issuing commands to the networked Pis. It is imported by the 
//  appropriate modules in `./routes/`.
import { Client } from "ssh2";
import ping from "ping";
import { piConfig } from "./pi-conf.js";

import {
  createErrorResponseObject,
  isValidPiConfigId,
  logTimestamp,
} from "./routes/utils.js";

const CONNECTION_ERROR_MESSAGES = {
  EHOSTUNREACH: "Host is unreachable, device is offline.",
  ECONNREFUSED: "Host refused SSH connection - is it already rebooting?",
};

/**
 * Runs a single command over a fresh SSH connection to the given Pi.
 *
 * @param {number} piId the id of the pi in the array defined in pi-conf.js.
 * @param {string} command the shell command to execute on the host.
 * @param {object} [options]
 * @param {boolean} [options.waitForClose] when true (default), resolves with the
 *   accumulated stdout once the stream closes. Set false for commands that may
 *   sever the connection themselves (e.g. `sudo reboot`), where waiting for a
 *   clean close is unreliable - resolves as soon as exec() accepts the command instead.
 * @param {() => object} [options.onAccepted] builds the resolved value when
 *   waitForClose is false.
 * @param {string} [options.execFailureMessage]
 * @param {string} [options.execFailureErrorType]
 * @returns {Promise<string|object>}
 */
function runSshCommand(piId, command, {
  waitForClose = true,
  onAccepted = () => ({ result: "success" }),
  execFailureMessage = "Failure while executing command on host.",
  execFailureErrorType = "SSHEXECFAILURE",
} = {}) {
  const sshConnection = new Client();
  const configObject = piConfig[piId];

  const connectionConfig = {
    host: configObject.mdnsHostname,
    port: 22,
    username: configObject.username,
    password: configObject.password,
  };

  return new Promise((resolve, reject) => {
    sshConnection.on('error', (error) => {
      const errorMessage = CONNECTION_ERROR_MESSAGES[error.code] ?? "There was an error connecting to the host.";
      const errorObject = createErrorResponseObject(errorMessage, error.code);
      sshConnection.end();
      // reject wrapping promise with error object, to be handled as arg for
      //  the route handler's catch block
      reject(errorObject);
    });

    sshConnection.on('ready', () => {
      console.log(`SSH Connection to '${connectionConfig.host}' established.`);

      sshConnection.exec(command, (err, stream) => {
        if (err) {
          console.error(`Failed to run command on '${connectionConfig.host}':`, err);
          reject(createErrorResponseObject(execFailureMessage, execFailureErrorType));
          return;
        }

        if (!waitForClose) {
          resolve(onAccepted());
        }

        let commandOutput = "";

        stream.on('data', (data) => {
          commandOutput += data.toString();
        });

        stream.stderr.on('data', (data) => {
          console.error(`Host STDERR: ${data}`);
        });

        stream.on('close', (code, signal) => {
          console.log(`Stream closed with code ${code}${signal ? `, signal ${signal}` : ""}.`);
          sshConnection.end();
          console.log(`SSH Connection to '${connectionConfig.host}' closed.`);

          if (waitForClose) {
            resolve(commandOutput);
          }
        });
      });
    }).connect(connectionConfig); // actual connection happens here
  });
}

/**
 * Connects to a Pi via SSH and triggers a reboot.
 *
 * @param {number} piId the id of the pi in the array defined in pi-conf.js.
 */
export function connectAndReboot(piId) {
  console.log(`connectAndReboot: received piId of '${piId}'`);

  return runSshCommand(piId, 'sudo reboot', {
    waitForClose: false,
    onAccepted: () => ({ result: "success", message: "Successfully began reboot of host." }),
    execFailureMessage: "Failure while attemping to reboot host.",
    execFailureErrorType: "REBOOTFAILURE",
  });
}

export async function getHostUptime(piId) {
  const rawOutput = await runSshCommand(piId, 'cat /proc/uptime', {
    execFailureMessage: "Failure while trying to get uptime from host.",
    execFailureErrorType: "UPTIMEFAILURE",
  });

  // data is space-separated; the first field is uptime in seconds
  return rawOutput.trim().split(" ")[0];
}

const STATS_COMMAND = [
  "echo '<<<UPTIME>>>'", 
  "cat /proc/uptime",
  "echo '<<<MEMINFO>>>'", 
  "cat /proc/meminfo",
  "echo '<<<LOADAVG>>>'", 
  "cat /proc/loadavg",
  "echo '<<<DISK>>>'", 
  "df -k -P / | tail -n +2",
  "echo '<<<TEMP>>>'", 
  "cat /sys/class/thermal/thermal_zone0/temp 2>/dev/null",
].join(" ; ");

function splitStatsSections(rawOutput) {
  const parts = rawOutput.split(/<<<(\w+)>>>\n?/);
  const sections = {};

  for (let i = 1; i < parts.length; i += 2) {
    sections[parts[i]] = parts[i + 1] ?? "";
  }

  return sections;
}

function extractMeminfoKb(meminfoText, fieldName) {
  const match = meminfoText.match(new RegExp(`^${fieldName}:\\s+(\\d+)`, "m"));
  return match ? Number(match[1]) : null;
}

function parseStatsOutput(rawOutput) {
  const sections = splitStatsSections(rawOutput);

  const uptimeSeconds = parseFloat(sections.UPTIME?.trim().split(" ")[0]);

  if (!Number.isFinite(uptimeSeconds)) {
    throw createErrorResponseObject("Could not parse uptime from host.", "STATSPARSEFAILURE");
  }

  const memory = {
    totalKb: extractMeminfoKb(sections.MEMINFO ?? "", "MemTotal"),
    availableKb: extractMeminfoKb(sections.MEMINFO ?? "", "MemAvailable"),
  };

  const loadAvg = (sections.LOADAVG ?? "").trim().split(/\s+/).slice(0, 3).map(Number);

  // df -k -P /: Filesystem 1024-blocks Used Available Capacity Mounted-on
  const diskFields = (sections.DISK ?? "").trim().split(/\s+/);
  const disk = {
    totalKb: Number(diskFields[1]) || null,
    availableKb: Number(diskFields[3]) || null,
  };

  const tempRaw = (sections.TEMP ?? "").trim();
  const tempC = tempRaw ? Number(tempRaw) / 1000 : null;

  return { uptimeSeconds, memory, disk, loadAvg, tempC, collectedAt: Date.now() };
}

export async function getHostStats(piId) {
  const rawOutput = await runSshCommand(piId, STATS_COMMAND, {
    execFailureMessage: "Failure while trying to get stats from host.",
    execFailureErrorType: "STATSFAILURE",
  });

  return parseStatsOutput(rawOutput);
}

export async function checkIfHostIsUp(piId, caller = "unknown") {
  const configObject = piConfig[piId];
  const { mdnsHostname: host, name: screenName } = configObject;

  const resultObject = {
    hostIsUp: false,
    message: `Host #${piId} (${screenName}) is down.`,
    name: screenName,
    piId: piId,
  };

  try {
    const res = await ping.promise.probe(host, { min_reply: 3 });

    console.log(
      `[${logTimestamp()}] checkIfHostIsUp(${caller}): probe result for host '${host}' (piId ${piId}) - `
      + `alive=${res?.alive}, packetLoss=${res?.packetLoss}, times=${JSON.stringify(res?.times)}`
    );

    if (res && res.alive) {
      resultObject.hostIsUp = true;
      resultObject.message = `Host #${piId} (${screenName}) is up`;
    }

    return resultObject;
  }
  catch (error) {
    console.error(`[${logTimestamp()}] checkIfHostIsUp(${caller}): error trying to ping host '${host}':`, error);
    resultObject.message = "Error trying to ping host, see error object in response.";
    resultObject.error = error;
    return resultObject;
  }
}
