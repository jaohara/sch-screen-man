export const APP_TITLE = "Stoup Capitol Hill Screen Manager";
// TODO: Change to production URL
// export const BACKEND_BASE_URL = "http://localhost:3000";
// TODO: Change to static server ip on LAN
export const BACKEND_BASE_URL = `http://${window.location.hostname}:3000`;
// ping interval for live hosts after initial confirmation
export const PING_INTVERVAL_ONLINE = 20000;
// ping interval for dead hosts
export const PING_INTERVAL_OFFLINE = 10000;
// ping interval for actively rebooting hosts
export const PING_INTERVAL_REBOOT = 2000;
export const PING_INTERVAL_TIME = 3000;
export const PING_ROUTE = "/api/ping";
// TODO: Increase timeout to 
// export const PING_TIMEOUT = 30000;
export const PING_TIMEOUT = 9000;
export const REBOOT_ROUTE = "/api/reboot";
export const REBOOT_PING_DELAY = 5000;
export const REBOOT_TIMEOUT = 120000;
// per-request waiting ceiling in ms
export const REQUEST_TIMEOUT = 5000; 
export const STATS_ROUTE = "/api/stats";
// New - interval for requesting stats like host memory usage
export const STATS_INTERVAL = 300000;
export const UNGROUPED_SCREEN_STRING = "Ungrouped";
export const UPTIME_ROUTE = "/api/uptime";
