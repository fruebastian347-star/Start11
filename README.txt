START11 MODULAR V1
==================

This is a SAFE first modularization of V27.4.

IMPORTANT
- Runtime behavior is intentionally unchanged.
- The modules are concatenated in the original order into start11.js.
- Your website can keep loading start11.js exactly as before.
- Edit the relevant file in /js, then run: python build_start11.py
- Do not change the order in build_start11.py yet; later modules intentionally override older behavior.

Typical fixes
- Exercise bank/folders: js/10_training_library.js and js/13_exercise_cloud_sync.js
- Tactical match situations: js/11_tactical_situations.js
- Video analysis: js/12_video_analysis.js
- Match Data / Coach OS: js/08_coach_os_matchdata.js
- Coaching Hub: js/05_coaching_hub.js
- DBU/calendar: js/03_dbu_calendar_clubs.js
- Login/cloud/base lineup/PDF: js/01_core_cloud_auth.js

Why build instead of loading 13 scripts directly?
The current START11 code contains historical override layers. Concatenating preserves the exact execution order and avoids introducing new browser timing/load bugs while still giving us separate source files to work on. Once the old override layers have been cleaned up, these can be converted to true ES modules.
