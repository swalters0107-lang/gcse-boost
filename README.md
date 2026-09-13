# GCSE Boost V0.8 — Phone-ready beta

V0.8 turns the curriculum prototype into a more app-like private beta.

## New
- First-run learner onboarding and daily-goal choice.
- Personal profile stored locally on the device.
- Visual Foundation → Grade 5 → Higher → Grade 6 → Grade 7 journey.
- Achievement system: first mission, streak, XP, Foundation strength, Higher unlocks, Boss wins and English progress.
- Achievement callouts on mission results.
- Parent area protected by a local 4-digit PIN. Prototype default: 2468.
- Install button when the browser exposes the PWA installation prompt.
- Proper 192px and 512px PNG icons.
- Updated installable PWA manifest.
- Improved service worker with cache cleanup and offline shell.
- Existing V0.7 curriculum, readiness tests, adaptive practice, reading engine and weekly reports retained.

## Install on a phone
The app must be hosted over HTTPS (or localhost for development) for normal PWA installation. Once hosted, open it in a supporting mobile browser and use its Install/Add to Home Screen flow.

## Development
Run:
python -m http.server 8000
Then visit http://localhost:8000

## Data
V0.8 remains intentionally local-first: progress is stored in browser localStorage. There is no account, cloud database, analytics tracking or remote parent access yet.

## Next production step
V0.9 should introduce a real data model/backend, secure authentication, cloud progress sync, editable parent PIN, content files separated from application code, question-bank validation, and automated tests before wider beta use.
