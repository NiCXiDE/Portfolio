#!/bin/sh
set -eu

DB_HOST="${DATABASE_HOST:-127.0.0.1}"
DB_PORT="${DATABASE_PORT:-3306}"

echo "Waiting for MySQL at ${DB_HOST}:${DB_PORT}..."
i=0
while [ "$i" -lt 90 ]; do
  if H="$DB_HOST" P="$DB_PORT" node -e "const n=require('net');const s=n.connect({host:process.env.H,port:Number(process.env.P)},()=>{s.end();process.exit(0)});s.on('error',()=>process.exit(1))" 2>/dev/null; then
    break
  fi
  i=$((i + 1))
  sleep 2
done

if [ "$i" -ge 90 ]; then
  echo "MySQL did not become reachable in time."
  exit 1
fi

echo "MySQL is reachable."

if [ "${RUN_SEED:-0}" = "1" ]; then
  set +e
  node /app/maybe-seed.cjs
  seed_status=$?
  set -e
  if [ "$seed_status" -eq 2 ]; then
    echo "Empty database detected; running seed..."
    ALLOW_DESTRUCTIVE_DB="${ALLOW_DESTRUCTIVE_DB:-1}" \
      /opt/seed-tools/node_modules/.bin/tsx /app/scripts/seed.ts
  elif [ "$seed_status" -eq 0 ]; then
    echo "Database already seeded; skipping."
  else
    echo "Seed check failed with status ${seed_status}."
    exit 1
  fi
fi

exec node /app/server.js
