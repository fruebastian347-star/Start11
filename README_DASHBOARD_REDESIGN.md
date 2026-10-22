# START11 – dashboard redesign (22. oktober 2026)

Denne pakke bygger videre på de seneste uploadede START11-filer. Den udskifter ikke appens øvrige moduler med en demo; den opdaterer den eksisterende V35-shell og bruger fortsat de eksisterende kamp-, trænings-, trup-, kalender- og lineup-komponenter.

## Ændrede filer

- `index.html` – nyt dashboard-layout, advarselsrække, trupstatus, opstilling med bænk/ikke udtaget, scouting- og aktivitetskort.
- `start11.css` – responsivt design, højere kontrast, fladere banevisning, statusikoner og forbedret layout.
- `js/13_exercise_cloud_sync.js` – binder dashboardfelterne til eksisterende appdata, statusadvarsler, statusikoner og aktivitetsliste.
- `start11.js` – genbygget bundle fra de 13 kildefiler.

De øvrige `js/`-moduler er medtaget som den kildeversion, der blev uploadet til gennemgangen, så pakken kan genbygges reproducerbart.

## Kontroller udført

- `python build_start11.py` gennemført.
- `node --check start11.js` gennemført uden syntaksfejl.
- HTML-ID'er kontrolleret; ingen dublerede ID'er.
- Der er ikke gennemført en fuld browser-/produktionsintegrationstest. Headless Chromium kunne ikke færdiggøre rendering i dette miljø, så det er ikke bevis for fejl i appen.

## Installation i eksisterende projekt

1. Tag en kopi af dit nuværende projekt først.
2. Kopiér `index.html`, `start11.css`, `start11.js` og `js/13_exercise_cloud_sync.js` fra pakken til de tilsvarende steder i `C:\Users\frueb\Desktop\Start11-v2`.
3. Hvis du også vil have hele den uploadede kildeversion, kan du sammenligne resten af `js/`-mappen før du overskriver noget. Overskriv ikke egne nyere rettelser blindt.
4. Fra projektroden kør:

   ```bash
   python build_start11.py
   node --check start11.js
   ```

5. Test lokalt: login, holdvælger, kampplan, træning, spillere, deling/PDF, kalender og øvelsesbank.
6. Når det virker, commit/push til `main` efter din normale Cloudflare-deployproces.

## Vigtige dataprincipper

- Statusadvarsler og statusikoner beregnes fra spillertruppens eksisterende statusfelter.
- Hvis kamp-/træningsdata ikke er registreret, vises en neutral tom tilstand i stedet for opdigtede tider eller scoutingfakta.
- Mødetid/afgang udfyldes kun, hvis eksisterende dashboarddata har felterne.
- Delingskortet starter delingsflowet; UI'et påstår ikke, at en opstilling allerede er sendt.
