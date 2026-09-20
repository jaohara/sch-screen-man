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




----


- Check - what's the best way to get the journalctl logs from the host?
	- What is the command for getting this app's logs in isolation?
	- Can these be routed to something remote that I can access?
- **Work on improving/unifying backend logging**
	- Good AI use case
- What should I document about the systemctl setup?
	- What is the entire scope of how I started it/enable it?
- How do I enable persistent reboot logging (or whatever that was) on hosts?
- Check - what's the cause behind that error where the reboot command isn't working as expected on mez-bar1/mez-bar2?
- How should I work when redeploying it to my other RPi 4?
	- Test locally on network, using laptop or other host to reboot.
	- Bring RPi0 from work to home as simple network host?
	- Fully document/plan deployment approach (docker?)
	- Plan to configure SSH keys over passwords
	- Plan to have a way to refresh/remove old keys easily

