#!/usr/bin/env bash
#
# WebsiteHub - Docker smoke test.
#
# Builds the backend image from backend/Dockerfile, starts it with docker compose,
# then checks the things that have to be true for the container to be "working":
#
#   1. it starts and /actuator/health reports UP        (what Render's health check hits)
#   2. /api/profile returns the owner's profile, with GitHub AND LinkedIn links
#   3. /api/projects returns a non-empty catalogue
#   4. CORS: the Angular dev origin is allowed, a stranger's origin is NOT
#   5. the Swagger UI at /docs is served
#   6. the actuator exposes ONLY /health (env/beans/etc. must be closed)
#
# Think of it as a pre-flight checklist: the same checks a pilot runs on the ground,
# before any passenger (visitor) is on board.
#
#   Run it from Git Bash, from anywhere:   ./scripts/docker-smoke-test.sh
#   Leave the container running afterward: KEEP_UP=1 ./scripts/docker-smoke-test.sh
#   Run only the checks against a backend that is ALREADY running (for example the one
#   ./run.sh started with java -jar), skipping Docker entirely:
#                                          SKIP_DOCKER=1 ./scripts/docker-smoke-test.sh
#   Point at a different address:          API=http://localhost:9000 SKIP_DOCKER=1 ...
#
# Requirements: Docker (Desktop must be running) and curl. Nothing else - the build
# happens inside the image, so you do not need Maven or a JDK for this one.
# Exit code 0 = every check passed; non-zero = at least one failed (logs are printed).
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API="${API:-http://localhost:8420}"
GOOD_ORIGIN="http://localhost:4222"   # must match ALLOWED_ORIGIN in docker-compose.yml
BAD_ORIGIN="https://evil.example"
FAILURES=0

pass() { echo "  PASS  $1"; }
fail() { echo "  FAIL  $1"; FAILURES=$((FAILURES + 1)); }

# check "<description>" "<haystack>" "<needle>"  - passes when the needle is in the haystack.
check_contains() {
  if printf '%s' "$2" | grep -qF -- "$3"; then pass "$1"; else fail "$1  (expected to find: $3)"; fi
}

command -v curl >/dev/null 2>&1 || { echo "curl not found."; exit 2; }
if [ "${SKIP_DOCKER:-0}" != "1" ]; then
  command -v docker >/dev/null 2>&1 || { echo "docker not found - install/start Docker Desktop first."; exit 2; }
  docker info >/dev/null 2>&1       || { echo "Docker is installed but the daemon is not running - start Docker Desktop."; exit 2; }
fi

cd "$ROOT"

# Always tear down (unless KEEP_UP=1) so a failed run never leaves port 8420 occupied.
cleanup() {
  [ "${SKIP_DOCKER:-0}" = "1" ] && return
  if [ "${KEEP_UP:-0}" = "1" ]; then
    echo "KEEP_UP=1: leaving the container running on $API  (stop it: docker compose down)"
  else
    echo "Stopping the container..."
    docker compose down >/dev/null 2>&1
  fi
}
trap cleanup EXIT

if [ "${SKIP_DOCKER:-0}" != "1" ]; then
  echo "=== Building the image and starting the backend container ==="
  docker compose up -d --build backend || { echo "docker compose failed to build/start - see the output above."; exit 1; }
fi

echo ""
echo "=== Waiting for /actuator/health (up to 120 s) ==="
UP=0
for _ in $(seq 1 60); do
  if curl -sf "$API/actuator/health" 2>/dev/null | grep -q '"UP"'; then UP=1; break; fi
  sleep 2
done
if [ "$UP" -ne 1 ]; then
  echo "Backend never reported UP at $API."
  [ "${SKIP_DOCKER:-0}" != "1" ] && { echo "Last 60 log lines:"; docker compose logs --tail=60 backend; }
  exit 1
fi

echo ""
echo "=== Checks ==="
HEALTH="$(curl -s "$API/actuator/health")"
check_contains "health reports UP" "$HEALTH" '"UP"'

PROFILE_STATUS="$(curl -s -o /dev/null -w '%{http_code}' "$API/api/profile")"
[ "$PROFILE_STATUS" = "200" ] && pass "/api/profile -> HTTP 200" || fail "/api/profile expected 200, got $PROFILE_STATUS"
PROFILE="$(curl -s "$API/api/profile")"
check_contains "profile has the owner's name"    "$PROFILE" 'Robert Oliver'
check_contains "profile has the GitHub link"     "$PROFILE" 'https://github.com/bbobbylon'
check_contains "profile has the LinkedIn link"   "$PROFILE" 'linkedin.com/in/robert-c-oliver-jr-b929bb1a3'

PROJECTS_STATUS="$(curl -s -o /dev/null -w '%{http_code}' "$API/api/projects")"
[ "$PROJECTS_STATUS" = "200" ] && pass "/api/projects -> HTTP 200" || fail "/api/projects expected 200, got $PROJECTS_STATUS"
PROJECTS="$(curl -s "$API/api/projects")"
check_contains "projects is a non-empty list"    "$PROJECTS" '"id"'

ALLOWED="$(curl -s -i -H "Origin: $GOOD_ORIGIN" "$API/api/profile")"
check_contains "CORS allows $GOOD_ORIGIN"        "$ALLOWED" "$GOOD_ORIGIN"
DENIED_STATUS="$(curl -s -o /dev/null -w '%{http_code}' -H "Origin: $BAD_ORIGIN" "$API/api/profile")"
DENIED_HEADERS="$(curl -s -i -H "Origin: $BAD_ORIGIN" "$API/api/profile")"
if printf '%s' "$DENIED_HEADERS" | grep -qi "access-control-allow-origin: $BAD_ORIGIN"; then
  fail "CORS must NOT allow $BAD_ORIGIN"
else
  pass "CORS does not allow $BAD_ORIGIN (HTTP $DENIED_STATUS)"
fi

DOCS_STATUS="$(curl -s -L -o /dev/null -w '%{http_code}' "$API/docs")"
[ "$DOCS_STATUS" = "200" ] && pass "/docs (Swagger UI) -> HTTP 200" || fail "/docs expected 200, got $DOCS_STATUS"

ENV_STATUS="$(curl -s -o /dev/null -w '%{http_code}' "$API/actuator/env")"
[ "$ENV_STATUS" = "404" ] && pass "/actuator/env is closed (404)" || fail "/actuator/env expected 404, got $ENV_STATUS"

echo ""
if [ "$FAILURES" -eq 0 ]; then
  echo "ALL CHECKS PASSED - the Docker image builds, boots, and serves correctly."
else
  echo "$FAILURES CHECK(S) FAILED."
  [ "${SKIP_DOCKER:-0}" != "1" ] && { echo "Backend logs (last 40 lines):"; docker compose logs --tail=40 backend; }
fi
exit "$FAILURES"
