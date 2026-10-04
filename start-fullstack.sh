#!/usr/bin/env bash
echo "===================================================================="
echo " LAUNCHING UNIVERSE CIVILIZATION FULL-STACK SYSTEM"
echo "===================================================================="
echo ""

cleanup() {
  echo ""
  echo "Shutting down servers..."
  kill $(jobs -p) 2>/dev/null || true
  exit 0
}

trap cleanup SIGINT SIGTERM

echo "[1/2] Starting Game Backend Server..."
bash start-server.sh &
SERVER_PID=$!

sleep 2

echo "[2/2] Starting Game Frontend Client..."
npm run dev &
CLIENT_PID=$!

echo ""
echo "===================================================================="
echo " Backend Server PID: $SERVER_PID (http://localhost:5001)"
echo " Frontend Client PID: $CLIENT_PID (http://localhost:3000)"
echo " Press Ctrl+C to terminate both servers."
echo "===================================================================="

wait
