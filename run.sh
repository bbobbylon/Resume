#!/usr/bin/env bash
#
# WebsiteHub - build the backend + frontend, run them, and open the app.
#
#   Run it from Git Bash:   ./run.sh        (or:  bash run.sh)
#   Stop it:                press Ctrl+C in this terminal (stops BOTH servers).
#
#   App (open this):  http://localhost:4222
#   API:               http://localhost:8420/api
#
# Non-default ports on purpose, so this can run alongside other apps' dev servers.
#
# Requirements: JDK 21+, Maven, and Node 20+. No database - the backend's repos
# are in-memory, so there's nothing else to start.
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_URL="http://localhost:4222"
API_URL="http://localhost:8420/api"
BACKEND_PID=""

# Ctrl+C (or exit) stops the backend too, so one terminal controls the whole app.
cleanup() {
  trap - INT TERM EXIT
  echo ""
  echo "Stopping WebsiteHub (backend + frontend)..."
  [ -n "${BACKEND_PID:-}" ] && kill "$BACKEND_PID" >/dev/null 2>&1 || true
  for PORT in 8420 4222; do
    PID="$(netstat -ano 2>/dev/null | grep ":$PORT" | grep -i LISTENING | awk '{print $NF}' | head -1)"
    [ -n "${PID:-}" ] && MSYS_NO_PATHCONV=1 taskkill /F /PID "$PID" /T >/dev/null 2>&1 || true
  done
  echo "Stopped."
}
trap cleanup INT TERM EXIT

echo "=== Building backend (Maven) ==="
( cd "$ROOT/backend" && mvn -q -DskipTests clean package )
echo "Backend build OK."

echo ""
echo "=== Preparing frontend (Angular) ==="
cd "$ROOT/frontend"
if [ ! -d node_modules ]; then
  echo "Installing npm dependencies (first run)..."
  npm install
fi

echo ""
echo "=== Starting backend in the background (logs -> backend.log) ==="
BACKEND_JAR="$(ls "$ROOT"/backend/target/websitehub-backend-*.jar | grep -v sources | head -1)"
( cd "$ROOT/backend" && java -jar "$BACKEND_JAR" > "$ROOT/backend.log" 2>&1 ) &
BACKEND_PID=$!

# Wait for the backend to actually be up BEFORE opening the browser, so the first
# page load isn't broken by the API call beating the backend.
echo ""
echo "Waiting for the backend API on :8420..."
for i in $(seq 1 60); do
  if curl -sf -o /dev/null "$API_URL/profile" 2>/dev/null; then
    echo "Backend is UP and serving data."
    break
  fi
  sleep 1
done

# Capture the API snapshot the app falls back to when the API is unreachable
# (frontend/public/data/*.json, git-ignored), so that path works locally too.
npm run snapshot --silent || echo "Snapshot skipped (backend not reachable)."

cat <<EOF

  ===================================================
    OPEN THE APP:  $APP_URL
    Backend API :  $API_URL/profile
  ===================================================

Starting the frontend - the app opens in your browser automatically when ready (~10-20s).

  Backend logs:     tail -f backend.log
  Stop everything:  press Ctrl+C here.

EOF

# Foreground: compiles + serves the frontend on :4222 and opens the browser.
# Pressing Ctrl+C here returns control to the trap above, which stops the backend too.
npx ng serve --port 4222 --open
