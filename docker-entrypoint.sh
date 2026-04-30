#!/bin/sh
set -e

node /opt/prisma/node_modules/prisma/build/index.js migrate deploy --schema=./prisma/schema.prisma
node ./prisma/seed-prod.js

exec node server.js
