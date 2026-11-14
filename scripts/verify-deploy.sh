#!/usr/bin/env bash
#
# WebsiteHub - post-deploy verification of the LIVE site and API.
#
# Run this after a push to main, once the "CI", "Deploy frontend to GitHub Pages"
# and Render deploys have all gone green. It checks the real public URLs, not a
# local copy: the pages answer, the PDF is a PDF, the API serves the profile, and
# the browser-facing CORS rule lets the Pages origin in.
#
#   ./scripts/verify-deploy.sh
#   SITE=https://example.dev API=https://api.example.dev ./scripts/verify-deploy.sh   # after a custom domain
#
# The API runs on Render's free plan and sleeps after 15 idle minutes; waking takes
# about a minute. So the first request is retried for up to 3 minutes before it
# counts as a failure - a cold start is slow, not broken.
set -uo pipefail

SITE="${SITE:-https://bbobbylon.github.io/Resume}"
API="${API:-https://bobs-resume.onrender.com}"
SITE_ORIGIN="$(printf '%s' "$SITE" | sed -E 's#^(https?://[^/]+).*#\1#')"
FAILURES=0

pass() { echo "  PASS  $1"; }
fail() { echo "  FAIL  $1"; FAILURES=$((FAILURES + 1)); }

echo "=== Waking / checking the API: $API ==="
UP=0
for i in $(seq 1 36); do   # 36 x 5 s = 3 minutes
  if curl -sf -m 30 "$API/actuator/health" 2>/dev/null | grep -q '"UP"'; then UP=1; break; fi
  echo "  ...not up yet (attempt $i/36)"; sleep 5
done
[ "$UP" -eq 1 ] && pass "API /actuator/health is UP" || fail "API never reported UP within 3 minutes"

PROFILE="$(curl -s -m 30 "$API/api/profile")"
for needle in 'Robert Oliver' 'github.com/bbobbylon' 'linkedin.com/in/robert-c-oliver-jr-b929bb1a3'; do
  printf '%s' "$PROFILE" | grep -qF -- "$needle" && pass "API profile contains: $needle" || fail "API profile is missing: $needle"
done

CORS="$(curl -s -i -m 30 -H "Origin: $SITE_ORIGIN" "$API/api/profile")"
printf '%s' "$CORS" | grep -qi "access-control-allow-origin: $SITE_ORIGIN" \
  && pass "CORS allows the site origin ($SITE_ORIGIN)" \
  || fail "CORS does not allow $SITE_ORIGIN - check ALLOWED_ORIGIN on Render"

echo ""
echo "=== Checking the site: $SITE ==="
for path in "/" "/resume" "/projects/tesseraapp" "/terms" "/privacy"; do
  STATUS="$(curl -s -L -o /dev/null -m 30 -w '%{http_code}' "$SITE$path")"
  [ "$STATUS" = "200" ] && pass "GET $path -> 200" || fail "GET $path -> $STATUS (expected 200)"
done

NOPE="$(curl -s -o /dev/null -m 30 -w '%{http_code}' "$SITE/projects/nope-does-not-exist")"
echo "  info  unknown project id -> HTTP $NOPE (GitHub Pages serves its 404 page for unprerendered routes; the app's not-found state is a separate manual check)"

PDF_TYPE="$(curl -s -L -o /dev/null -m 30 -w '%{http_code} %{content_type}' "$SITE/resume.pdf")"
case "$PDF_TYPE" in
  "200 application/pdf"*) pass "resume.pdf is served as application/pdf" ;;
  *) fail "resume.pdf answered '$PDF_TYPE' (expected 200 application/pdf)" ;;
esac

echo ""
if [ "$FAILURES" -eq 0 ]; then
  echo "LIVE SITE VERIFIED. Still do the manual pass: open the site once with the API awake and once after it slept."
else
  echo "$FAILURES CHECK(S) FAILED."
fi
exit "$FAILURES"
