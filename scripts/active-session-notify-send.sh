#!/bin/sh
# Sends Notification to Active Session
# Remember to run as use "sudo -u USER"

SESSION_ID=$(who -u | tail -n 1 | grep -oP '\d*(?:\s?(\(.*\))?)$' | awk '{ print $1 }')

printf "Session ID: $SESSION_ID\n"
eval "export $(egrep -z DBUS_SESSION_BUS_ADDRESS /proc/$SESSION_ID/environ)"

# Forward the Paramters
/usr/bin/notify-send "$@"
