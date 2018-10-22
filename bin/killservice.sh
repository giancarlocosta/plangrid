#!/bin/bash

PID_FILE="/tmp/plangrid-service-process-pids"

if [ -f "$PID_FILE" ]
then
  while IFS='' read -r line || [[ -n "$line" ]]; do
    echo "Killing service with pid: $line"
    kill -9 $line || continue
  done < "$PID_FILE"

  rm -rf "$PID_FILE"
fi
