#!/bin/bash

# Run this after you update the ./pi-conf.js file. It will copy the file into each
#  of the project directories.

# Path to the Raspberry Pi Config file
CONFIG_FILE="pi-conf.js"

# Verify that the file exists
if [ ! -f "$CONFIG_FILE" ]; then
  echo "Error: $CONFIG_FILE not found."
  exit 1
fi

# Copy config to each project directory
cp pi-conf.js frontend/pi-conf.js
cp pi-conf.js backend/pi-conf.js

echo "Successfully copied $CONFIG_FILE to ./backend/$CONFIG_FILE and ./frontend/$CONFIG_FILE"
