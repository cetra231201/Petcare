#!/bin/bash

# Run Prisma migrations before starting the server
npx prisma migrate deploy
status=$?

if [ $status -ne 0 ]; then
  echo "Prisma migration failed with status $status"
  exit $status
fi

# Start the server
node server.js
