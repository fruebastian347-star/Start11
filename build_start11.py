from pathlib import Path

ROOT = Path(__file__).resolve().parent
JS = ROOT / "js"
ORDER = [
    "01_core_cloud_auth.js",
    "02_squad_matchflow.js",
    "03_dbu_calendar_clubs.js",
    "04_legacy_extensions.js",
    "05_coaching_hub.js",
    "06_training_calendar_media.js",
    "07_exercise_designer_matchmode.js",
    "08_coach_os_matchdata.js",
    "09_dbu_bridge_pro_designer_responsive.js",
    "10_training_library.js",
    "11_tactical_situations.js",
    "12_video_analysis.js",
    "13_exercise_cloud_sync.js",
]

out = ROOT / "start11.js"
with out.open("wb") as dst:
    for name in ORDER:
        dst.write((JS / name).read_bytes())
print(f"Built: {out} ({out.stat().st_size:,} bytes)")
