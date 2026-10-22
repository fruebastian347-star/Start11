START11 — dashboard redesign / layout correction

WHAT CHANGED
- Replaced conflicting V36/V37 home-dashboard layout overrides with one coherent V38 layout.
- Header and action alerts now share a row on desktop, matching the approved reference image.
- The four summary cards occupy one row.
- The lower section has three columns: lineup, opponent scouting, upcoming activities.
- “Kampens handlinger” is a dedicated row directly below the lineup card, not nested inside it.
- The old 1250px breakpoint that forced activities onto an extra hidden row is removed; narrower desktop layouts keep all three cards visible until the viewport is genuinely too narrow.
- At tablet/mobile widths, the page returns to normal scrolling instead of clipping content.
- Added Kalender to the main navigation and corrected malformed </smalll> closing tags.
- Team selector now visually shows the selected team name and season label; logo is taken from the current match when the team can be matched.
- Existing match, roster, calendar, cloud, and coach modules are preserved.

BUILD / TEST
1. Run: py build_start11.py
2. Run: node --check start11.js
3. Open index.html in a local web server and visually verify at the same viewport/zoom as your reference screenshot before deploying.

VALIDATION PERFORMED HERE
- build_start11.py completed successfully.
- node --check start11.js passed.
- HTML parser check passed; no duplicate IDs found.
- CSS parser check passed with zero top-level parse errors.
- A real interactive browser screenshot could not be verified in this environment, so please do a local browser visual check before pushing to Cloudflare.

IMPORTANT
- Do not replace your Supabase data or clear localStorage as part of this UI update.
- Deploy only after checking the local view and testing login, team switching, calendar, lineup, training and cloud save.
