# Stoup Capitol Hill Screen Manager

# TODO
- [ ] Use `ps uax | grep kiosk.sh` command via ssh to determine if kiosk is running
- [ ] Make different status indicators for unreachable/down or software crashed
- [ ] Make different status indicator for "waiting for reboot"
- [ ] Use `free -m` to command via ssh to make a memory usage display
- [ ] Make a "Basic/Advanced Info" toggle switch to high diagnostic stuff
- [ ] Use store.js to make daycasting endpoints
	- [ ] Use `hostname` on host in script to request page on api route
	- [ ] Build api route for "/page/{hostname}" (/page/mez-bar1 etc.)
- [ ] Create default endpoint-config by hand with basic config
