/* =========================================================
   START11 – DBU CONNECT
   Henter kampene via Supabase Edge Function: dbu-matches
========================================================= */

function start11NormalizeDbuMatch(match, index = 0) {

    /*
        DBU -> START11 KAMPPLAN FIX

        Edge Function-versioner kan bruge lidt forskellige feltnavne.
        Derfor accepterer vi både de gamle og de nyere navne her.
    */

    const firstValue = (...values) => {
        for (const value of values) {
            if (
                value !== undefined &&
                value !== null &&
                String(value).trim() !== ""
            ) {
                return String(value).trim();
            }
        }

        return "";
    };


    const home =
        firstValue(
            match?.homeTeam,
            match?.home,
            match?.home_team,
            match?.homeName,
            match?.home_name,
            match?.hjemmehold
        );


    const away =
        firstValue(
            match?.awayTeam,
            match?.away,
            match?.away_team,
            match?.awayName,
            match?.away_name,
            match?.udehold,
            match?.opponent
        );


    const place =
        firstValue(
            match?.venue,
            match?.place,
            match?.matchPlace,
            match?.stadium,
            match?.ground,
            match?.arena,
            match?.spillested
        );


    const rawDate =
        firstValue(
            match?.date,
            match?.matchDate,
            match?.match_date,
            match?.startDate,
            match?.start_date,
            match?.dateText,
            match?.kampdato
        );


    const date =
        typeof start11CalendarToIsoDate === "function"
            ? start11CalendarToIsoDate(rawDate)
            : rawDate;


    const time =
        firstValue(
            match?.time,
            match?.matchTime,
            match?.match_time,
            match?.kickoff,
            match?.kickOff,
            match?.startTime,
            match?.start_time,
            match?.kampstart
        )
            .replace(".", ":");


    const matchNumber =
        firstValue(
            match?.matchNumber,
            match?.matchNo,
            match?.match_number,
            match?.kampnummer
        );


    const result =
        firstValue(
            match?.result,
            match?.score
        );


    const homeLogo =
        firstValue(
            match?.homeLogo,
            match?.home_logo,
            match?.homeTeamLogo,
            match?.home_team_logo,
            match?.homeLogoUrl,
            match?.home_logo_url
        );


    const awayLogo =
        firstValue(
            match?.awayLogo,
            match?.away_logo,
            match?.awayTeamLogo,
            match?.away_team_logo,
            match?.awayLogoUrl,
            match?.away_logo_url
        );


    return {

        ...match,

        id:
            match?.id ||
            (
                matchNumber
                    ? `dbu_${matchNumber}`
                    : `dbu_${index}_${date}_${home}_${away}`
            ),

        matchNumber,

        date,
        matchDate:
            date,

        time,
        matchTime:
            time,

        home,
        away,

        homeTeam:
            home,

        awayTeam:
            away,

        place,
        venue:
            place,

        matchPlace:
            place,

        result,

        homeLogo,
        awayLogo,

        homeTeamUrl:
            firstValue(
                match?.homeTeamUrl,
                match?.home_team_url
            ),

        awayTeamUrl:
            firstValue(
                match?.awayTeamUrl,
                match?.away_team_url
            ),

        source:
            "dbu"

    };

}


function start11ParseDbuDate(dateText, timeText = "") {

    const rawDate =
        String(dateText || "")
            .trim();


    const rawTime =
        String(timeText || "")
            .trim();


    if (!rawDate) {

        return null;

    }


    /* ISO: 2026-09-12 */
    let match =
        rawDate.match(
            /\b(20\d{2})-(\d{1,2})-(\d{1,2})\b/
        );


    let year;
    let month;
    let day;


    if (match) {

        year = Number(match[1]);
        month = Number(match[2]);
        day = Number(match[3]);

    } else {

        /* DBU-formater som 12-09-2026 eller 12.09.2026 */
        match =
            rawDate.match(
                /\b(\d{1,2})[.\/-](\d{1,2})[.\/-](20\d{2})\b/
            );


        if (match) {

            day = Number(match[1]);
            month = Number(match[2]);
            year = Number(match[3]);

        } else {

            /*
                DBU viser nogle gange kun dag og måned.
                Vi vælger det mest sandsynlige sæson-år.
            */
            match =
                rawDate.match(
                    /\b(\d{1,2})[.\/-](\d{1,2})\b/
                );


            if (!match) {

                return null;

            }


            day = Number(match[1]);
            month = Number(match[2]);


            const now =
                new Date();


            year =
                now.getFullYear();


            const candidate =
                new Date(
                    year,
                    month - 1,
                    day,
                    23,
                    59,
                    59
                );


            /*
                Hvis datoen ligger mange måneder bagud,
                antager vi at den tilhører næste kalenderår.
            */
            if (
                candidate.getTime() <
                now.getTime() -
                1000 * 60 * 60 * 24 * 120
            ) {

                year += 1;

            }

        }

    }


    let hour = 0;
    let minute = 0;


    const timeMatch =
        rawTime.match(
            /(\d{1,2})[:.](\d{2})/
        );


    if (timeMatch) {

        hour = Number(timeMatch[1]);
        minute = Number(timeMatch[2]);

    }


    const parsed =
        new Date(
            year,
            month - 1,
            day,
            hour,
            minute,
            0,
            0
        );


    return Number.isNaN(parsed.getTime())
        ? null
        : parsed;

}


function start11FindNextDbuMatch(matches) {

    if (
        !Array.isArray(matches) ||
        !matches.length
    ) {

        return null;

    }


    const now =
        new Date();


    const withDates =
        matches
            .map(
                match => ({

                    match,

                    parsedDate:
                        start11ParseDbuDate(
                            match.date,
                            match.time
                        )

                })
            )
            .filter(
                item =>
                    item.parsedDate
            )
            .sort(
                (a, b) =>
                    a.parsedDate -
                    b.parsedDate
            );


    const upcoming =
        withDates.find(
            item =>
                item.parsedDate.getTime() >=
                now.getTime() -
                1000 * 60 * 60 * 4
        );


    return (
        upcoming?.match ||
        withDates.at(-1)?.match ||
        matches[0]
    );

}


async function syncDbuMatches() {

    const input =
        document.getElementById(
            "dbuTeamUrlInput"
        );


    let dbuUrl =
        input?.value.trim() ||
        localStorage.getItem(
            START11_DBU_URL_KEY
        ) ||
        "";


    if (!dbuUrl) {

        if (
            typeof visNotification ===
            "function"
        ) {

            visNotification(
                "Indsæt først jeres DBU-holdlink."
            );

        }


        return;

    }


    try {

        const parsedUrl =
            new URL(dbuUrl);


        if (
            !parsedUrl.hostname
                .toLowerCase()
                .endsWith("dbu.dk")
        ) {

            throw new Error(
                "Linket skal være et DBU-link."
            );

        }


        dbuUrl =
            parsedUrl.href;


        localStorage.setItem(
            START11_DBU_URL_KEY,
            dbuUrl
        );

    } catch (error) {

        if (
            typeof visNotification ===
            "function"
        ) {

            visNotification(
                "Indsæt et gyldigt DBU-holdlink."
            );

        }


        return;

    }


    const status =
        document.getElementById(
            "dbuConnectionStatus"
        );


    const button =
        document.getElementById(
            "syncDbuMatchesButton"
        );


    if (status) {

        status.textContent =
            "Henter kampe fra DBU...";

    }


    if (button) {

        button.disabled =
            true;

        button.dataset.originalText =
            button.textContent;

        button.textContent =
            "HENTER...";

    }


    try {

        /*
            Sørg for at login-tokenet stadig er gyldigt,
            før Edge Functionen kaldes.
        */
        if (
            typeof ensureSession ===
            "function"
        ) {

            const loggedIn =
                await ensureSession();


            if (!loggedIn) {

                throw new Error(
                    "Du skal være logget ind for at hente DBU-kampe."
                );

            }

        }


        const response =
            await fetch(
                `${SUPABASE_URL}/functions/v1/dbu-matches`,
                {

                    method: "POST",

                    headers: {

                        apikey:
                            SUPABASE_KEY,

                        Authorization:
                            `Bearer ${session?.access_token}`,

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({
                            url: dbuUrl
                        })

                }
            );


        const responseText =
            await response.text();


        let data =
            null;


        try {

            data =
                responseText
                    ? JSON.parse(responseText)
                    : null;

        } catch (error) {

            throw new Error(
                "DBU-funktionen returnerede et ugyldigt svar."
            );

        }


        if (
            !response.ok ||
            !data?.success
        ) {

            throw new Error(
                data?.error ||
                `DBU-sync fejlede (HTTP ${response.status}).`
            );

        }


        const matches =
            Array.isArray(data.matches)
                ? data.matches
                    .map(
                        (match, index) =>
                            start11NormalizeDbuMatch(
                                match,
                                index
                            )
                    )
                    .filter(
                        match =>
                            match.home &&
                            match.away
                    )
                : [];


        /*
            DBU-sync må ikke slette træningskampe, som er oprettet
            manuelt i kalenderen. Bevar dem og erstat kun DBU-kampene.
        */
        let existingMatches = [];

        try {
            const parsedExisting = JSON.parse(
                localStorage.getItem(START11_MATCHES_KEY) || "[]"
            );

            existingMatches = Array.isArray(parsedExisting)
                ? parsedExisting
                : [];
        } catch (error) {
            existingMatches = [];
        }

        const manualMatches = existingMatches.filter(
            item => item?.source === START11_CALENDAR_MANUAL_SOURCE
        );

        const mergedMatches = [
            ...matches,
            ...manualMatches
        ];

        localStorage.setItem(
            START11_MATCHES_KEY,
            JSON.stringify(mergedMatches)
        );


        if (status) {

            status.textContent =
                `${matches.length} kampe hentet fra DBU`;

        }


        start11RenderUpcomingMatches();

        start11RenderNextDbuMatch(
            matches
        );


        if (
            typeof visNotification ===
            "function"
        ) {

            visNotification(
                matches.length
                    ? `${matches.length} DBU-kampe er synkroniseret.`
                    : "Forbindelsen virker, men DBU returnerede ingen kampe."
            );

        }

    } catch (error) {

        console.error(
            "DBU Connect:",
            error
        );


        if (status) {

            status.textContent =
                "DBU-sync fejlede";

        }


        if (
            typeof visNotification ===
            "function"
        ) {

            visNotification(
                "Kunne ikke hente DBU-kampe: " +
                error.message
            );

        }

    } finally {

        if (button) {

            button.disabled =
                false;

            button.textContent =
                button.dataset.originalText ||
                "HENT KAMPE";

            delete button.dataset.originalText;

        }

    }

}


function start11RenderNextDbuMatch(
    providedMatches = null
) {

    let matches =
        providedMatches;


    if (!Array.isArray(matches)) {

        try {

            matches =
                JSON.parse(
                    localStorage.getItem(
                        START11_MATCHES_KEY
                    ) ||
                    "[]"
                );

        } catch (error) {

            matches = [];

        }

    }


    if (
        !Array.isArray(matches) ||
        !matches.length
    ) {

        return;

    }


    const normalizedMatches =
        matches.map(
            (match, index) =>
                start11NormalizeDbuMatch(
                    match,
                    index
                )
        );


    const match =
        start11FindNextDbuMatch(
            normalizedMatches
        );


    if (!match) {

        return;

    }


    const setText =
        (id, value) => {

            const element =
                document.getElementById(id);


            if (element) {

                element.textContent =
                    value ||
                    "—";

            }

        };


    setText(
        "dashboardHomeTeam",
        match.home
    );


    setText(
        "dashboardAwayTeam",
        match.away
    );


    setText(
        "dashboardMatchDate",
        match.date
    );


    setText(
        "dashboardMatchTime",
        match.time
    );


    setText(
        "dashboardMatchPlace",
        match.place
    );


    setText(
        "dashboardCompetition",
        "DBU KAMPPROGRAM"
    );

}


function start11InstallDbuConnect() {

    const syncButton =
        document.getElementById(
            "syncDbuMatchesButton"
        );


    if (
        syncButton &&
        syncButton.dataset.dbuBound !==
            "true"
    ) {

        syncButton.dataset.dbuBound =
            "true";


        syncButton.addEventListener(
            "click",
            syncDbuMatches
        );

    }


    /*
        Hvis der allerede ligger DBU-kampe lokalt,
        vises den næste kamp igen efter reload.
    */
    start11RenderNextDbuMatch();

}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        start11InstallDbuConnect
    );

} else {

    start11InstallDbuConnect();

}

/* =========================================================
   START11 – KAMPKALENDER V2
   - Kalender åbnes fra "KALENDER" ved siden af "Rediger"
   - Ingen KOMMENDE/KALENDER-tabs øverst
   - Træningskampe oprettes kun inde fra kalenderen
   - DBU-datoer med ugedag (fx "søn.30-08 2026") normaliseres
   - DBU- og træningskampe vises i kalenderen
   - Logoer bruges automatisk når DBU-backend leverer homeLogo/awayLogo
========================================================= */

const START11_CALENDAR_MANUAL_SOURCE = "manual";
let start11CalendarDate = new Date();
let start11CalendarEditContext = null;

function start11CalendarReadMatches() {
    try {
        const items = JSON.parse(localStorage.getItem(START11_MATCHES_KEY) || "[]");
        return Array.isArray(items) ? items : [];
    } catch (error) {
        return [];
    }
}

function start11CalendarSaveMatches(items) {
    localStorage.setItem(START11_MATCHES_KEY, JSON.stringify(Array.isArray(items) ? items : []));
}

function start11CalendarToIsoDate(value) {
    let text = String(value || "").trim().toLowerCase();
    if (!text) return "";

    // DBU kan fx levere: "søn.30-08 2026", "søn. 30-08-2026" eller "30-08 2026".
    text = text
        .replace(/^(man|tir|ons|tor|fre|lør|lor|søn|son)\.?\s*/i, "")
        .replace(/\s+/g, " ")
        .trim();

    let match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (match) return `${match[1]}-${String(match[2]).padStart(2,"0")}-${String(match[3]).padStart(2,"0")}`;

    match = text.match(/^(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{4})$/);
    if (match) return `${match[3]}-${String(match[2]).padStart(2,"0")}-${String(match[1]).padStart(2,"0")}`;

    match = text.match(/^(\d{1,2})[.\-/](\d{1,2})\s+(\d{4})$/);
    if (match) return `${match[3]}-${String(match[2]).padStart(2,"0")}-${String(match[1]).padStart(2,"0")}`;

    match = text.match(/^(\d{1,2})[.\-/](\d{1,2})$/);
    if (match) {
        const now = new Date();
        let year = now.getFullYear();
        const candidate = new Date(year, Number(match[2]) - 1, Number(match[1]));
        if (candidate.getTime() < now.getTime() - 120 * 86400000) year += 1;
        return `${year}-${String(match[2]).padStart(2,"0")}-${String(match[1]).padStart(2,"0")}`;
    }

    return text;
}

function start11CalendarDateObject(match) {
    const iso = start11CalendarToIsoDate(match?.date || match?.matchDate);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
    const timeText = String(match?.time || match?.matchTime || "00:00").replace(".", ":");
    const tm = timeText.match(/(\d{1,2}):(\d{2})/);
    const [year, month, day] = iso.split("-").map(Number);
    const date = new Date(year, month - 1, day, tm ? Number(tm[1]) : 0, tm ? Number(tm[2]) : 0);
    return Number.isNaN(date.getTime()) ? null : date;
}

function start11CalendarNormalizeMatch(match, index = 0) {

    const firstValue = (...values) => {
        for (const value of values) {
            if (
                value !== undefined &&
                value !== null &&
                String(value).trim() !== ""
            ) {
                return String(value).trim();
            }
        }

        return "";
    };


    const home =
        firstValue(
            match?.home,
            match?.homeTeam,
            match?.home_team,
            match?.homeName,
            match?.home_name,
            match?.hjemmehold
        );


    const away =
        firstValue(
            match?.away,
            match?.awayTeam,
            match?.away_team,
            match?.awayName,
            match?.away_name,
            match?.udehold,
            match?.opponent
        );


    const place =
        firstValue(
            match?.place,
            match?.venue,
            match?.matchPlace,
            match?.stadium,
            match?.ground,
            match?.arena,
            match?.spillested
        );


    const rawDate =
        firstValue(
            match?.date,
            match?.matchDate,
            match?.match_date,
            match?.startDate,
            match?.start_date,
            match?.dateText,
            match?.kampdato
        );


    const date =
        start11CalendarToIsoDate(
            rawDate
        );


    const time =
        firstValue(
            match?.time,
            match?.matchTime,
            match?.match_time,
            match?.kickoff,
            match?.kickOff,
            match?.startTime,
            match?.start_time,
            match?.kampstart
        )
            .replace(".", ":");


    const homeLogo =
        firstValue(
            match?.homeLogo,
            match?.home_logo,
            match?.homeTeamLogo,
            match?.home_team_logo,
            match?.homeLogoUrl,
            match?.home_logo_url
        );


    const awayLogo =
        firstValue(
            match?.awayLogo,
            match?.away_logo,
            match?.awayTeamLogo,
            match?.away_team_logo,
            match?.awayLogoUrl,
            match?.away_logo_url
        );


    const source =
        match?.source === START11_CALENDAR_MANUAL_SOURCE
            ? START11_CALENDAR_MANUAL_SOURCE
            : "dbu";


    return {

        ...match,

        id:
            match?.id ||
            (
                source === "manual"
                    ? `manual_${Date.now()}_${index}`
                    : `dbu_${match?.matchNumber || match?.matchNo || index}`
            ),

        source,

        type:
            match?.type ||
            (
                source === "manual"
                    ? "friendly"
                    : "league"
            ),

        date,
        matchDate:
            date,

        time,
        matchTime:
            time,

        home,
        away,
        place,

        homeTeam:
            home,

        awayTeam:
            away,

        venue:
            place,

        matchPlace:
            place,

        homeLogo,
        awayLogo,

        result:
            match?.result ||
            match?.score ||
            ""

    };

}


function start11CalendarAllMatches() {
    return start11CalendarReadMatches()
        .map(start11CalendarNormalizeMatch)
        .filter(match => match.home || match.away)
        .sort((a,b) => {
            const da = start11CalendarDateObject(a), db = start11CalendarDateObject(b);
            if (!da && !db) return 0;
            if (!da) return 1;
            if (!db) return -1;
            return da - db;
        });
}

function start11CalendarTeamName() {
    const all = start11CalendarAllMatches();
    const dbu = all.find(match => match.source === "dbu");
    const current = String(kampplan?.homeTeam || "").trim();
    if (current && dbu && (dbu.home === current || dbu.away === current)) return current;
    if (dbu) {
        // Holdnavnet som går igen flest gange er normalt brugerens eget hold.
        const counts = new Map();
        all.filter(m => m.source === "dbu").forEach(m => {
            [m.home,m.away].filter(Boolean).forEach(name => counts.set(name,(counts.get(name)||0)+1));
        });
        const best = [...counts.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0];
        if (best) return best;
    }
    return current || "FC THY";
}

function start11CalendarOpponent(match) {
    const own = start11CalendarTeamName().toLowerCase();
    if (String(match.home||"").toLowerCase() === own) return match.away;
    if (String(match.away||"").toLowerCase() === own) return match.home;
    return match.away || match.home || "Modstander";
}

function start11CalendarHomeAway(match) {
    const own = start11CalendarTeamName().toLowerCase();
    if (String(match.home||"").toLowerCase() === own) return "H";
    if (String(match.away||"").toLowerCase() === own) return "U";
    return "";
}

function start11CalendarFormatShortDate(iso) {
    const m = String(iso||"").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return m ? `${m[3]}-${m[2]}` : (iso || "—");
}

function start11CalendarApplyMatchToEditor(match) {
    const normalized = start11CalendarNormalizeMatch(match);
    kampplan = {
        ...kampplan,
        homeTeam: normalized.home,
        awayTeam: normalized.away,
        matchDate: normalized.date,
        matchTime: normalized.time,
        matchPlace: normalized.place,
        homeLogo: normalized.homeLogo || "",
        awayLogo: normalized.awayLogo || ""
    };
    start11CalendarEditContext = { mode:"edit", id:normalized.id, source:normalized.source };
    if (typeof åbnKampplan === "function") åbnKampplan();
}

function start11CalendarCreateFriendly(date = "") {
    const ownTeam = start11CalendarTeamName();
    start11CalendarEditContext = {
        mode:"new",
        id:`manual_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
        source:START11_CALENDAR_MANUAL_SOURCE
    };
    if (typeof åbnKampplan === "function") åbnKampplan();
    const values = { homeTeam:ownTeam, awayTeam:"", matchDate:start11CalendarToIsoDate(date), matchTime:"", matchPlace:"" };
    Object.entries(values).forEach(([id,value]) => { const el=document.getElementById(id); if(el) el.value=value; });
}

function start11CalendarPersistEditedMatch() {
    if (!start11CalendarEditContext) return;
    const context = start11CalendarEditContext;
    const items = start11CalendarReadMatches();
    const edited = start11CalendarNormalizeMatch({
        id:context.id, source:context.source,
        type:context.source === "manual" ? "friendly" : "league",
        home:kampplan?.homeTeam||"", away:kampplan?.awayTeam||"",
        date:kampplan?.matchDate||"", time:kampplan?.matchTime||"", place:kampplan?.matchPlace||"",
        homeLogo:kampplan?.homeLogo||"", awayLogo:kampplan?.awayLogo||""
    });
    const index = items.findIndex(item => String(item?.id) === String(context.id));
    if (context.source === "manual") {
        if (index >= 0) items[index] = {...items[index],...edited}; else items.push(edited);
        start11CalendarSaveMatches(items);
    } else if (index >= 0) {
        items[index] = {...items[index],...edited,source:"dbu"};
        start11CalendarSaveMatches(items);
    }
    start11CalendarEditContext = null;
    start11RenderCalendar();
    start11RenderUpcomingMatchesV3();
}

function start11CalendarInjectStylesV2() {
    document.getElementById("start11CalendarStyles")?.remove();
    if (document.getElementById("start11CalendarStylesV2")) return;
    const style=document.createElement("style");
    style.id="start11CalendarStylesV2";
    style.textContent=`
      #start11MatchViewTabs{display:none!important}
      .start11-calendar-header-button{margin-left:8px}
      .start11-calendar-shell{display:none;border:1px solid rgba(129,255,70,.22);background:#09110b;border-radius:12px;padding:14px;margin:10px 0 16px}
      .start11-calendar-shell.active{display:block}
      .start11-calendar-toolbar{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px;flex-wrap:wrap}
      .start11-calendar-nav{display:flex;align-items:center;gap:8px}.start11-calendar-month{font-weight:900;text-transform:uppercase;min-width:150px;text-align:center}
      .start11-calendar-action{border:1px solid rgba(255,255,255,.15);background:#151a17;color:#fff;border-radius:7px;padding:8px 10px;font:inherit;font-weight:800;cursor:pointer}
      .start11-calendar-action.primary{background:#8cf34d;color:#071008;border-color:#8cf34d}
      .start11-calendar-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:5px}
      .start11-calendar-weekday{text-align:center;font-size:10px;opacity:.6;font-weight:900;padding:3px}
      .start11-calendar-day{min-height:92px;border:1px solid rgba(255,255,255,.08);background:#0d150f;border-radius:7px;padding:6px;cursor:pointer;overflow:hidden}
      .start11-calendar-day.other-month{opacity:.28}.start11-calendar-day.today{border-color:#8cf34d}.start11-calendar-day-number{font-size:11px;font-weight:900;margin-bottom:4px}
      .start11-calendar-match{display:block;width:100%;border:0;border-left:3px solid #8cf34d;background:rgba(140,243,77,.11);color:#fff;text-align:left;border-radius:4px;padding:5px;margin-top:4px;cursor:pointer;font:inherit;font-size:9px;line-height:1.2}
      .start11-calendar-match.manual{border-left-color:#fff;background:rgba(255,255,255,.08)}.start11-calendar-match strong{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.start11-calendar-match small{opacity:.7}
      .start11-calendar-legend{display:flex;gap:12px;margin-top:10px;font-size:10px;opacity:.7}.start11-calendar-dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:#8cf34d;margin-right:4px}.start11-calendar-dot.manual{background:#fff}
      .start11-calendar-mode .next-match-card,.start11-calendar-mode .upcoming-card,.start11-calendar-mode .dbu-connect-card{display:none!important}
      .start11-calendar-mode #start11CalendarShell{display:block!important}
      @media(max-width:650px){.start11-calendar-day{min-height:70px;padding:4px}.start11-calendar-match{font-size:8px;padding:3px}.start11-calendar-weekday{font-size:8px}}
    `;
    document.head.appendChild(style);
}

function start11CalendarBuildUIV2() {
    document.getElementById("start11MatchViewTabs")?.remove();
    document.getElementById("start11AddFriendlyButton")?.remove();
    start11CalendarInjectStylesV2();

    const matchesSection=document.getElementById("matchesSection");
    if(!matchesSection) return;

    let calendar=document.getElementById("start11CalendarShell");
    if(!calendar){
        calendar=document.createElement("div");
        calendar.className="start11-calendar-shell";
        calendar.id="start11CalendarShell";
        calendar.innerHTML=`
          <div class="start11-calendar-toolbar">
            <div class="start11-calendar-nav">
              <button type="button" class="start11-calendar-action" id="start11CalendarPrev">‹</button>
              <div class="start11-calendar-month" id="start11CalendarMonth"></div>
              <button type="button" class="start11-calendar-action" id="start11CalendarNext">›</button>
            </div>
            <div class="start11-calendar-nav">
              <button type="button" class="start11-calendar-action" id="start11CalendarToday">I DAG</button>
              <button type="button" class="start11-calendar-action primary" id="start11CalendarAddFriendly">+ TRÆNINGSKAMP</button>
              <button type="button" class="start11-calendar-action" id="start11CalendarClose">LUK</button>
            </div>
          </div>
          <div class="start11-calendar-grid" id="start11CalendarGrid"></div>
          <div class="start11-calendar-legend"><span><i class="start11-calendar-dot"></i>DBU-kamp</span><span><i class="start11-calendar-dot manual"></i>Træningskamp</span></div>`;
        const grid=matchesSection.querySelector(".matches-dashboard-grid,.dashboard-grid,.start11-matches-grid");
        if(grid) matchesSection.insertBefore(calendar,grid); else matchesSection.prepend(calendar);
    }

    const heading=document.querySelector(".upcoming-card .start11-card-heading");
    if(heading && !document.getElementById("start11CalendarHeaderButton")){
        const button=document.createElement("button");
        button.type="button"; button.id="start11CalendarHeaderButton";
        button.className="start11-text-button start11-calendar-header-button";
        button.textContent="Kalender";
        const edit=document.getElementById("editMatchPlanShortcut");
        if(edit) edit.insertAdjacentElement("afterend",button); else heading.appendChild(button);
        button.addEventListener("click",()=>start11CalendarSetOpen(true));
    }

    const bind=(id,fn)=>{const el=document.getElementById(id);if(el&&el.dataset.v2Bound!=="1"){el.dataset.v2Bound="1";el.addEventListener("click",fn)}};
    bind("start11CalendarPrev",()=>{start11CalendarDate=new Date(start11CalendarDate.getFullYear(),start11CalendarDate.getMonth()-1,1);start11RenderCalendar();});
    bind("start11CalendarNext",()=>{start11CalendarDate=new Date(start11CalendarDate.getFullYear(),start11CalendarDate.getMonth()+1,1);start11RenderCalendar();});
    bind("start11CalendarToday",()=>{start11CalendarDate=new Date();start11RenderCalendar();});
    bind("start11CalendarClose",()=>start11CalendarSetOpen(false));
    bind("start11CalendarAddFriendly",()=>start11CalendarCreateFriendly());
}

function start11CalendarSetOpen(open) {
    const section=document.getElementById("matchesSection");
    const shell=document.getElementById("start11CalendarShell");
    if(!section||!shell) return;
    section.classList.toggle("start11-calendar-mode",!!open);
    shell.classList.toggle("active",!!open);
    if(open){
        const next=start11CalendarAllMatches().find(m=>{const d=start11CalendarDateObject(m);return d&&d>=new Date(Date.now()-4*3600000)});
        if(next){const d=start11CalendarDateObject(next);start11CalendarDate=new Date(d.getFullYear(),d.getMonth(),1);}
        start11RenderCalendar();
    }
}

function start11RenderCalendar() {
    const grid=document.getElementById("start11CalendarGrid"), title=document.getElementById("start11CalendarMonth");
    if(!grid||!title) return;
    const year=start11CalendarDate.getFullYear(), month=start11CalendarDate.getMonth();
    title.textContent=new Intl.DateTimeFormat("da-DK",{month:"long",year:"numeric"}).format(new Date(year,month,1));
    const weekdays=["MAN","TIR","ONS","TOR","FRE","LØR","SØN"];
    grid.innerHTML=weekdays.map(d=>`<div class="start11-calendar-weekday">${d}</div>`).join("");
    const first=new Date(year,month,1), mondayIndex=(first.getDay()+6)%7, start=new Date(year,month,1-mondayIndex);
    const all=start11CalendarAllMatches();
    const now=new Date(), today=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
    for(let i=0;i<42;i++){
        const date=new Date(start.getFullYear(),start.getMonth(),start.getDate()+i);
        const iso=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
        const day=document.createElement("div"); day.className="start11-calendar-day";
        if(date.getMonth()!==month)day.classList.add("other-month");if(iso===today)day.classList.add("today");
        day.innerHTML=`<div class="start11-calendar-day-number">${date.getDate()}</div>`;
        all.filter(m=>m.date===iso).forEach(match=>{
            const b=document.createElement("button");b.type="button";b.className=`start11-calendar-match ${match.source==="manual"?"manual":"dbu"}`;
            b.innerHTML=`<strong>${start11Escape(start11CalendarOpponent(match))}</strong><small>${start11Escape(match.time||"—")} · ${match.source==="manual"?"TRÆNING":"DBU"}</small>`;
            b.addEventListener("click",e=>{e.stopPropagation();start11CalendarApplyMatchToEditor(match)});day.appendChild(b);
        });
        // Klik på dato opretter træningskamp – kun inde i kalenderen.
        day.addEventListener("click",()=>start11CalendarCreateFriendly(iso));grid.appendChild(day);
    }
}

function start11RenderUpcomingMatchesV3() {
    const list=document.getElementById("upcomingMatchesList");if(!list)return;
    const now=new Date();
    const matches=start11CalendarAllMatches().filter(m=>{const d=start11CalendarDateObject(m);return d&&d.getTime()>=now.getTime()-4*3600000}).slice(0,6);
    list.innerHTML="";
    if(!matches.length){const e=document.createElement("div");e.className="upcoming-match-row";e.textContent="Ingen kommende kampe endnu.";list.appendChild(e);return;}
    matches.forEach(match=>{
        const row=document.createElement("div");row.className="upcoming-match-row start11-upcoming-v2-row";
        row.innerHTML=`<span>${start11Escape(start11CalendarFormatShortDate(match.date))}</span><span class="match-opponent">${start11Escape(start11CalendarOpponent(match))}</span><span>${start11Escape(start11CalendarHomeAway(match)||(match.source==="manual"?"T":""))}</span><span>${start11Escape(match.time||"—")}</span>`;
        row.addEventListener("click",()=>start11CalendarApplyMatchToEditor(match));list.appendChild(row);
    });
}

function start11ApplyAutomaticLogosFromMatch(match) {
    if(!match)return;
    const normalized=start11CalendarNormalizeMatch(match);
    const update=(imgId,fallbackId,url)=>{
        const img=document.getElementById(imgId), fallback=document.getElementById(fallbackId);
        if(!img)return;
        if(url){img.src=url;img.style.display="block";if(fallback)fallback.style.display="none";img.onerror=()=>{img.style.display="none";if(fallback)fallback.style.display="";};}
        else{img.removeAttribute("src");img.style.display="none";if(fallback)fallback.style.display="";}
    };
    update("dashboardHomeLogo","dashboardHomeLogoFallback",normalized.homeLogo);
    update("dashboardAwayLogo","dashboardAwayLogoFallback",normalized.awayLogo);
}

function start11RenderNextDbuMatch(providedMatches=null) {
    const matches=(Array.isArray(providedMatches)?providedMatches:start11CalendarAllMatches()).map(start11CalendarNormalizeMatch);
    const now=new Date();
    const match=matches.find(m=>{const d=start11CalendarDateObject(m);return d&&d.getTime()>=now.getTime()-4*3600000;});
    if(!match)return;
    const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v||"—"};
    set("dashboardHomeTeam",match.home);set("dashboardAwayTeam",match.away);set("dashboardMatchDate",start11CalendarFormatShortDate(match.date));set("dashboardMatchTime",match.time);set("dashboardMatchPlace",match.place);set("dashboardCompetition",match.source==="manual"?"TRÆNINGSKAMP":"DBU KAMPPROGRAM");
    start11ApplyAutomaticLogosFromMatch(match);
}

function start11InstallCalendarV2() {
    start11CalendarBuildUIV2();
    start11RenderCalendar();
    start11RenderUpcomingMatchesV3();
    start11RenderNextDbuMatch();
    const save=document.getElementById("saveMatchplan");if(save&&save.dataset.calendarV2Bound!=="1"){save.dataset.calendarV2Bound="1";save.addEventListener("click",()=>setTimeout(start11CalendarPersistEditedMatch,0));}
    const sync=document.getElementById("syncDbuMatchesButton");if(sync&&sync.dataset.calendarV2Bound!=="1"){sync.dataset.calendarV2Bound="1";sync.addEventListener("click",()=>setTimeout(()=>{start11RenderUpcomingMatchesV3();start11RenderCalendar();start11RenderNextDbuMatch();},1400));}
}

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(start11InstallCalendarV2,250));else setTimeout(start11InstallCalendarV2,250);


/* =========================================================
   START11 – KAMPKALENDER V3 FIX
   - Kalender viser kampene tydeligt i både månedsgitter og liste
   - Træningskampe kan slettes direkte fra kalenderen
   - Kommende kampe viser kun reelt kommende kampe i datoorden
   - Legacy "current match" overskriver ikke længere næste kamp
========================================================= */

function start11CalendarV3IsUpcoming(match) {
    const date = start11CalendarDateObject(match);
    if (!date) return false;
    return date.getTime() >= Date.now() - (4 * 60 * 60 * 1000);
}

function start11CalendarV3SortedMatches() {
    return start11CalendarAllMatches()
        .slice()
        .sort((a, b) => {
            const da = start11CalendarDateObject(a);
            const db = start11CalendarDateObject(b);
            if (!da && !db) return 0;
            if (!da) return 1;
            if (!db) return -1;
            return da.getTime() - db.getTime();
        });
}

function start11CalendarV3DeleteManualMatch(matchId) {
    const matches = start11CalendarReadMatches();
    const target = matches.find(item => String(item?.id || "") === String(matchId || ""));

    if (!target || target?.source !== START11_CALENDAR_MANUAL_SOURCE) {
        if (typeof visNotification === "function") {
            visNotification("Kun træningskampe kan slettes herfra.");
        }
        return;
    }

    const normalized = start11CalendarNormalizeMatch(target);
    const opponent = start11CalendarOpponent(normalized);
    const date = start11CalendarFormatShortDate(normalized.date);

    if (!window.confirm(`Fjern træningskampen mod ${opponent} (${date})?`)) {
        return;
    }

    const nextMatches = matches.filter(
        item => String(item?.id || "") !== String(matchId || "")
    );

    start11CalendarSaveMatches(nextMatches);

    if (
        start11CalendarEditContext &&
        String(start11CalendarEditContext.id) === String(matchId)
    ) {
        start11CalendarEditContext = null;
    }

    start11RenderCalendarV3();
    start11RenderUpcomingMatchesV4();
    start11RenderNextMatchV4();

    if (typeof visNotification === "function") {
        visNotification("Træningskampen er fjernet.");
    }
}

function start11CalendarV3EnsureMonthList() {
    const shell = document.getElementById("start11CalendarShell");
    if (!shell) return null;

    let list = document.getElementById("start11CalendarMonthMatches");

    if (!list) {
        list = document.createElement("div");
        list.id = "start11CalendarMonthMatches";
        list.className = "start11-calendar-month-matches";
        shell.appendChild(list);
    }

    return list;
}

function start11CalendarV3InjectStyles() {
    if (document.getElementById("start11CalendarStylesV3")) return;

    const style = document.createElement("style");
    style.id = "start11CalendarStylesV3";
    style.textContent = `
      .start11-calendar-day{overflow:visible!important;min-width:0}
      .start11-calendar-event{display:flex;align-items:stretch;gap:3px;margin-top:4px;min-width:0}
      .start11-calendar-event-open{flex:1;min-width:0;border:0;border-left:3px solid #8cf34d;background:rgba(140,243,77,.11);color:#fff;text-align:left;border-radius:4px;padding:5px;cursor:pointer;font:inherit;font-size:9px;line-height:1.2;overflow:hidden}
      .start11-calendar-event.manual .start11-calendar-event-open{border-left-color:#fff;background:rgba(255,255,255,.08)}
      .start11-calendar-event-open strong{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .start11-calendar-event-open small{display:block;opacity:.72;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .start11-calendar-delete{width:23px;flex:0 0 23px;border:1px solid rgba(255,85,85,.35);background:rgba(255,65,65,.09);color:#ff7474;border-radius:4px;cursor:pointer;font:inherit;font-weight:900;padding:0}
      .start11-calendar-delete:hover{background:rgba(255,65,65,.19)}
      .start11-calendar-month-matches{margin-top:14px;border-top:1px solid rgba(255,255,255,.08);padding-top:12px}
      .start11-calendar-month-list-title{font-weight:900;text-transform:uppercase;font-size:12px;margin-bottom:8px}
      .start11-calendar-month-row{display:grid;grid-template-columns:72px minmax(0,1fr) 48px 30px;gap:8px;align-items:center;padding:9px 6px;border-bottom:1px solid rgba(255,255,255,.07);font-size:10px}
      .start11-calendar-month-row:last-child{border-bottom:0}
      .start11-calendar-month-row-main{min-width:0;cursor:pointer}
      .start11-calendar-month-row-main strong{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .start11-calendar-month-row-main small{display:block;opacity:.62;margin-top:2px}
      .start11-calendar-source{font-size:8px;font-weight:900;text-align:center;padding:3px 4px;border-radius:10px;background:rgba(140,243,77,.12);color:#8cf34d}
      .start11-calendar-source.manual{background:rgba(255,255,255,.1);color:#fff}
      .start11-calendar-empty{font-size:10px;opacity:.6;padding:10px 0}
      @media(max-width:650px){
        .start11-calendar-shell{padding:10px!important}
        .start11-calendar-grid{gap:3px!important}
        .start11-calendar-day{min-height:64px!important;padding:3px!important}
        .start11-calendar-day-number{font-size:9px!important}
        .start11-calendar-event-open{padding:3px 2px;font-size:7px;border-left-width:2px}
        .start11-calendar-delete{width:17px;flex-basis:17px;font-size:9px}
        .start11-calendar-month-row{grid-template-columns:58px minmax(0,1fr) 42px 26px;gap:5px;padding:8px 2px;font-size:9px}
      }
    `;

    document.head.appendChild(style);
}

function start11RenderCalendarMonthListV3() {
    const list = start11CalendarV3EnsureMonthList();
    if (!list) return;

    const year = start11CalendarDate.getFullYear();
    const month = start11CalendarDate.getMonth();

    const matches = start11CalendarV3SortedMatches().filter(match => {
        const date = start11CalendarDateObject(match);
        return date && date.getFullYear() === year && date.getMonth() === month;
    });

    list.innerHTML = "";

    const title = document.createElement("div");
    title.className = "start11-calendar-month-list-title";
    title.textContent = "Månedens kampe";
    list.appendChild(title);

    if (!matches.length) {
        const empty = document.createElement("div");
        empty.className = "start11-calendar-empty";
        empty.textContent = "Ingen kampe i denne måned.";
        list.appendChild(empty);
        return;
    }

    matches.forEach(match => {
        const row = document.createElement("div");
        row.className = "start11-calendar-month-row";

        const dateCell = document.createElement("div");
        dateCell.textContent = start11CalendarFormatShortDate(match.date);

        const main = document.createElement("div");
        main.className = "start11-calendar-month-row-main";
        main.innerHTML = `
            <strong>${start11Escape(start11CalendarOpponent(match))}</strong>
            <small>${start11Escape(match.time || "Tid ikke valgt")} · ${start11Escape(match.place || "Spillested ikke valgt")}</small>
        `;
        main.addEventListener("click", () => start11CalendarApplyMatchToEditor(match));

        const source = document.createElement("div");
        source.className = `start11-calendar-source ${match.source === "manual" ? "manual" : ""}`;
        source.textContent = match.source === "manual" ? "TRÆNING" : "DBU";

        const action = document.createElement("div");

        if (match.source === START11_CALENDAR_MANUAL_SOURCE) {
            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "start11-calendar-delete";
            deleteButton.title = "Fjern træningskamp";
            deleteButton.setAttribute("aria-label", "Fjern træningskamp");
            deleteButton.textContent = "×";
            deleteButton.addEventListener("click", event => {
                event.stopPropagation();
                start11CalendarV3DeleteManualMatch(match.id);
            });
            action.appendChild(deleteButton);
        }

        row.append(dateCell, main, source, action);
        list.appendChild(row);
    });
}

function start11RenderCalendarV3() {
    const grid = document.getElementById("start11CalendarGrid");
    const title = document.getElementById("start11CalendarMonth");

    if (!grid || !title) return;

    start11CalendarV3InjectStyles();

    const year = start11CalendarDate.getFullYear();
    const month = start11CalendarDate.getMonth();

    title.textContent = new Intl.DateTimeFormat("da-DK", {
        month: "long",
        year: "numeric"
    }).format(new Date(year, month, 1));

    const weekdays = ["MAN", "TIR", "ONS", "TOR", "FRE", "LØR", "SØN"];
    grid.innerHTML = weekdays
        .map(day => `<div class="start11-calendar-weekday">${day}</div>`)
        .join("");

    const first = new Date(year, month, 1);
    const mondayIndex = (first.getDay() + 6) % 7;
    const start = new Date(year, month, 1 - mondayIndex);
    const allMatches = start11CalendarV3SortedMatches();

    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    for (let i = 0; i < 42; i++) {
        const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
        const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

        const day = document.createElement("div");
        day.className = "start11-calendar-day";

        if (date.getMonth() !== month) day.classList.add("other-month");
        if (iso === today) day.classList.add("today");

        const dayNumber = document.createElement("div");
        dayNumber.className = "start11-calendar-day-number";
        dayNumber.textContent = String(date.getDate());
        day.appendChild(dayNumber);

        const dayMatches = allMatches.filter(match => match.date === iso);

        dayMatches.forEach(match => {
            const eventWrap = document.createElement("div");
            eventWrap.className = `start11-calendar-event ${match.source === "manual" ? "manual" : "dbu"}`;

            const openButton = document.createElement("button");
            openButton.type = "button";
            openButton.className = "start11-calendar-event-open";
            openButton.innerHTML = `
                <strong>${start11Escape(start11CalendarOpponent(match))}</strong>
                <small>${start11Escape(match.time || "—")} · ${match.source === "manual" ? "TRÆNING" : "DBU"}</small>
            `;
            openButton.addEventListener("click", event => {
                event.stopPropagation();
                start11CalendarApplyMatchToEditor(match);
            });

            eventWrap.appendChild(openButton);

            if (match.source === START11_CALENDAR_MANUAL_SOURCE) {
                const deleteButton = document.createElement("button");
                deleteButton.type = "button";
                deleteButton.className = "start11-calendar-delete";
                deleteButton.title = "Fjern træningskamp";
                deleteButton.setAttribute("aria-label", "Fjern træningskamp");
                deleteButton.textContent = "×";
                deleteButton.addEventListener("click", event => {
                    event.stopPropagation();
                    start11CalendarV3DeleteManualMatch(match.id);
                });
                eventWrap.appendChild(deleteButton);
            }

            day.appendChild(eventWrap);
        });

        day.addEventListener("click", () => start11CalendarCreateFriendly(iso));
        grid.appendChild(day);
    }

    start11RenderCalendarMonthListV3();
}

function start11RenderUpcomingMatchesV4() {
    const list = document.getElementById("upcomingMatchesList");
    if (!list) return;

    const matches = start11CalendarV3SortedMatches()
        .filter(start11CalendarV3IsUpcoming)
        .slice(0, 6);

    list.innerHTML = "";

    if (!matches.length) {
        const empty = document.createElement("div");
        empty.className = "upcoming-match-row";
        empty.textContent = "Ingen kommende kampe endnu.";
        list.appendChild(empty);
        return;
    }

    matches.forEach(match => {
        const row = document.createElement("div");
        row.className = "upcoming-match-row start11-upcoming-v4-row";

        row.innerHTML = `
            <span>${start11Escape(start11CalendarFormatShortDate(match.date))}</span>
            <span class="match-opponent">${start11Escape(start11CalendarOpponent(match))}</span>
            <span>${start11Escape(start11CalendarHomeAway(match) || (match.source === "manual" ? "T" : ""))}</span>
            <span>${start11Escape(match.time || "—")}</span>
        `;

        row.addEventListener("click", () => start11CalendarApplyMatchToEditor(match));
        list.appendChild(row);
    });
}

function start11RenderNextMatchV4() {
    const match = start11CalendarV3SortedMatches()
        .find(start11CalendarV3IsUpcoming);

    if (!match) return;

    const setText = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value || "—";
    };

    setText("dashboardHomeTeam", match.home);
    setText("dashboardAwayTeam", match.away);
    setText("dashboardMatchDate", match.date);
    setText("dashboardMatchTime", match.time);
    setText("dashboardMatchPlace", match.place || "Spillested ikke valgt");
    setText(
        "dashboardCompetition",
        match.source === START11_CALENDAR_MANUAL_SOURCE
            ? "TRÆNINGSKAMP"
            : "DBU KAMPPROGRAM"
    );

    start11ApplyAutomaticLogosFromMatch(match);
}

/*
   Vigtigt: den gamle dashboard-funktion kaldte sin egen liste-renderer
   og kunne lægge den redigerede kamp øverst igen. Her overtager V4.
*/
start11RenderUpcomingMatches = function () {
    return start11RenderUpcomingMatchesV4();
};

start11RenderNextDbuMatch = function () {
    return start11RenderNextMatchV4();
};

start11RenderCalendar = function () {
    return start11RenderCalendarV3();
};

if (typeof start11RenderMatchDashboard === "function") {
    const start11RenderMatchDashboardBeforeCalendarV3 = start11RenderMatchDashboard;

    start11RenderMatchDashboard = function (...args) {
        const result = start11RenderMatchDashboardBeforeCalendarV3.apply(this, args);
        start11RenderUpcomingMatchesV4();
        start11RenderNextMatchV4();
        return result;
    };
}

function start11InstallCalendarV3Fix() {
    start11CalendarV3InjectStyles();
    start11CalendarBuildUIV2();
    start11CalendarV3EnsureMonthList();

    /* Genbind månedsknappernes efter-render så V3 altid anvendes. */
    const rerenderSoon = () => setTimeout(start11RenderCalendarV3, 0);
    ["start11CalendarPrev", "start11CalendarNext", "start11CalendarToday"].forEach(id => {
        const element = document.getElementById(id);
        if (element && element.dataset.v3RenderBound !== "1") {
            element.dataset.v3RenderBound = "1";
            element.addEventListener("click", rerenderSoon);
        }
    });

    const calendarButton = document.getElementById("start11CalendarHeaderButton");
    if (calendarButton && calendarButton.dataset.v3Bound !== "1") {
        calendarButton.dataset.v3Bound = "1";
        calendarButton.addEventListener("click", () => {
            setTimeout(() => {
                /* Åbn på måneden med den nærmeste kommende kamp. */
                const next = start11CalendarV3SortedMatches().find(start11CalendarV3IsUpcoming);
                if (next) {
                    const date = start11CalendarDateObject(next);
                    if (date) start11CalendarDate = new Date(date.getFullYear(), date.getMonth(), 1);
                }
                start11RenderCalendarV3();
            }, 0);
        });
    }

    const syncButton = document.getElementById("syncDbuMatchesButton");
    if (syncButton && syncButton.dataset.v3CalendarBound !== "1") {
        syncButton.dataset.v3CalendarBound = "1";
        syncButton.addEventListener("click", () => {
            setTimeout(() => {
                start11RenderUpcomingMatchesV4();
                start11RenderNextMatchV4();
                start11RenderCalendarV3();
            }, 1600);
        });
    }

    start11RenderUpcomingMatchesV4();
    start11RenderNextMatchV4();
    start11RenderCalendarV3();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        setTimeout(start11InstallCalendarV3Fix, 450);
    });
} else {
    setTimeout(start11InstallCalendarV3Fix, 450);
}


/* =========================================================
   START11 – DASHBOARD / DBU FIX V5
   - Nyt "Næste kamp" design
   - Mere detaljeret "Kommende kampe"
   - Logoer vises ved kommende kampe
   - Generisk DBU-logo filtreres væk
   - Genbruger rigtige klublogoer fra andre DBU-kampe
   - Retter kendt DBU-kamp 731933:
     Fortuna Svendborg/Oure FA - FC Thy Piger - Skyum
     på Oure Idrætsskole
========================================================= */

const START11_V5_MATCH_CORRECTIONS = {
    /*
        V6:
        Ingen hårdkodede kamp-rettelser længere.
        DBU Edge Functionen er nu source of truth for:
        - hjemmehold
        - udehold
        - spillested
        - logoer
    */
};


function start11V5NormalizeTeamKey(value) {

    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ")
        .replace(/[^\p{L}\p{N}]+/gu, "");

}


function start11V5IsGenericDbuLogo(value) {

    const url =
        String(value || "")
            .trim()
            .toLowerCase();


    if (!url) {

        return true;

    }


    /*
        Vi må ikke afvise alle billeder fra dbu.dk,
        fordi rigtige klublogoer også kan ligge der.
        Vi filtrerer kun tydelige DBU-/site-logoer.
    */
    return (
        url.includes("dbu-logo") ||
        url.includes("dbulogo") ||
        url.includes("logo-dbu") ||
        url.includes("logo_dbu") ||
        url.includes("dansk-boldspil") ||
        url.includes("danskboldspil") ||
        url.includes("favicon") ||
        url.includes("apple-touch-icon") ||
        url.endsWith("/logo.svg") ||
        url.endsWith("/logo.png")
    );

}


function start11V5RepairSingleMatch(match) {

    if (!match || typeof match !== "object") {

        return match;

    }


    const repaired = {
        ...match
    };


    const matchNumber =
        String(
            repaired.matchNumber ||
            repaired.match_number ||
            ""
        ).trim();


    const correction =
        START11_V5_MATCH_CORRECTIONS[
            matchNumber
        ];


    if (correction) {

        /*
            Denne kamp var læst forkert som om
            Oure Idrætsskole var udeholdet.
            Oure Idrætsskole er spillestedet.
        */
        repaired.home =
            correction.home;

        repaired.homeTeam =
            correction.home;

        repaired.away =
            correction.away;

        repaired.awayTeam =
            correction.away;

        repaired.place =
            correction.place;

        repaired.venue =
            correction.place;


        /*
            De gamle logoer kunne være koblet til de
            forkerte felter. Fjern dem her og genfind
            dem ud fra holdnavnene længere nede.
        */
        repaired.homeLogo = "";
        repaired.awayLogo = "";

    }


    return repaired;

}


function start11V5BuildTeamLogoMap(matches) {

    const map =
        new Map();


    (Array.isArray(matches) ? matches : [])
        .forEach(
            rawMatch => {

                const match =
                    rawMatch &&
                    typeof rawMatch === "object"
                        ? rawMatch
                        : {};


                const pairs = [
                    {
                        name:
                            match.home ||
                            match.homeTeam ||
                            "",
                        logo:
                            match.homeLogo ||
                            match.home_logo ||
                            ""
                    },
                    {
                        name:
                            match.away ||
                            match.awayTeam ||
                            "",
                        logo:
                            match.awayLogo ||
                            match.away_logo ||
                            ""
                    }
                ];


                pairs.forEach(
                    pair => {

                        const name =
                            String(
                                pair.name || ""
                            ).trim();

                        const logo =
                            String(
                                pair.logo || ""
                            ).trim();


                        if (
                            !name ||
                            !logo ||
                            start11V5IsGenericDbuLogo(
                                logo
                            )
                        ) {

                            return;

                        }


                        const key =
                            start11V5NormalizeTeamKey(
                                name
                            );


                        if (
                            key &&
                            !map.has(key)
                        ) {

                            map.set(
                                key,
                                logo
                            );

                        }

                    }
                );

            }
        );


    return map;

}


function start11V5RepairMatches(items) {

    const source =
        Array.isArray(items)
            ? items
            : [];


    /*
        Først laves logo-map på de oprindelige DBU-data.
        Dermed kan vi genbruge FC Thy-/Fortuna-logoet fra
        andre kampe, hvis lige netop én kamp er læst forkert.
    */
    const logoMap =
        start11V5BuildTeamLogoMap(
            source
        );


    return source.map(
        rawMatch => {

            const match =
                start11V5RepairSingleMatch(
                    rawMatch
                );


            if (
                !match ||
                typeof match !== "object"
            ) {

                return match;

            }


            const repaired = {
                ...match
            };


            const home =
                String(
                    repaired.home ||
                    repaired.homeTeam ||
                    ""
                ).trim();

            const away =
                String(
                    repaired.away ||
                    repaired.awayTeam ||
                    ""
                ).trim();


            const homeKey =
                start11V5NormalizeTeamKey(
                    home
                );

            const awayKey =
                start11V5NormalizeTeamKey(
                    away
                );


            let homeLogo =
                String(
                    repaired.homeLogo ||
                    repaired.home_logo ||
                    ""
                ).trim();

            let awayLogo =
                String(
                    repaired.awayLogo ||
                    repaired.away_logo ||
                    ""
                ).trim();


            if (
                start11V5IsGenericDbuLogo(
                    homeLogo
                )
            ) {

                homeLogo = "";

            }


            if (
                start11V5IsGenericDbuLogo(
                    awayLogo
                )
            ) {

                awayLogo = "";

            }


            if (
                !homeLogo &&
                homeKey &&
                logoMap.has(homeKey)
            ) {

                homeLogo =
                    logoMap.get(homeKey) ||
                    "";

            }


            if (
                !awayLogo &&
                awayKey &&
                logoMap.has(awayKey)
            ) {

                awayLogo =
                    logoMap.get(awayKey) ||
                    "";

            }


            repaired.home =
                home;

            repaired.homeTeam =
                home;

            repaired.away =
                away;

            repaired.awayTeam =
                away;

            repaired.homeLogo =
                homeLogo;

            repaired.awayLogo =
                awayLogo;


            return repaired;

        }
    );

}


/*
   Ret DBU-normaliseringen allerede inden kampene gemmes.
*/
if (
    typeof start11NormalizeDbuMatch ===
    "function"
) {

    const start11NormalizeDbuMatchBeforeV5 =
        start11NormalizeDbuMatch;


    start11NormalizeDbuMatch =
        function (
            match,
            index = 0
        ) {

            const repairedInput =
                start11V5RepairSingleMatch(
                    match
                );


            const normalized =
                start11NormalizeDbuMatchBeforeV5(
                    repairedInput,
                    index
                );


            return start11V5RepairSingleMatch(
                normalized
            );

        };

}


/*
   Ret også allerede gemte kampe efter reload.
*/
if (
    typeof start11CalendarReadMatches ===
    "function"
) {

    const start11CalendarReadMatchesBeforeV5 =
        start11CalendarReadMatches;


    start11CalendarReadMatches =
        function () {

            const matches =
                start11CalendarReadMatchesBeforeV5();


            return start11V5RepairMatches(
                matches
            );

        };

}


function start11V5GetOpponentData(
    match
) {

    const normalized =
        start11CalendarNormalizeMatch(
            match
        );


    const own =
        start11CalendarTeamName()
            .toLowerCase();


    const isHome =
        String(
            normalized.home || ""
        )
            .trim()
            .toLowerCase() ===
        own;


    const isAway =
        String(
            normalized.away || ""
        )
            .trim()
            .toLowerCase() ===
        own;


    if (isHome) {

        return {
            name:
                normalized.away ||
                "Modstander",
            logo:
                normalized.awayLogo ||
                "",
            homeAway:
                "H"
        };

    }


    if (isAway) {

        return {
            name:
                normalized.home ||
                "Modstander",
            logo:
                normalized.homeLogo ||
                "",
            homeAway:
                "U"
        };

    }


    return {
        name:
            normalized.away ||
            normalized.home ||
            "Modstander",
        logo:
            normalized.awayLogo ||
            normalized.homeLogo ||
            "",
        homeAway:
            normalized.source ===
                START11_CALENDAR_MANUAL_SOURCE
                ? "T"
                : ""
    };

}


function start11V5Initials(
    name
) {

    const words =
        String(name || "")
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (!words.length) {

        return "?";

    }


    if (words.length === 1) {

        return words[0]
            .slice(0, 2)
            .toUpperCase();

    }


    return (
        words[0][0] +
        words[1][0]
    ).toUpperCase();

}


function start11V5LogoMarkup(
    logo,
    name,
    className = ""
) {

    const safeLogo =
        start11V5IsGenericDbuLogo(
            logo
        )
            ? ""
            : String(
                logo || ""
            ).trim();


    if (safeLogo) {

        return `
            <span class="start11-v5-row-logo ${className}">
                <img
                    src="${start11Escape(safeLogo)}"
                    alt=""
                    loading="lazy"
                    referrerpolicy="no-referrer"
                >
                <span class="start11-v5-logo-fallback">
                    ${start11Escape(
                        start11V5Initials(
                            name
                        )
                    )}
                </span>
            </span>
        `;

    }


    return `
        <span class="start11-v5-row-logo ${className}">
            <span class="start11-v5-logo-fallback visible">
                ${start11Escape(
                    start11V5Initials(
                        name
                    )
                )}
            </span>
        </span>
    `;

}


function start11V5BindLogoFallbacks(
    root
) {

    (
        root ||
        document
    )
        .querySelectorAll(
            ".start11-v5-row-logo img"
        )
        .forEach(
            image => {

                const wrapper =
                    image.closest(
                        ".start11-v5-row-logo"
                    );

                const fallback =
                    wrapper?.querySelector(
                        ".start11-v5-logo-fallback"
                    );


                const showFallback =
                    () => {

                        image.style.display =
                            "none";

                        if (fallback) {

                            fallback.classList.add(
                                "visible"
                            );

                        }

                    };


                image.addEventListener(
                    "error",
                    showFallback,
                    {
                        once: true
                    }
                );


                image.addEventListener(
                    "load",
                    () => {

                        if (
                            image.naturalWidth < 12 ||
                            image.naturalHeight < 12
                        ) {

                            showFallback();

                        }

                    },
                    {
                        once: true
                    }
                );

            }
        );

}


function start11RenderUpcomingMatchesV5() {

    const list =
        document.getElementById(
            "upcomingMatchesList"
        );


    if (!list) {

        return;

    }


    const matches =
        start11CalendarV3SortedMatches()
            .filter(
                start11CalendarV3IsUpcoming
            )
            .slice(
                0,
                6
            );


    list.innerHTML =
        "";


    if (!matches.length) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "start11-v5-empty";

        empty.textContent =
            "Ingen kommende kampe endnu.";


        list.appendChild(
            empty
        );

        return;

    }


    matches.forEach(
        (
            rawMatch,
            index
        ) => {

            const match =
                start11CalendarNormalizeMatch(
                    rawMatch
                );


            const opponent =
                start11V5GetOpponentData(
                    match
                );


            const row =
                document.createElement(
                    "button"
                );


            row.type =
                "button";

            row.className =
                "upcoming-match-row start11-upcoming-v5-row" +
                (
                    index === 0
                        ? " current"
                        : ""
                );


            row.innerHTML = `
                <span class="start11-v5-date">
                    ${start11Escape(
                        start11CalendarFormatShortDate(
                            match.date
                        )
                    )}
                </span>

                <span class="start11-v5-time">
                    ${start11Escape(
                        match.time ||
                        "—"
                    )}
                </span>

                <span class="start11-v5-opponent">
                    ${start11V5LogoMarkup(
                        opponent.logo,
                        opponent.name
                    )}

                    <span class="start11-v5-opponent-copy">
                        <strong>
                            ${start11Escape(
                                opponent.name
                            )}
                        </strong>

                        <small>
                            ${start11Escape(
                                match.place ||
                                "Spillested ikke valgt"
                            )}
                        </small>
                    </span>
                </span>

                <span class="start11-v5-home-away">
                    ${start11Escape(
                        opponent.homeAway
                    )}
                </span>
            `;


            row.addEventListener(
                "click",
                () =>
                    start11CalendarApplyMatchToEditor(
                        match
                    )
            );


            list.appendChild(
                row
            );

        }
    );


    start11V5BindLogoFallbacks(
        list
    );

}


function start11V5ApplyDashboardLogo(
    imageId,
    fallbackId,
    logo,
    teamName
) {

    const image =
        document.getElementById(
            imageId
        );


    const fallback =
        document.getElementById(
            fallbackId
        );


    let safeLogo =
        String(
            logo || ""
        ).trim();


    if (
        start11V5IsGenericDbuLogo(
            safeLogo
        )
    ) {

        safeLogo = "";

    }


    const showFallback =
        () => {

            if (image) {

                image.removeAttribute(
                    "src"
                );

                image.style.display =
                    "none";

            }


            if (fallback) {

                fallback.style.display =
                    "grid";

                fallback.textContent =
                    start11V5Initials(
                        teamName
                    );

            }

        };


    if (
        image &&
        safeLogo
    ) {

        image.onload =
            () => {

                if (
                    image.naturalWidth < 12 ||
                    image.naturalHeight < 12
                ) {

                    showFallback();

                }

            };


        image.onerror =
            showFallback;


        image.src =
            safeLogo;

        image.style.display =
            "block";


        if (fallback) {

            fallback.style.display =
                "none";

        }

    } else {

        showFallback();

    }

}


function start11RenderNextMatchV5() {

    const match =
        start11CalendarV3SortedMatches()
            .find(
                start11CalendarV3IsUpcoming
            );


    if (!match) {

        return;

    }


    const normalized =
        start11CalendarNormalizeMatch(
            start11V5RepairSingleMatch(
                match
            )
        );


    const setText =
        (
            id,
            value
        ) => {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.textContent =
                    value ||
                    "—";

            }

        };


    setText(
        "dashboardHomeTeam",
        normalized.home
    );


    setText(
        "dashboardAwayTeam",
        normalized.away
    );


    setText(
        "dashboardMatchDate",
        normalized.date
    );


    setText(
        "dashboardMatchTime",
        normalized.time
    );


    setText(
        "dashboardMatchPlace",
        normalized.place ||
        "Spillested ikke valgt"
    );


    setText(
        "dashboardCompetition",
        normalized.source ===
            START11_CALENDAR_MANUAL_SOURCE
            ? "TRÆNINGSKAMP"
            : "DBU KAMPPROGRAM"
    );


    start11V5ApplyDashboardLogo(
        "dashboardHomeLogo",
        "dashboardHomeLogoFallback",
        normalized.homeLogo,
        normalized.home
    );


    start11V5ApplyDashboardLogo(
        "dashboardAwayLogo",
        "dashboardAwayLogoFallback",
        normalized.awayLogo,
        normalized.away
    );

}


/*
   Overtag dashboard-rendererne.
*/
start11RenderUpcomingMatches =
    function () {

        return start11RenderUpcomingMatchesV5();

    };


start11RenderNextDbuMatch =
    function () {

        return start11RenderNextMatchV5();

    };


function start11V5InjectDashboardStyles() {

    if (
        document.getElementById(
            "start11DashboardV5Styles"
        )
    ) {

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "start11DashboardV5Styles";


    style.textContent = `

        /* =============================================
           START11 V5 – VENSTRE KAMPDASHBOARD
        ============================================= */

        .next-match-card,
        .upcoming-card {
            border: 1px solid rgba(134,255,76,.22) !important;
            border-radius: 12px !important;
            background:
                radial-gradient(circle at 50% 0%, rgba(22,74,35,.12), transparent 45%),
                linear-gradient(180deg,#07120a 0%,#050d07 100%) !important;
            box-shadow:
                inset 0 1px 0 rgba(255,255,255,.025),
                0 12px 30px rgba(0,0,0,.12) !important;
        }

        .next-match-card {
            padding: 18px 16px 16px !important;
        }

        .next-match-card .start11-card-heading {
            align-items: flex-start !important;
            margin-bottom: 4px !important;
        }

        .next-match-card .start11-card-heading h2,
        .upcoming-card .start11-card-heading h2 {
            margin: 0 !important;
            color: #fff !important;
            font-size: 15px !important;
            line-height: 1.1 !important;
            letter-spacing: .35px !important;
            text-transform: uppercase !important;
        }

        .next-match-league {
            margin-top: 14px !important;
            color: #aebcaf !important;
            font-size: 9px !important;
            letter-spacing: .45px !important;
            text-transform: uppercase !important;
        }

        .start11-dbu-badge {
            width: 34px !important;
            height: 34px !important;
            min-width: 34px !important;
            display: grid !important;
            place-items: center !important;
            padding: 0 !important;
            border: 2px solid rgba(255,87,87,.72) !important;
            border-radius: 50% !important;
            background: #cf2727 !important;
            color: #fff !important;
            font-size: 8px !important;
            font-weight: 900 !important;
            box-shadow:
                inset 0 0 0 1px rgba(255,255,255,.12),
                0 4px 15px rgba(202,35,35,.14) !important;
        }

        .next-match-versus {
            display: grid !important;
            grid-template-columns: minmax(0,1fr) 34px minmax(0,1fr) !important;
            align-items: center !important;
            gap: 6px !important;
            margin: 22px 0 12px !important;
        }

        .next-match-team {
            min-width: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            gap: 9px !important;
            text-align: center !important;
        }

        .dashboard-team-logo {
            width: 66px !important;
            height: 66px !important;
            border: 1px solid rgba(255,255,255,.2) !important;
            border-radius: 50% !important;
            overflow: hidden !important;
            display: grid !important;
            place-items: center !important;
            background:
                radial-gradient(circle at 50% 35%,rgba(255,255,255,.055),rgba(0,0,0,.12)),
                #071009 !important;
            box-shadow:
                0 8px 20px rgba(0,0,0,.18),
                inset 0 0 0 3px rgba(255,255,255,.018) !important;
        }

        .dashboard-team-logo-away {
            border-color: rgba(255,80,80,.55) !important;
        }

        .dashboard-team-logo-image {
            width: 84% !important;
            height: 84% !important;
            max-width: none !important;
            object-fit: contain !important;
            object-position: center !important;
            border-radius: 0 !important;
        }

        .dashboard-team-logo-fallback {
            width: 100% !important;
            height: 100% !important;
            place-items: center !important;
            color: #fff !important;
            font-size: 15px !important;
            font-weight: 900 !important;
        }

        .next-match-team > strong {
            width: 100% !important;
            min-height: 30px !important;
            color: #fff !important;
            font-size: 11px !important;
            line-height: 1.3 !important;
            font-weight: 900 !important;
            overflow-wrap: anywhere !important;
        }

        .next-match-vs {
            color: #99a59b !important;
            font-size: 11px !important;
            font-weight: 900 !important;
            text-align: center !important;
        }

        .next-match-meta {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            gap: 3px !important;
            margin: 2px 0 15px !important;
            color: #dbe3dc !important;
            font-size: 9px !important;
            line-height: 1.35 !important;
            text-align: center !important;
        }

        #dashboardMatchTime {
            color: #fff !important;
            font-size: 11px !important;
            font-weight: 900 !important;
        }

        #dashboardMatchPlace {
            max-width: 92% !important;
            color: #c5cec6 !important;
        }

        .next-match-card .start11-primary-action {
            width: 100% !important;
            min-height: 42px !important;
            border: 0 !important;
            border-radius: 6px !important;
            background:
                linear-gradient(90deg,#8df35b,#73ed4a) !important;
            color: #071008 !important;
            font-size: 10px !important;
            font-weight: 1000 !important;
            letter-spacing: .15px !important;
            box-shadow:
                0 8px 22px rgba(115,237,74,.08) !important;
        }

        .upcoming-card {
            padding: 16px 14px 12px !important;
        }

        .upcoming-card .start11-card-heading {
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
            margin-bottom: 10px !important;
        }

        .upcoming-card .start11-card-heading h2 {
            margin-right: auto !important;
        }

        .upcoming-card .start11-text-button,
        #start11CalendarHeaderButton {
            border: 0 !important;
            background: transparent !important;
            color: #91f257 !important;
            padding: 2px 3px !important;
            font-size: 8px !important;
            font-weight: 900 !important;
            cursor: pointer !important;
            white-space: nowrap !important;
        }

        .upcoming-matches-list {
            display: grid !important;
            gap: 0 !important;
        }

        .start11-upcoming-v5-row {
            width: 100% !important;
            min-height: 50px !important;
            display: grid !important;
            grid-template-columns:
                46px
                40px
                minmax(0,1fr)
                22px !important;
            align-items: center !important;
            gap: 6px !important;
            padding: 7px 5px !important;
            border: 0 !important;
            border-bottom:
                1px solid rgba(255,255,255,.075) !important;
            border-radius: 0 !important;
            outline: none !important;
            background: transparent !important;
            color: #fff !important;
            font: inherit !important;
            text-align: left !important;
            cursor: pointer !important;
            transition:
                background .15s ease,
                border-color .15s ease !important;
        }

        .start11-upcoming-v5-row:hover {
            background:
                rgba(129,255,70,.055) !important;
        }

        .start11-upcoming-v5-row.current {
            margin-bottom: 2px !important;
            border:
                1px solid rgba(127,255,72,.72) !important;
            border-radius: 5px !important;
            background:
                linear-gradient(
                    90deg,
                    rgba(93,255,54,.065),
                    rgba(93,255,54,.015)
                ) !important;
        }

        .start11-v5-date,
        .start11-v5-time,
        .start11-v5-home-away {
            font-size: 8px !important;
            font-weight: 800 !important;
            white-space: nowrap !important;
        }

        .start11-upcoming-v5-row.current
        .start11-v5-date,
        .start11-upcoming-v5-row.current
        .start11-v5-time {
            color: #8df35b !important;
        }

        .start11-v5-time {
            text-align: center !important;
        }

        .start11-v5-home-away {
            text-align: center !important;
            color: #b9c2ba !important;
        }

        .start11-v5-opponent {
            min-width: 0 !important;
            display: grid !important;
            grid-template-columns: 27px minmax(0,1fr) !important;
            align-items: center !important;
            gap: 7px !important;
        }

        .start11-v5-opponent-copy {
            min-width: 0 !important;
            display: block !important;
        }

        .start11-v5-opponent-copy strong {
            display: block !important;
            overflow: hidden !important;
            color: #fff !important;
            font-size: 8px !important;
            font-weight: 850 !important;
            line-height: 1.2 !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
        }

        .start11-v5-opponent-copy small {
            display: block !important;
            margin-top: 3px !important;
            overflow: hidden !important;
            color: rgba(213,224,215,.58) !important;
            font-size: 7px !important;
            line-height: 1.15 !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
        }

        .start11-v5-row-logo {
            position: relative !important;
            width: 27px !important;
            height: 27px !important;
            min-width: 27px !important;
            display: grid !important;
            place-items: center !important;
            overflow: hidden !important;
            border: 1px solid rgba(255,255,255,.16) !important;
            border-radius: 50% !important;
            background: #09100b !important;
        }

        .start11-v5-row-logo img {
            width: 83% !important;
            height: 83% !important;
            object-fit: contain !important;
        }

        .start11-v5-logo-fallback {
            position: absolute !important;
            inset: 0 !important;
            display: none !important;
            place-items: center !important;
            color: #cbd5cc !important;
            font-size: 7px !important;
            font-weight: 900 !important;
        }

        .start11-v5-logo-fallback.visible {
            display: grid !important;
        }

        .start11-v5-empty {
            padding: 15px 4px !important;
            color: rgba(255,255,255,.55) !important;
            font-size: 9px !important;
            text-align: center !important;
        }

        @media (min-width: 1450px) {

            .next-match-card {
                padding:
                    22px 20px 18px !important;
            }

            .dashboard-team-logo {
                width: 76px !important;
                height: 76px !important;
            }

            .next-match-team > strong {
                font-size: 12px !important;
            }

            .start11-upcoming-v5-row {
                grid-template-columns:
                    55px
                    44px
                    minmax(0,1fr)
                    24px !important;
            }

        }

    `;


    document.head.appendChild(
        style
    );

}


/*
   Efter DBU-sync repareres de gemte data permanent,
   så reload og kalender også får de samme korrektioner.
*/
function start11V5PersistRepairedMatches() {

    let raw = [];


    try {

        const parsed =
            JSON.parse(
                localStorage.getItem(
                    START11_MATCHES_KEY
                ) ||
                "[]"
            );


        raw =
            Array.isArray(parsed)
                ? parsed
                : [];

    } catch {

        raw = [];

    }


    if (!raw.length) {

        return;

    }


    const repaired =
        start11V5RepairMatches(
            raw
        );


    localStorage.setItem(
        START11_MATCHES_KEY,
        JSON.stringify(
            repaired
        )
    );

}


function start11InstallDashboardV5() {

    start11V5InjectDashboardStyles();

    start11V5PersistRepairedMatches();

    start11RenderUpcomingMatchesV5();

    start11RenderNextMatchV5();


    const sync =
        document.getElementById(
            "syncDbuMatchesButton"
        );


    if (
        sync &&
        sync.dataset.v5DashboardBound !==
            "1"
    ) {

        sync.dataset.v5DashboardBound =
            "1";


        sync.addEventListener(
            "click",
            () => {

                /*
                    Vent til den eksisterende sync er færdig.
                */
                setTimeout(
                    () => {

                        start11V5PersistRepairedMatches();

                        start11RenderUpcomingMatchesV5();

                        start11RenderNextMatchV5();

                        if (
                            typeof start11RenderCalendarV3 ===
                            "function"
                        ) {

                            start11RenderCalendarV3();

                        }

                    },
                    1900
                );

            }
        );

    }


    /*
        Hvis gamle dashboard-funktioner overskriver V5
        kort efter load, tegnes V5 én gang mere.
    */
    setTimeout(
        () => {

            start11RenderUpcomingMatchesV5();

            start11RenderNextMatchV5();

        },
        900
    );

}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        () =>
            setTimeout(
                start11InstallDashboardV5,
                520
            )
    );

} else {

    setTimeout(
        start11InstallDashboardV5,
        520
    );

}


/* =========================================================
   START11 – TEAM-SPECIFIK DBU / KALENDER V7
   ---------------------------------------------------------
   Problem:
   START11_DBU_URL_KEY og START11_MATCHES_KEY var globale
   localStorage-nøgler. Derfor så U14 samme kampprogram som U16.

   Løsning:
   Hvert START11-hold får nu sine egne:
   - DBU-link
   - DBU-kampe
   - træningskampe / kalenderdata

   Den eksisterende kode får stadig lov at bruge de gamle globale
   nøgler som "arbejdskopi", men ved hvert holdskifte bliver data
   automatisk gemt til det gamle hold og indlæst fra det nye.
========================================================= */


function start11TeamScopedKey(
    baseKey,
    teamId = activeTeamId
) {

    const safeTeamId =
        String(
            teamId || "no-team"
        ).trim();


    return (
        `${baseKey}::team::${safeTeamId}`
    );

}


function start11ReadTeamScopedValue(
    baseKey,
    teamId = activeTeamId
) {

    if (!teamId) {

        return null;

    }


    return localStorage.getItem(
        start11TeamScopedKey(
            baseKey,
            teamId
        )
    );

}


function start11WriteTeamScopedValue(
    baseKey,
    value,
    teamId = activeTeamId
) {

    if (!teamId) {

        return;

    }


    const key =
        start11TeamScopedKey(
            baseKey,
            teamId
        );


    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        localStorage.removeItem(
            key
        );

        return;

    }


    localStorage.setItem(
        key,
        String(value)
    );

}


function start11PersistCurrentTeamDbuState(
    teamId = activeTeamId
) {

    if (!teamId) {

        return;

    }


    /*
        DBU-link
    */
    const currentUrl =
        localStorage.getItem(
            START11_DBU_URL_KEY
        );


    if (currentUrl) {

        start11WriteTeamScopedValue(
            START11_DBU_URL_KEY,
            currentUrl,
            teamId
        );

    } else {

        localStorage.removeItem(
            start11TeamScopedKey(
                START11_DBU_URL_KEY,
                teamId
            )
        );

    }


    /*
        DBU + manuelle kampe / kalender
    */
    const currentMatches =
        localStorage.getItem(
            START11_MATCHES_KEY
        );


    if (currentMatches) {

        start11WriteTeamScopedValue(
            START11_MATCHES_KEY,
            currentMatches,
            teamId
        );

    } else {

        /*
            Et tomt hold skal også kunne være tomt.
        */
        localStorage.setItem(
            start11TeamScopedKey(
                START11_MATCHES_KEY,
                teamId
            ),
            "[]"
        );

    }

}


function start11RestoreTeamDbuState(
    teamId = activeTeamId
) {

    if (!teamId) {

        return;

    }


    const scopedUrl =
        start11ReadTeamScopedValue(
            START11_DBU_URL_KEY,
            teamId
        );


    const scopedMatches =
        start11ReadTeamScopedValue(
            START11_MATCHES_KEY,
            teamId
        );


    /*
        VIGTIGT:
        Vi må ikke lade det forrige holds globale arbejdskopi blive
        stående. Hvis det nye hold aldrig har haft DBU-data, skal
        felterne derfor nulstilles.
    */
    if (scopedUrl) {

        localStorage.setItem(
            START11_DBU_URL_KEY,
            scopedUrl
        );

    } else {

        localStorage.removeItem(
            START11_DBU_URL_KEY
        );

    }


    localStorage.setItem(
        START11_MATCHES_KEY,
        scopedMatches ||
        "[]"
    );


    start11RefreshTeamSpecificDbuUi();

}


function start11RefreshTeamSpecificDbuUi() {

    const dbuInput =
        document.getElementById(
            "dbuTeamUrlInput"
        );


    const dbuStatus =
        document.getElementById(
            "dbuConnectionStatus"
        );


    const url =
        localStorage.getItem(
            START11_DBU_URL_KEY
        ) || "";


    if (dbuInput) {

        dbuInput.value =
            url;

    }


    if (dbuStatus) {

        dbuStatus.textContent =
            url
                ? "DBU-link gemt – klar til sync"
                : "Ikke forbundet";

    }


    /*
        Tegn venstre dashboard igen.
    */
    if (
        typeof start11RenderUpcomingMatchesV5 ===
        "function"
    ) {

        start11RenderUpcomingMatchesV5();

    } else if (
        typeof start11RenderUpcomingMatches ===
        "function"
    ) {

        start11RenderUpcomingMatches();

    }


    if (
        typeof start11RenderNextMatchV5 ===
        "function"
    ) {

        /*
            Hvis holdet ingen kampe har, skal den gamle kamp ikke
            blive stående visuelt.
        */
        const allMatches =
            typeof start11CalendarV3SortedMatches ===
            "function"
                ? start11CalendarV3SortedMatches()
                : [];


        const nextMatch =
            Array.isArray(allMatches)
                ? allMatches.find(
                    item =>
                        typeof start11CalendarV3IsUpcoming ===
                            "function"
                            ? start11CalendarV3IsUpcoming(
                                item
                            )
                            : true
                )
                : null;


        if (nextMatch) {

            start11RenderNextMatchV5();

        } else {

            start11ClearNextMatchDashboardV7();

        }

    } else if (
        typeof start11RenderNextDbuMatch ===
        "function"
    ) {

        start11RenderNextDbuMatch();

    }


    if (
        typeof start11RenderCalendarV3 ===
        "function"
    ) {

        start11RenderCalendarV3();

    }

}


function start11ClearNextMatchDashboardV7() {

    const setText =
        (
            id,
            value
        ) => {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.textContent =
                    value;

            }

        };


    setText(
        "dashboardHomeTeam",
        "—"
    );

    setText(
        "dashboardAwayTeam",
        "—"
    );

    setText(
        "dashboardMatchDate",
        "Ingen kommende kamp"
    );

    setText(
        "dashboardMatchTime",
        "—"
    );

    setText(
        "dashboardMatchPlace",
        "—"
    );

    setText(
        "dashboardCompetition",
        "KAMPPROGRAM"
    );


    if (
        typeof start11V5ApplyDashboardLogo ===
        "function"
    ) {

        start11V5ApplyDashboardLogo(
            "dashboardHomeLogo",
            "dashboardHomeLogoFallback",
            "",
            "H"
        );

        start11V5ApplyDashboardLogo(
            "dashboardAwayLogo",
            "dashboardAwayLogoFallback",
            "",
            "U"
        );

    }

}


/* =========================================================
   MIGRERING AF DET HOLD, DER ER AKTIVT FØRSTE GANG
========================================================= */

function start11MigrateLegacyDbuStateV7() {

    if (!activeTeamId) {

        return;

    }


    const scopedMatchesKey =
        start11TeamScopedKey(
            START11_MATCHES_KEY,
            activeTeamId
        );


    const scopedUrlKey =
        start11TeamScopedKey(
            START11_DBU_URL_KEY,
            activeTeamId
        );


    const alreadyHasScopedMatches =
        localStorage.getItem(
            scopedMatchesKey
        ) !== null;


    const alreadyHasScopedUrl =
        localStorage.getItem(
            scopedUrlKey
        ) !== null;


    /*
        Kun første gang.
        Den gamle globale DBU-konfiguration tilhører det hold,
        som var aktivt, da brugeren opgraderede til V7.
    */
    if (!alreadyHasScopedMatches) {

        const legacyMatches =
            localStorage.getItem(
                START11_MATCHES_KEY
            );


        localStorage.setItem(
            scopedMatchesKey,
            legacyMatches ||
            "[]"
        );

    }


    if (!alreadyHasScopedUrl) {

        const legacyUrl =
            localStorage.getItem(
                START11_DBU_URL_KEY
            );


        if (legacyUrl) {

            localStorage.setItem(
                scopedUrlKey,
                legacyUrl
            );

        }

    }

}


/* =========================================================
   HOLD-SKIFT
========================================================= */

if (
    typeof changeTeam ===
    "function"
) {

    const start11ChangeTeamBeforeV7 =
        changeTeam;


    changeTeam =
        async function (
            teamId
        ) {

            if (
                !teamId ||
                teamId === activeTeamId
            ) {

                return;

            }


            const oldTeamId =
                activeTeamId;


            /*
                Gem DBU/kalender for holdet vi forlader.
            */
            start11PersistCurrentTeamDbuState(
                oldTeamId
            );


            await start11ChangeTeamBeforeV7(
                teamId
            );


            /*
                activeTeamId er nu det nye hold.
            */
            start11RestoreTeamDbuState(
                activeTeamId
            );

        };

}


/* =========================================================
   GEM DBU-LINK PR. HOLD
========================================================= */

if (
    typeof start11SaveDbuUrl ===
    "function"
) {

    const start11SaveDbuUrlBeforeV7 =
        start11SaveDbuUrl;


    start11SaveDbuUrl =
        function (...args) {

            const result =
                start11SaveDbuUrlBeforeV7(
                    ...args
                );


            start11PersistCurrentTeamDbuState();

            return result;

        };

}


/*
    Den oprindelige click-listener kan allerede være bundet til den
    gamle funktionsreference. Derfor gemmer vi også via input/button
    efter click.
*/
function start11InstallTeamSpecificDbuSaveHookV7() {

    const saveButton =
        document.getElementById(
            "saveDbuTeamUrl"
        );


    if (
        saveButton &&
        saveButton.dataset.teamScopedV7 !==
            "1"
    ) {

        saveButton.dataset.teamScopedV7 =
            "1";


        saveButton.addEventListener(
            "click",
            () => {

                setTimeout(
                    () =>
                        start11PersistCurrentTeamDbuState(),
                    25
                );

            }
        );

    }

}


/* =========================================================
   SYNC DBU PR. HOLD
========================================================= */

if (
    typeof syncDbuMatches ===
    "function"
) {

    const syncDbuMatchesBeforeV7 =
        syncDbuMatches;


    syncDbuMatches =
        async function (...args) {

            const result =
                await syncDbuMatchesBeforeV7(
                    ...args
                );


            start11PersistCurrentTeamDbuState();

            return result;

        };

}


/*
    Samme grund som ovenfor: den gamle listener kan allerede pege på
    den tidligere sync-funktion. Gem derfor arbejdskopien efter sync.
*/
function start11InstallTeamSpecificSyncHookV7() {

    const syncButton =
        document.getElementById(
            "syncDbuMatchesButton"
        );


    if (
        syncButton &&
        syncButton.dataset.teamScopedSyncV7 !==
            "1"
    ) {

        syncButton.dataset.teamScopedSyncV7 =
            "1";


        syncButton.addEventListener(
            "click",
            () => {

                /*
                    Edge Functionen kan bruge lidt tid pga. logo-opslag.
                    Vi gemmer flere gange, så den færdige response med
                    kampene sikkert bliver gemt på det aktive hold.
                */
                [500, 1800, 3500].forEach(
                    delay => {

                        setTimeout(
                            () =>
                                start11PersistCurrentTeamDbuState(),
                            delay
                        );

                    }
                );

            }
        );

    }

}


/* =========================================================
   TRÆNINGSKAMPE / KALENDER PR. HOLD
========================================================= */

if (
    typeof start11CalendarSaveMatches ===
    "function"
) {

    const start11CalendarSaveMatchesBeforeV7 =
        start11CalendarSaveMatches;


    start11CalendarSaveMatches =
        function (
            items
        ) {

            const result =
                start11CalendarSaveMatchesBeforeV7(
                    items
                );


            start11PersistCurrentTeamDbuState();

            return result;

        };

}


/* =========================================================
   NYT HOLD
   Et helt nyt hold starter uden forrige holds kampe.
========================================================= */

if (
    typeof addTeam ===
    "function"
) {

    const addTeamBeforeV7 =
        addTeam;


    addTeam =
        async function (...args) {

            /*
                Gem det nuværende hold inden det nye oprettes.
            */
            start11PersistCurrentTeamDbuState();


            const oldActiveTeamId =
                activeTeamId;


            const result =
                await addTeamBeforeV7(
                    ...args
                );


            /*
                Hvis addTeam automatisk skifter til det nye hold,
                findes der selvfølgelig endnu ingen scoped data.
            */
            if (
                activeTeamId &&
                activeTeamId !== oldActiveTeamId
            ) {

                const newMatchesKey =
                    start11TeamScopedKey(
                        START11_MATCHES_KEY,
                        activeTeamId
                    );


                if (
                    localStorage.getItem(
                        newMatchesKey
                    ) === null
                ) {

                    localStorage.setItem(
                        newMatchesKey,
                        "[]"
                    );

                }


                start11RestoreTeamDbuState(
                    activeTeamId
                );

            }


            return result;

        };

}


/* =========================================================
   START V7
========================================================= */

function start11InitTeamSpecificDbuV7() {

    /*
        Vent til cloud/login har fundet activeTeamId.
    */
    if (!activeTeamId) {

        setTimeout(
            start11InitTeamSpecificDbuV7,
            250
        );

        return;

    }


    start11MigrateLegacyDbuStateV7();

    start11RestoreTeamDbuState(
        activeTeamId
    );

    start11InstallTeamSpecificDbuSaveHookV7();

    start11InstallTeamSpecificSyncHookV7();


    /*
        Hvis UI bliver genopbygget senere, så installer hooks igen.
    */
    setTimeout(
        () => {

            start11InstallTeamSpecificDbuSaveHookV7();

            start11InstallTeamSpecificSyncHookV7();

        },
        1400
    );

}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        () =>
            setTimeout(
                start11InitTeamSpecificDbuV7,
                850
            )
    );

} else {

    setTimeout(
        start11InitTeamSpecificDbuV7,
        850
    );

}


/* =========================================================
   START11 – KLUB → HOLD + SENESTE KAMP V8
   ---------------------------------------------------------
   Denne udvidelse bygger oven på V7.

   NY STRUKTUR:
   KLUB
      ├─ U14
      ├─ U13
      └─ U12

   Hvert hold beholder separat:
   - fuld spillertrup
   - startopstilling
   - udskiftere
   - kampplan / taktik
   - DBU-link
   - DBU-kampe
   - træningskampe / kalender

   Derudover tilføjes et kompakt "SENESTE KAMP"-kort
   mellem NÆSTE KAMP og KOMMENDE KAMPE.
========================================================= */


const START11_V8_CLUBS_PREFIX =
    "start11ClubsV8";


function start11V8CurrentUserKey() {

    return (
        session?.user?.id ||
        session?.user?.email ||
        "local"
    );

}


function start11V8ClubsStorageKey() {

    return (
        START11_V8_CLUBS_PREFIX +
        "::" +
        start11V8CurrentUserKey()
    );

}


function start11V8MakeId() {

    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID ===
            "function"
    ) {

        return crypto.randomUUID();

    }


    return (
        "club_" +
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .slice(2)
    );

}


function start11V8ReadClubRegistry() {

    try {

        const parsed =
            JSON.parse(
                localStorage.getItem(
                    start11V8ClubsStorageKey()
                ) ||
                "[]"
            );


        return Array.isArray(parsed)
            ? parsed.filter(
                item =>
                    item &&
                    typeof item.name ===
                        "string" &&
                    item.name.trim()
            )
            : [];

    } catch {

        return [];

    }

}


function start11V8WriteClubRegistry(
    clubs
) {

    localStorage.setItem(
        start11V8ClubsStorageKey(),
        JSON.stringify(
            Array.isArray(clubs)
                ? clubs
                : []
        )
    );

}


function start11V8NormalizeClubName(
    value
) {

    return String(value || "")
        .trim()
        .replace(/\s+/g, " ");

}


function start11V8NormalizeTeamName(
    value
) {

    return String(value || "")
        .trim()
        .replace(/\s+/g, " ");

}


function start11V8ParseLegacyTeamName(
    fullName
) {

    const raw =
        String(
            fullName || "Mit hold"
        )
            .trim()
            .replace(/\s+/g, " ");


    /*
        Eksempler:
        FC Thy U16 -> FC Thy / U16
        FC Thy u14 -> FC Thy / U14
        Thisted FC U13 -> Thisted FC / U13
    */
    const ageMatch =
        raw.match(
            /^(.*?)[\s_-]+(u\s*\d{1,2}|p\s*\d{1,2}|drenge\s*u?\d{1,2}|piger\s*u?\d{1,2})$/i
        );


    if (ageMatch) {

        const clubName =
            start11V8NormalizeClubName(
                ageMatch[1]
            );


        const teamName =
            start11V8NormalizeTeamName(
                ageMatch[2]
                    .replace(
                        /\s+/g,
                        ""
                    )
                    .toUpperCase()
            );


        if (
            clubName &&
            teamName
        ) {

            return {
                clubName,
                teamName
            };

        }

    }


    /*
        Hvis det gamle navn ikke kan deles sikkert,
        lægges det under "MINE HOLD".
    */
    return {
        clubName:
            "MINE HOLD",
        teamName:
            raw ||
            "Hold 1"
    };

}


function start11V8GetTeamMeta(
    team
) {

    if (!team) {

        return {
            clubName:
                "MINE HOLD",
            teamName:
                "Hold"
        };

    }


    const stored =
        team?.data?.start11Club ||
        team?.data?.club ||
        null;


    const clubName =
        start11V8NormalizeClubName(
            stored?.clubName ||
            stored?.club ||
            ""
        );


    const teamName =
        start11V8NormalizeTeamName(
            stored?.teamName ||
            stored?.team ||
            ""
        );


    if (
        clubName &&
        teamName
    ) {

        return {
            clubName,
            teamName
        };

    }


    return start11V8ParseLegacyTeamName(
        team.name
    );

}


function start11V8GetActiveTeam() {

    return cloudTeams.find(
        team =>
            team.id ===
            activeTeamId
    ) || null;

}


function start11V8GetActiveMeta() {

    return start11V8GetTeamMeta(
        start11V8GetActiveTeam()
    );

}


function start11V8GetAllClubs() {

    const registry =
        start11V8ReadClubRegistry();


    const map =
        new Map();


    registry.forEach(
        club => {

            const name =
                start11V8NormalizeClubName(
                    club.name
                );


            if (!name) {

                return;

            }


            map.set(
                name.toLowerCase(),
                {
                    id:
                        club.id ||
                        start11V8MakeId(),
                    name
                }
            );

        }
    );


    cloudTeams.forEach(
        team => {

            const meta =
                start11V8GetTeamMeta(
                    team
                );


            const key =
                meta.clubName
                    .toLowerCase();


            if (!map.has(key)) {

                map.set(
                    key,
                    {
                        id:
                            start11V8MakeId(),
                        name:
                            meta.clubName
                    }
                );

            }

        }
    );


    const clubs =
        [...map.values()]
            .sort(
                (a, b) =>
                    a.name.localeCompare(
                        b.name,
                        "da"
                    )
            );


    start11V8WriteClubRegistry(
        clubs
    );


    return clubs;

}


function start11V8TeamsForClub(
    clubName
) {

    const wanted =
        String(clubName || "")
            .trim()
            .toLowerCase();


    return cloudTeams
        .filter(
            team =>
                start11V8GetTeamMeta(
                    team
                )
                    .clubName
                    .toLowerCase() ===
                wanted
        )
        .sort(
            (a, b) => {

                const aa =
                    start11V8GetTeamMeta(
                        a
                    ).teamName;

                const bb =
                    start11V8GetTeamMeta(
                        b
                    ).teamName;


                return aa.localeCompare(
                    bb,
                    "da",
                    {
                        numeric: true
                    }
                );

            }
        );

}


/* =========================================================
   FULD TRUP GEMMES I HOLDETS CLOUD-DATA
========================================================= */

if (
    typeof collectTeamData ===
    "function"
) {

    const collectTeamDataBeforeV8 =
        collectTeamData;


    collectTeamData =
        function () {

            const base =
                collectTeamDataBeforeV8();


            const currentTeam =
                start11V8GetActiveTeam();


            const meta =
                currentTeam
                    ? start11V8GetTeamMeta(
                        currentTeam
                    )
                    : {
                        clubName:
                            "MINE HOLD",
                        teamName:
                            "Hold"
                    };


            return {
                ...base,

                fullSquad:
                    Array.isArray(
                        start11FullSquad
                    )
                        ? start11FullSquad
                        : [],

                start11Club: {
                    clubName:
                        meta.clubName,
                    teamName:
                        meta.teamName
                }
            };

        };

}


if (
    typeof applyTeamData ===
    "function"
) {

    const applyTeamDataBeforeV8 =
        applyTeamData;


    applyTeamData =
        function (
            data
        ) {

            applyTeamDataBeforeV8(
                data
            );


            /*
                Vigtigt:
                Hvert hold får sin HELT EGEN spillerliste.
                Hvis et ældre hold ikke har fullSquad endnu,
                starter listen tom og bliver derefter synkroniseret
                med eventuelle spillere i kamptruppen.
            */
            start11FullSquad =
                Array.isArray(
                    data?.fullSquad
                )
                    ? data.fullSquad
                    : [];


            localStorage.setItem(
                START11_SQUAD_KEY,
                JSON.stringify(
                    start11FullSquad
                )
            );


            if (
                typeof start11SyncSquadFromCurrentMatch ===
                "function"
            ) {

                start11SyncSquadFromCurrentMatch();

            }


            if (
                typeof start11RenderFullSquad ===
                "function"
            ) {

                start11RenderFullSquad();

            }


            if (
                typeof start11RenderMatchSquad ===
                "function"
            ) {

                start11RenderMatchSquad();

            }


            if (
                typeof start11UpdateSubstituteBadge ===
                "function"
            ) {

                start11UpdateSubstituteBadge();

            }

        };

}


if (
    typeof start11SaveFullSquad ===
    "function"
) {

    const start11SaveFullSquadBeforeV8 =
        start11SaveFullSquad;


    start11SaveFullSquad =
        function (...args) {

            const result =
                start11SaveFullSquadBeforeV8(
                    ...args
                );


            /*
                Send trupændringen videre til det aktive
                holds cloud-data.
            */
            if (
                typeof scheduleCloudSave ===
                "function"
            ) {

                scheduleCloudSave();

            }


            return result;

        };

}


/* =========================================================
   MIGRER EKSISTERENDE HOLD TIL KLUB → HOLD
========================================================= */

async function start11V8EnsureMetadataForAllTeams() {

    if (
        !session ||
        !Array.isArray(
            cloudTeams
        )
    ) {

        return;

    }


    for (
        const team
        of cloudTeams
    ) {

        if (
            team?.data?.start11Club?.clubName &&
            team?.data?.start11Club?.teamName
        ) {

            continue;

        }


        const meta =
            start11V8ParseLegacyTeamName(
                team.name
            );


        team.data = {
            ...(team.data || {}),

            start11Club: {
                clubName:
                    meta.clubName,
                teamName:
                    meta.teamName
            },

            /*
                Hvis dette gamle hold endnu ikke havde
                en separat fuld trup, kopierer vi IKKE et
                andet holds spillerliste ind i det.
            */
            fullSquad:
                Array.isArray(
                    team?.data?.fullSquad
                )
                    ? team.data.fullSquad
                    : []
        };


        try {

            await supabaseRequest(
                `/rest/v1/${CLOUD_TABLE}?id=eq.${encodeURIComponent(team.id)}`,
                {
                    method:
                        "PATCH",

                    headers: {
                        Prefer:
                            "return=minimal"
                    },

                    body:
                        JSON.stringify({
                            data:
                                team.data,
                            updated_at:
                                new Date()
                                    .toISOString()
                        })
                }
            );

        } catch (
            error
        ) {

            console.warn(
                "START11 V8 metadata:",
                error
            );

        }

    }


    start11V8GetAllClubs();

}


/* =========================================================
   OPRET KLUB
========================================================= */

function start11V8CreateClub(
    name
) {

    const clubName =
        start11V8NormalizeClubName(
            name
        );


    if (!clubName) {

        return null;

    }


    const clubs =
        start11V8ReadClubRegistry();


    const existing =
        clubs.find(
            club =>
                String(
                    club.name || ""
                )
                    .trim()
                    .toLowerCase() ===
                clubName
                    .toLowerCase()
        );


    if (existing) {

        return existing;

    }


    const club = {
        id:
            start11V8MakeId(),
        name:
            clubName
    };


    clubs.push(
        club
    );


    start11V8WriteClubRegistry(
        clubs
    );


    start11V8RenderClubTeamSelector();

    renderTeamsDashboard();


    return club;

}


/* =========================================================
   OPRET TOMT HOLD UNDER EN KLUB
========================================================= */

async function start11V8CreateBlankTeam(
    clubName,
    teamName
) {

    if (!session) {

        showLogin();

        return null;

    }


    const cleanClub =
        start11V8NormalizeClubName(
            clubName
        );


    const cleanTeam =
        start11V8NormalizeTeamName(
            teamName
        );


    if (
        !cleanClub ||
        !cleanTeam
    ) {

        visNotification(
            "Skriv både klub og hold."
        );

        return null;

    }


    try {

        /*
            Gem først det hold, vi forlader.
        */
        if (
            typeof start11PersistCurrentTeamDbuState ===
            "function"
        ) {

            start11PersistCurrentTeamDbuState();

        }


        await saveCloudNow();


        start11V8CreateClub(
            cleanClub
        );


        const id =
            start11V8MakeId();


        const blankKampplan = {
            ...defaultKampplan(),

            /*
                Vi bruger kun klubnavnet som et neutralt
                udgangspunkt. DBU-kampe vil senere indsætte
                det præcise holdnavn automatisk.
            */
            homeTeam:
                cleanClub
        };


        const blankData = {
            spillere:
                Array(11).fill(
                    null
                ),

            udskiftere:
                [],

            kampplan:
                blankKampplan,

            formation:
                "4-4-2",

            fullSquad:
                [],

            start11Club: {
                clubName:
                    cleanClub,
                teamName:
                    cleanTeam
            }
        };


        const row = {
            id,

            user_id:
                session.user.id,

            name:
                `${cleanClub} ${cleanTeam}`,

            data:
                blankData
        };


        const created =
            await supabaseRequest(
                `/rest/v1/${CLOUD_TABLE}`,
                {
                    method:
                        "POST",

                    headers: {
                        Prefer:
                            "return=representation"
                    },

                    body:
                        JSON.stringify(
                            row
                        )
                }
            );


        const team =
            Array.isArray(
                created
            )
                ? created[0]
                : created;


        cloudTeams.push(
            team
        );


        activeTeamId =
            team.id;


        localStorage.setItem(
            ACTIVE_TEAM_KEY,
            activeTeamId
        );


        /*
            Nyt hold starter UDEN:
            - gamle spillere
            - gamle DBU-kampe
            - gamle træningskampe
        */
        if (
            typeof start11TeamScopedKey ===
            "function"
        ) {

            localStorage.removeItem(
                start11TeamScopedKey(
                    START11_DBU_URL_KEY,
                    activeTeamId
                )
            );


            localStorage.setItem(
                start11TeamScopedKey(
                    START11_MATCHES_KEY,
                    activeTeamId
                ),
                "[]"
            );

        }


        localStorage.removeItem(
            START11_DBU_URL_KEY
        );


        localStorage.setItem(
            START11_MATCHES_KEY,
            "[]"
        );


        localStorage.setItem(
            START11_SQUAD_KEY,
            "[]"
        );


        applyTeamData(
            blankData
        );


        updateTeamSelector();

        renderTeamsDashboard();

        start11V8RenderClubTeamSelector();


        if (
            typeof start11RefreshTeamSpecificDbuUi ===
            "function"
        ) {

            start11RefreshTeamSpecificDbuUi();

        }


        visNotification(
            `${cleanClub} · ${cleanTeam} er oprettet.`
        );


        return team;

    } catch (
        error
    ) {

        visNotification(
            "Kunne ikke oprette hold: " +
            error.message
        );


        return null;

    }

}


/* =========================================================
   OMDØB / FLYT HOLD
========================================================= */

async function start11V8RenameTeam(
    team,
    newTeamName
) {

    const meta =
        start11V8GetTeamMeta(
            team
        );


    const cleanTeamName =
        start11V8NormalizeTeamName(
            newTeamName
        );


    if (
        !team ||
        !cleanTeamName
    ) {

        return;

    }


    const newData = {
        ...(team.data || {}),

        start11Club: {
            clubName:
                meta.clubName,
            teamName:
                cleanTeamName
        }
    };


    const newCloudName =
        `${meta.clubName} ${cleanTeamName}`;


    try {

        await supabaseRequest(
            `/rest/v1/${CLOUD_TABLE}?id=eq.${encodeURIComponent(team.id)}`,
            {
                method:
                    "PATCH",

                headers: {
                    Prefer:
                        "return=minimal"
                },

                body:
                    JSON.stringify({
                        name:
                            newCloudName,
                        data:
                            newData,
                        updated_at:
                            new Date()
                                .toISOString()
                    })
            }
        );


        team.name =
            newCloudName;

        team.data =
            newData;


        updateTeamSelector();

        renderTeamsDashboard();

        start11V8RenderClubTeamSelector();


        visNotification(
            "Holdnavnet er ændret."
        );

    } catch (
        error
    ) {

        visNotification(
            "Kunne ikke omdøbe hold: " +
            error.message
        );

    }

}


/* =========================================================
   KLUB/HOLD MODAL
========================================================= */

function start11V8EnsureClubTeamModal() {

    if (
        document.getElementById(
            "start11ClubTeamModalV8"
        )
    ) {

        return;

    }


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "start11ClubTeamModalV8";

