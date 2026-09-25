export const APP_TITLE = "Menu Screen Manager";
// TODO: Change to production URL
// export const BACKEND_BASE_URL = "http://localhost:3000";
// TODO: Change to static server ip on LAN
export const BACKEND_BASE_URL = `http://${window.location.hostname}:3000`;
// ping interval for live hosts after initial confirmation
export const PING_INTERVAL_ONLINE = 20000;
// ping interval for dead hosts
export const PING_INTERVAL_OFFLINE = 10000;
// ping interval for actively rebooting hosts
export const PING_INTERVAL_REBOOT = 2000;
export const PING_INTERVAL_REBOOT_INITIAL = 8000;
export const PING_INTERVAL_TIME = 3000;
export const PING_ROUTE = "/api/ping";
export const REBOOT_ROUTE = "/api/reboot";
// TODO: Maybe shorten - needs to be longer for RPi 0 W
// export const REBOOT_TIMEOUT = 120000;
export const REBOOT_TIMEOUT = 180000;
// per-request waiting ceiling in ms
export const REQUEST_TIMEOUT = 10000; 
export const STATS_REQUEST_TIMEOUT = 15000;
export const STATS_ROUTE = "/api/stats";
export const STATS_INTERVAL = 15000;
export const UNGROUPED_SCREEN_STRING = "Ungrouped";
export const UPTIME_ROUTE = "/api/uptime";
