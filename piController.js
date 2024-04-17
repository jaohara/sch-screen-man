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

}
