/* =========================================================
   START11 – DASHBOARD / TRUP ADDITIONS
   LÆG DENNE BLOK HELT NEDERST I DIN NUVÆRENDE start11.js.

   VIGTIGT:
   - Den omskriver ikke drag/drop-funktionerne.
   - Den bruger de eksisterende spillere/udskiftere/kampplan.
   - Hele truppen gemmes separat, så "ikke udtaget" ikke slettes.
========================================================= */

const START11_SQUAD_KEY = "start11FullSquad";
const START11_DBU_URL_KEY = "start11DbuTeamUrl";
const START11_MATCHES_KEY = "start11DashboardMatches";

let start11FullSquad = [];
let start11EditingSquadPlayerId = null;
let start11SquadView = "match";


function start11MakeId() {

    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {

        return crypto.randomUUID();

    }


    return (
        "s11_" +
        Date.now().toString(36) +
        "_" +
        Math.random().toString(36).slice(2)
    );

}


function start11ReadJson(
    key,
    fallback
) {

    try {

        const value =
            JSON.parse(
                localStorage.getItem(key)
            );


        return value ?? fallback;

    } catch (error) {

        return fallback;

    }

}


function start11NormalizeSquadPlayer(
    player,
    selected = false
) {

    return {

        id:
            player?.squadId ||
            player?.id ||
            start11MakeId(),

        name:
            player?.name ||
            "",

        number:
            player?.number ||
            "",

        position:
            player?.position ||
            "CM",

        status:
            player?.squadStatus ||
            player?.status ||
            "available",

        selected:
            typeof player?.selected === "boolean"
                ? player.selected
                : selected

    };

}


function start11LoadFullSquad() {

    const saved =
        start11ReadJson(
            START11_SQUAD_KEY,
            []
        );


    if (
        Array.isArray(saved) &&
        saved.length
    ) {

        start11FullSquad =
            saved.map(
                player =>
                    start11NormalizeSquadPlayer(
                        player,
                        Boolean(player.selected)
                    )
            );

        return;

    }


    /*
        Første gang funktionen bruges:
        byg truppen ud fra den nuværende
        startopstilling + bænk.
    */

    const combined = [

        ...(Array.isArray(spillere)
            ? spillere.filter(Boolean)
            : []),

        ...(Array.isArray(udskiftere)
            ? udskiftere.filter(Boolean)
            : [])

    ];


    combined.forEach(
        player => {

            const alreadyExists =
                start11FullSquad.some(
                    squadPlayer =>
                        start11SamePlayer(
                            squadPlayer,
                            player
                        )
                );


            if (
                !alreadyExists
            ) {

                start11FullSquad.push(
                    start11NormalizeSquadPlayer(
                        player,
                        true
                    )
                );

            }

        }
    );


    start11SaveFullSquad();

}


function start11SamePlayer(
    a,
    b
) {

    const aName =
        String(
            a?.name || ""
        )
            .trim()
            .toLocaleLowerCase("da-DK");


    const bName =
        String(
            b?.name || ""
        )
            .trim()
            .toLocaleLowerCase("da-DK");


    if (
        !aName ||
        !bName
    ) {

        return false;

    }


    const aNumber =
        String(
            a?.number || ""
        ).trim();


    const bNumber =
        String(
            b?.number || ""
        ).trim();


    return (
        aName === bName &&
        (
            !aNumber ||
            !bNumber ||
            aNumber === bNumber
        )
    );

}


function start11SaveFullSquad() {

    localStorage.setItem(
        START11_SQUAD_KEY,
        JSON.stringify(
            start11FullSquad
        )
    );

}


function start11SyncSquadFromCurrentMatch() {

    const starters =
        Array.isArray(spillere)
            ? spillere.filter(Boolean)
            : [];


    const substitutes =
        Array.isArray(udskiftere)
            ? udskiftere.filter(Boolean)
            : [];


    const selectedPlayers = [
        ...starters,
        ...substitutes
    ];


    selectedPlayers.forEach(
        player => {

            let squadPlayer =
                start11FullSquad.find(
                    item =>
                        start11SamePlayer(
                            item,
                            player
                        )
                );


            if (
                !squadPlayer
            ) {

                squadPlayer =
                    start11NormalizeSquadPlayer(
                        player,
                        true
                    );


                start11FullSquad.push(
                    squadPlayer
                );

            }


            squadPlayer.name =
                player.name ||
                squadPlayer.name;


            squadPlayer.number =
                player.number ||
                squadPlayer.number;


            squadPlayer.position =
                player.position ||
                squadPlayer.position;


            squadPlayer.selected =
                true;

        }
    );


    start11SaveFullSquad();

}


function start11GetPlayerRole(
    squadPlayer
) {

    const starterIndex =
        Array.isArray(spillere)
            ? spillere.findIndex(
                player =>
                    player &&
                    start11SamePlayer(
                        squadPlayer,
                        player
                    )
            )
            : -1;


    if (
        starterIndex !== -1
    ) {

        return "starting";

    }


    const substituteIndex =
        Array.isArray(udskiftere)
            ? udskiftere.findIndex(
                player =>
                    player &&
                    start11SamePlayer(
                        squadPlayer,
                        player
                    )
            )
            : -1;


    if (
        substituteIndex !== -1
    ) {

        return "substitute";

    }


    return squadPlayer.selected
        ? "selected"
        : "not-selected";

}


function start11StatusLabel(
    status
) {

    if (
        status === "injured"
    ) {

        return "Skadet";

    }


    if (
        status === "unavailable"
    ) {

        return "Ikke klar";

    }


    return "Tilgængelig";

}


function start11RoleLabel(
    role
) {

    if (
        role === "starting"
    ) {

        return "Starter";

    }


    if (
        role === "substitute"
    ) {

        return "Udskifter";

    }


    if (
        role === "selected"
    ) {

        return "Udtaget";

    }


    return "Ikke udtaget";

}


function start11Escape(
    value
) {

    if (
        typeof escapeHTML === "function"
    ) {

        return escapeHTML(
            value ?? ""
        );

    }


    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;

}


function start11GetVisibleSquad() {

    const search =
        (
            document.getElementById(
                "squadSearchInput"
            )?.value ||
            ""
        )
            .trim()
            .toLocaleLowerCase("da-DK");


    const position =
        document.getElementById(
            "squadPositionFilter"
        )?.value ||
        "";


    const status =
        document.getElementById(
            "squadStatusFilter"
        )?.value ||
        "";


    return start11FullSquad
        .filter(
            player => {

                if (
                    search &&
                    !String(
                        player.name || ""
                    )
                        .toLocaleLowerCase("da-DK")
                        .includes(search)
                ) {

                    return false;

                }


                if (
                    position &&
                    player.position !==
                        position
                ) {

                    return false;

                }


                if (
                    status &&
                    player.status !==
                        status
                ) {

                    return false;

                }


                return true;

            }
        )
        .sort(
            (a, b) => {

                const numberA =
                    Number(
                        a.number
                    );


                const numberB =
                    Number(
                        b.number
                    );


                if (
                    Number.isFinite(numberA) &&
                    Number.isFinite(numberB) &&
                    numberA !== numberB
                ) {

                    return numberA -
                        numberB;

                }


                return String(
                    a.name || ""
                ).localeCompare(
                    String(
                        b.name || ""
                    ),
                    "da"
                );

            }
        );

}


function start11RenderFullSquad() {

    const list =
        document.getElementById(
            "fullSquadList"
        );


    const count =
        document.getElementById(
            "fullSquadCount"
        );


    if (
        !list
    ) {

        return;

    }


    if (
        count
    ) {

        count.textContent =
            String(
                start11FullSquad.length
            );

    }


    const players =
        start11GetVisibleSquad();


    list.innerHTML =
        "";


    if (
        !players.length
    ) {

        list.innerHTML = `
            <div class="start11-help-text">
                Ingen spillere matcher filteret.
            </div>
        `;

        return;

    }


    players.forEach(
        player => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "full-squad-row" +
                (
                    player.selected
                        ? ""
                        : " not-selected"
                );


            row.dataset.playerId =
                player.id;


            row.innerHTML = `

                <span class="squad-no">
                    ${start11Escape(player.number || "—")}
                </span>

                <span class="squad-name">
                    ${start11Escape(player.name)}
                </span>

                <span class="squad-pos">
                    ${start11Escape(player.position)}
                </span>

                <span class="squad-status-pill ${start11Escape(player.status)}">
                    ${start11Escape(start11StatusLabel(player.status))}
                </span>

            `;


            row.addEventListener(
                "click",
                () => {

                    start11OpenSquadPlayerModal(
                        player.id
                    );

                }
            );


            list.appendChild(
                row
            );

        }
    );

}


function start11PlayersForSquadView() {

    if (
        start11SquadView ===
        "notSelected"
    ) {

        return start11FullSquad.filter(
            player =>
                !player.selected
        );

    }


    if (
        start11SquadView ===
        "all"
    ) {

        return [
            ...start11FullSquad
        ];

    }


    return start11FullSquad.filter(
        player =>
            player.selected ||
            start11GetPlayerRole(player) ===
                "starting" ||
            start11GetPlayerRole(player) ===
                "substitute"
    );

}


function start11RenderMatchSquad() {

    const list =
        document.getElementById(
            "matchSquadOverview"
        );


    const count =
        document.getElementById(
            "matchSquadCount"
        );


    const heading =
        document.getElementById(
            "matchSquadHeading"
        );


    if (
        !list
    ) {

        return;

    }


    const players =
        start11PlayersForSquadView();


    if (
        count
    ) {

        count.textContent =
            String(
                players.length
            );

    }


    if (
        heading
    ) {

        heading.textContent =
            start11SquadView === "all"
                ? "TRUP"
                : start11SquadView === "notSelected"
                    ? "IKKE UDTAGET"
                    : "KAMPTRUP";

    }


    list.innerHTML =
        "";


    players
        .sort(
            (a, b) => {

                const roleOrder = {
                    starting: 0,
                    substitute: 1,
                    selected: 2,
                    "not-selected": 3
                };


                const roleA =
                    start11GetPlayerRole(a);


                const roleB =
                    start11GetPlayerRole(b);


                if (
                    roleOrder[roleA] !==
                    roleOrder[roleB]
                ) {

                    return (
                        roleOrder[roleA] -
                        roleOrder[roleB]
                    );

                }


                return String(
                    a.name || ""
                ).localeCompare(
                    String(
                        b.name || ""
                    ),
                    "da"
                );

            }
        )
        .forEach(
            player => {

                const role =
                    start11GetPlayerRole(
                        player
                    );


                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "squad-overview-row";


                row.innerHTML = `

                    <span class="squad-overview-check">
                        ${player.selected || role !== "not-selected" ? "✓" : ""}
                    </span>

                    <span class="squad-overview-number">
                        ${start11Escape(player.number || "—")}
                    </span>

                    <span class="squad-overview-name">
                        ${start11Escape(player.name)}
                    </span>

                    <span class="squad-overview-position">
                        ${start11Escape(player.position)}
                    </span>

                    <span class="squad-role-pill ${start11Escape(role)}">
                        ${start11Escape(start11RoleLabel(role))}
                    </span>

                `;


                row.addEventListener(
                    "click",
                    () => {

                        start11ToggleSelection(
                            player.id
                        );

                    }
                );


                list.appendChild(
                    row
                );

            }
        );

}


function start11ToggleSelection(
    id
) {

    const player =
        start11FullSquad.find(
            item =>
                item.id === id
        );


    if (
        !player
    ) {

        return;

    }


    const role =
        start11GetPlayerRole(
            player
        );


    /*
        En spiller, der allerede står på banen
        eller bænken, skal ikke "forsvinde"
        ved et simpelt klik. Flyt spilleren ud
        via den eksisterende lineup-editor først.
    */

    if (
        role === "starting" ||
        role === "substitute"
    ) {

        if (
            typeof visNotification ===
            "function"
        ) {

            visNotification(
                "Spilleren er allerede i kampens opstilling. Flyt/fjern spilleren fra opstillingen først."
            );

        }

        return;

    }


    if (
        player.status !==
        "available"
    ) {

        if (
            typeof visNotification ===
            "function"
        ) {

            visNotification(
                "Spilleren kan ikke udtages, før status er Tilgængelig."
            );

        }

        return;

    }


    player.selected =
        !player.selected;


    start11SaveFullSquad();

    start11RenderSquadUI();

}


function start11OpenSquadPlayerModal(
    id = null
) {

    const modal =
        document.getElementById(
            "squadPlayerModal"
        );


    if (
        !modal
    ) {

        return;

    }


    start11EditingSquadPlayerId =
        id;


    const player =
        id
            ? start11FullSquad.find(
                item =>
                    item.id === id
            )
            : null;


    const setValue =
        (
            elementId,
            value
        ) => {

            const element =
                document.getElementById(
                    elementId
                );


            if (
                element
            ) {

                element.value =
                    value ?? "";

            }

        };


    setValue(
        "squadPlayerName",
        player?.name || ""
    );


    setValue(
        "squadPlayerNumber",
        player?.number || ""
    );


    setValue(
        "squadPlayerPosition",
        player?.position || "CM"
    );


    setValue(
        "squadPlayerStatus",
        player?.status || "available"
    );


    const selected =
        document.getElementById(
            "squadPlayerSelected"
        );


    if (
        selected
    ) {

        selected.checked =
            Boolean(
                player?.selected
            );

    }


    const title =
        document.getElementById(
            "squadPlayerModalTitle"
        );


    if (
        title
    ) {

        title.textContent =
            player
                ? "REDIGER SPILLER"
                : "TILFØJ SPILLER";

    }


    const deleteButton =
        document.getElementById(
            "deleteSquadPlayerButton"
        );


    if (
        deleteButton
    ) {

        deleteButton.style.display =
            player
                ? "inline-flex"
                : "none";

    }


    modal.style.display =
        "flex";

}


function start11CloseSquadPlayerModal() {

    const modal =
        document.getElementById(
            "squadPlayerModal"
        );


    if (
        modal
    ) {

        modal.style.display =
            "none";

    }


    start11EditingSquadPlayerId =
        null;

}


function start11SaveSquadPlayerFromModal() {

    const name =
        document.getElementById(
            "squadPlayerName"
        )?.value.trim() ||
        "";


    if (
        !name
    ) {

        if (
            typeof visNotification ===
            "function"
        ) {

            visNotification(
                "Indtast spillerens navn."
            );

        }

        return;

    }


    const number =
        document.getElementById(
            "squadPlayerNumber"
        )?.value.trim() ||
        "";


    const position =
        document.getElementById(
            "squadPlayerPosition"
        )?.value ||
        "CM";


    const status =
        document.getElementById(
            "squadPlayerStatus"
        )?.value ||
        "available";


    const selected =
        Boolean(
            document.getElementById(
                "squadPlayerSelected"
            )?.checked
        );


    if (
        start11EditingSquadPlayerId
    ) {

        const player =
            start11FullSquad.find(
                item =>
                    item.id ===
                    start11EditingSquadPlayerId
            );


        if (
            player
        ) {

            player.name =
                name;

            player.number =
                number;

            player.position =
                position;

            player.status =
                status;

            player.selected =
                status === "available"
                    ? selected
                    : false;

        }

    } else {

        start11FullSquad.push({

            id:
                start11MakeId(),

            name,

            number,

            position,

            status,

            selected:
                status === "available"
                    ? selected
                    : false

        });

    }


    start11SaveFullSquad();

    start11CloseSquadPlayerModal();

    start11RenderSquadUI();


    if (
        typeof visNotification ===
        "function"
    ) {

        visNotification(
            `${name} er gemt i truppen`
        );

    }

}


function start11DeleteSquadPlayer() {

    if (
        !start11EditingSquadPlayerId
    ) {

        return;

    }


    const player =
        start11FullSquad.find(
            item =>
                item.id ===
                start11EditingSquadPlayerId
        );


    if (
        !player
    ) {

        return;

    }


    const role =
        start11GetPlayerRole(
            player
        );


    if (
        role === "starting" ||
        role === "substitute"
    ) {

        if (
            typeof visNotification ===
            "function"
        ) {

            visNotification(
                "Spilleren er i kampens opstilling. Fjern spilleren dér først."
            );

        }

        return;

    }


    start11FullSquad =
        start11FullSquad.filter(
            item =>
                item.id !==
                start11EditingSquadPlayerId
        );


    start11SaveFullSquad();

    start11CloseSquadPlayerModal();

    start11RenderSquadUI();

}


function start11RenderMatchDashboard() {

    const setText =
        (
            id,
            text
        ) => {

            const element =
                document.getElementById(
                    id
                );


            if (
                element
            ) {

                element.textContent =
                    text;

            }

        };


    const home =
        kampplan?.homeTeam ||
        "FC THY";


    const away =
        kampplan?.awayTeam ||
        "MODSTANDER";


    const date =
        kampplan?.matchDate ||
        "Dato ikke valgt";


    const time =
        kampplan?.matchTime ||
        "Tid ikke valgt";


    const place =
        kampplan?.matchPlace ||
        "Spillested ikke valgt";
        
        const homeLogoElement =
    document.getElementById(
        "dashboardHomeLogo"
    );


const awayLogoElement =
    document.getElementById(
        "dashboardAwayLogo"
    );


const homeLogoFallback =
    document.getElementById(
        "dashboardHomeLogoFallback"
    );


const awayLogoFallback =
    document.getElementById(
        "dashboardAwayLogoFallback"
    );


function updateDashboardLogo(
    imageElement,
    fallbackElement,
    imageData
) {

    if (
        imageElement &&
        imageData
    ) {

        imageElement.src =
            imageData;


        imageElement.style.display =
            "block";


        if (
            fallbackElement
        ) {

            fallbackElement.style.display =
                "none";

        }

    } else {

        if (
            imageElement
        ) {

            imageElement.removeAttribute(
                "src"
            );


            imageElement.style.display =
                "none";

        }


        if (
            fallbackElement
        ) {

            fallbackElement.style.display =
                "grid";

        }

    }

}


updateDashboardLogo(
    homeLogoElement,
    homeLogoFallback,
    kampplan?.homeLogo
);


updateDashboardLogo(
    awayLogoElement,
    awayLogoFallback,
    kampplan?.awayLogo
);

    setText(
        "dashboardHomeTeam",
        home
    );


    setText(
        "dashboardAwayTeam",
        away
    );


    setText(
        "dashboardMatchDate",
        date
    );


    setText(
        "dashboardMatchTime",
        time
    );


    setText(
        "dashboardMatchPlace",
        place
    );


    setText(
        "bottomMatchDate",
        kampplan?.matchDate ||
        "—"
    );


    setText(
        "bottomMatchTime",
        kampplan?.matchTime ||
        "—"
    );


    setText(
        "bottomMatchPlace",
        kampplan?.matchPlace ||
        "—"
    );


    setText(
        "bottomOpponent",
        away
    );


    setText(
        "dashboardWithBall",
        kampplan?.teamWithBall ||
        "Ingen fokuspunkter tilføjet endnu."
    );


    setText(
        "dashboardWithoutBall",
        kampplan?.teamWithoutBall ||
        "Ingen fokuspunkter tilføjet endnu."
    );


    setText(
        "dashboardCoachMessage",
        kampplan?.coachMessage ||
        "Tilføj en trænerbesked i kampplanen."
    );


    start11RenderUpcomingMatches();

}


function start11GetDashboardMatches() {

    const stored =
        start11ReadJson(
            START11_MATCHES_KEY,
            []
        );


    const currentMatch = {

        id:
            "current",

        date:
            kampplan?.matchDate ||
            "",

        time:
            kampplan?.matchTime ||
            "",

        home:
            kampplan?.homeTeam ||
            "FC THY",

        away:
            kampplan?.awayTeam ||
            "MODSTANDER",

        place:
            kampplan?.matchPlace ||
            "",

        current:
            true

    };


    const matches =
        Array.isArray(stored)
            ? stored.filter(
                item =>
                    item &&
                    item.id !==
                        "current"
            )
            : [];


    return [
        currentMatch,
        ...matches
    ];

}


function start11RenderUpcomingMatches() {

    const list =
        document.getElementById(
            "upcomingMatchesList"
        );


    if (
        !list
    ) {

        return;

    }


    const matches =
        start11GetDashboardMatches()
            .slice(
                0,
                6
            );


    list.innerHTML =
        "";


    matches.forEach(
        match => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "upcoming-match-row" +
                (
                    match.current
                        ? " current"
                        : ""
                );


            const opponent =
                match.home ===
                kampplan?.homeTeam
                    ? match.away
                    : match.home;


            row.innerHTML = `

                <span>
                    ${start11Escape(match.date || "—")}
                </span>

                <span class="match-opponent">
                    ${start11Escape(opponent || "Modstander")}
                </span>

                <span>
                    ${match.home === kampplan?.homeTeam ? "H" : "U"}
                </span>

                <span>
                    ${start11Escape(match.time || "—")}
                </span>

            `;


            list.appendChild(
                row
            );

        }
    );

}


function start11UpdateSubstituteBadge() {

    const badge =
        document.getElementById(
            "substituteCountBadge"
        );


    if (
        badge
    ) {

        const count =
            Array.isArray(udskiftere)
                ? udskiftere.filter(Boolean).length
                : 0;


        badge.textContent =
            `(${count})`;

    }

}


function start11RenderSquadUI() {

    start11SyncSquadFromCurrentMatch();

    start11RenderFullSquad();

    start11RenderMatchSquad();

    start11UpdateSubstituteBadge();

    start11RenderMatchDashboard();

}


function start11SaveDbuUrl() {

    const input =
        document.getElementById(
            "dbuTeamUrlInput"
        );


    const status =
        document.getElementById(
            "dbuConnectionStatus"
        );


    const value =
        input?.value.trim() ||
        "";


    if (
        !value
    ) {

        localStorage.removeItem(
            START11_DBU_URL_KEY
        );


        if (
            status
        ) {

            status.textContent =
                "Ikke forbundet";

        }


        return;

    }


    try {

        const url =
            new URL(value);


        if (
            !url.hostname
                .toLowerCase()
                .endsWith("dbu.dk")
        ) {

            throw new Error(
                "DBU-link forventes."
            );

        }


        localStorage.setItem(
            START11_DBU_URL_KEY,
            url.href
        );


        if (
            status
        ) {

            status.textContent =
                "DBU-link gemt – klar til automatisk sync";

        }


        if (
            typeof visNotification ===
            "function"
        ) {

            visNotification(
                "DBU-holdlink gemt."
            );

        }

    } catch (error) {

        if (
            typeof visNotification ===
            "function"
        ) {

            visNotification(
                "Indsæt et gyldigt DBU-link."
            );

        }

    }

}


function start11OpenDbuUrl() {

    const value =
        localStorage.getItem(
            START11_DBU_URL_KEY
        ) ||
        document.getElementById(
            "dbuTeamUrlInput"
        )?.value.trim();


    if (
        !value
    ) {

        if (
            typeof visNotification ===
            "function"
        ) {

            visNotification(
                "Gem først jeres DBU-holdlink."
            );

        }

        return;

    }


    window.open(
        value,
        "_blank",
        "noopener"
    );

}


function start11SetupDashboardEvents() {

    document
        .querySelectorAll(
            ".start11-nav-item[data-start11-target]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(
                                ".start11-nav-item"
                            )
                            .forEach(
                                item =>
                                    item.classList.remove(
                                        "active"
                                    )
                            );


                        button.classList.add(
                            "active"
                        );


                        const target =
                            document.getElementById(
                                button.dataset.start11Target
                            );


                        target?.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });

                    }
                );

            }
        );


    [
        "topPdfButton",
        "dashboardPdfButton"
    ].forEach(
        id => {

            document
                .getElementById(id)
                ?.addEventListener(
                    "click",
                    () => {

                        if (
                            typeof genererPDF ===
                            "function"
                        ) {

                            genererPDF();

                        }

                    }
                );

        }
    );


    [
        "openCurrentMatchButton",
        "editMatchPlanShortcut",
        "editMatchInfoBottom",
        "editTacticsBottom"
    ].forEach(
        id => {

            document
                .getElementById(id)
                ?.addEventListener(
                    "click",
                    () => {

                        if (
                            typeof åbnKampplan ===
                            "function"
                        ) {

                            åbnKampplan();

                        }

                    }
                );

        }
    );


    document
        .getElementById(
            "openSquadSectionButton"
        )
        ?.addEventListener(
            "click",
            () => {

                document
                    .getElementById(
                        "squadSection"
                    )
                    ?.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

            }
        );


    document
        .getElementById(
            "addFullSquadPlayerButton"
        )
        ?.addEventListener(
            "click",
            () => {

                start11OpenSquadPlayerModal();

            }
        );


    document
        .getElementById(
            "closeSquadPlayerModal"
        )
        ?.addEventListener(
            "click",
            start11CloseSquadPlayerModal
        );


    document
        .getElementById(
            "saveSquadPlayerButton"
        )
        ?.addEventListener(
            "click",
            start11SaveSquadPlayerFromModal
        );


    document
        .getElementById(
            "deleteSquadPlayerButton"
        )
        ?.addEventListener(
            "click",
            start11DeleteSquadPlayer
        );


    document
        .getElementById(
            "squadPlayerModal"
        )
        ?.addEventListener(
            "click",
            event => {

                if (
                    event.target.id ===
                    "squadPlayerModal"
                ) {

                    start11CloseSquadPlayerModal();

                }

            }
        );


    [
        "squadSearchInput",
        "squadPositionFilter",
        "squadStatusFilter"
    ].forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );


            element?.addEventListener(
                id === "squadSearchInput"
                    ? "input"
                    : "change",
                start11RenderFullSquad
            );

        }
    );


    document
        .querySelectorAll(
            ".squad-view-tab"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        start11SquadView =
                            button.dataset.squadView ||
                            "match";


                        document
                            .querySelectorAll(
                                ".squad-view-tab"
                            )
                            .forEach(
                                item =>
                                    item.classList.remove(
                                        "active"
                                    )
                            );


                        button.classList.add(
                            "active"
                        );


                        start11RenderMatchSquad();

                    }
                );

            }
        );


    document
        .getElementById(
            "saveDbuTeamUrl"
        )
        ?.addEventListener(
            "click",
            start11SaveDbuUrl
        );


    document
        .getElementById(
            "openDbuTeamUrl"
        )
        ?.addEventListener(
            "click",
            start11OpenDbuUrl
        );


    const savedDbuUrl =
        localStorage.getItem(
            START11_DBU_URL_KEY
        );


    const dbuInput =
        document.getElementById(
            "dbuTeamUrlInput"
        );


    const dbuStatus =
        document.getElementById(
            "dbuConnectionStatus"
        );


    if (
        dbuInput &&
        savedDbuUrl
    ) {

        dbuInput.value =
            savedDbuUrl;

    }


    if (
        dbuStatus &&
        savedDbuUrl
    ) {

        dbuStatus.textContent =
            "DBU-link gemt – klar til automatisk sync";

    }

}


/*
    Hook på den eksisterende gemmefunktion.

    Vi lader den originale gemAlt() køre først.
    Derefter opdaterer vi KUN det nye dashboard.
*/
if (
    typeof gemAlt ===
    "function"
) {

    const start11OriginalGemAlt =
        gemAlt;


    gemAlt =
        function (...args) {

            const result =
                start11OriginalGemAlt.apply(
                    this,
                    args
                );


            try {

                start11RenderSquadUI();

            } catch (error) {

                console.warn(
                    "START11 dashboard refresh:",
                    error
                );

            }


            return result;

        };

}


/*
    Samme princip for kampoverskriften:
    den gamle funktion beholdes.
*/
if (
    typeof opdaterKampTitel ===
    "function"
) {

    const start11OriginalUpdateMatchTitle =
        opdaterKampTitel;


    opdaterKampTitel =
        function (...args) {

            const result =
                start11OriginalUpdateMatchTitle.apply(
                    this,
                    args
                );


            try {

                start11RenderMatchDashboard();

            } catch (error) {

                console.warn(
                    "START11 kamp-dashboard:",
                    error
                );

            }


            return result;

        };

}


/* START DET NYE DASHBOARD */
function start11InitDashboard() {

    start11LoadFullSquad();

    start11SetupDashboardEvents();

    start11RenderSquadUI();

}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        () => {

            setTimeout(
                start11InitDashboard,
                0
            );

        }
    );

} else {

    setTimeout(
        start11InitDashboard,
        0
    );

}

/* =========================================================
   START11 – TRUP / KAMPTRUP FIX V2
   COPY/PASTE HELE DENNE BLOK HELT NEDERST I DIN NUVÆRENDE JS.

   DETTE GØR:
   1) Nye spillere oprettes kun via "TILFØJ NY SPILLER" i TRUP.
   2) Klik på en TOM plads i startopstillingen åbner spillerlisten.
   3) "+ TILFØJ UDSKIFTER" åbner spillerlisten.
   4) En "UDTAGET" spiller får knapperne START / BÆNK / FRAVÆLG.
   5) Spillere kan være i hele truppen uden at være udtaget.
   6) Spillere kan være udtaget uden endnu at være placeret.
   7) Fokuspunkter/styrker/svagheder/video gemmes på spilleren i TRUP.
   8) De gamle drag/drop-, PDF-, login- og kampplanfunktioner røres ikke.
========================================================= */


/* =========================================================
   BEDRE MATCH AF SPILLERE
========================================================= */

function start11SamePlayer(
    a,
    b
) {

    if (
        !a ||
        !b
    ) {

        return false;

    }


    const aId =
        a.squadId ||
        a.id ||
        "";


    const bId =
        b.squadId ||
        b.id ||
        "";


    if (
        aId &&
        bId &&
        aId === bId
    ) {

        return true;

    }


    const aName =
        String(
            a.name || ""
        )
            .trim()
            .toLocaleLowerCase("da-DK");


    const bName =
        String(
            b.name || ""
        )
            .trim()
            .toLocaleLowerCase("da-DK");


    if (
        !aName ||
        !bName ||
        aName !== bName
    ) {

        return false;

    }


    const aNumber =
        String(
            a.number || ""
        ).trim();


    const bNumber =
        String(
            b.number || ""
        ).trim();


    return (
        !aNumber ||
        !bNumber ||
        aNumber === bNumber
    );

}


/* =========================================================
   BEVAR ALLE SPILLERDATA I HELE TRUPPEN
========================================================= */

function start11NormalizeSquadPlayer(
    player,
    selected = false
) {

    return {

        ...player,

        id:
            player?.squadId ||
            player?.id ||
            start11MakeId(),

        name:
            player?.name ||
            "",

        number:
            player?.number ||
            "",

        position:
            player?.position ||
            "CM",

        status:
            player?.squadStatus ||
            player?.status ||
            "available",

        selected:
            typeof player?.selected === "boolean"
                ? player.selected
                : selected,

        strengths:
            player?.strengths ||
            "",

        weaknesses:
            player?.weaknesses ||
            "",

        focusWithBall:
            player?.focusWithBall ||
            "",

        focusWithoutBall:
            player?.focusWithoutBall ||
            "",

        video:
            player?.video ||
            ""

    };

}


/* =========================================================
   LAV EN KAMP-SPILLER UD FRA EN TRUP-SPILLER
========================================================= */

function start11SquadPlayerToMatchPlayer(
    squadPlayer
) {

    return {

        squadId:
            squadPlayer.id,

        name:
            squadPlayer.name ||
            "",

        number:
            squadPlayer.number ||
            "",

        position:
            squadPlayer.position ||
            "CM",

        strengths:
            squadPlayer.strengths ||
            "",

        weaknesses:
            squadPlayer.weaknesses ||
            "",

        focusWithBall:
            squadPlayer.focusWithBall ||
            "",

        focusWithoutBall:
            squadPlayer.focusWithoutBall ||
            "",

        video:
            squadPlayer.video ||
            ""

    };

}


/* =========================================================
   FIND OM EN TRUP-SPILLER ALLEREDE ER PLACERET
========================================================= */

function start11FindStarterIndexBySquadPlayer(
    squadPlayer
) {

    if (
        !Array.isArray(spillere)
    ) {

        return -1;

    }


    return spillere.findIndex(
        player =>
            player &&
            start11SamePlayer(
                squadPlayer,
                player
            )
    );

}


function start11FindSubstituteIndexBySquadPlayer(
    squadPlayer
) {

    if (
        !Array.isArray(udskiftere)
    ) {

        return -1;

    }


    return udskiftere.findIndex(
        player =>
            player &&
            start11SamePlayer(
                squadPlayer,
                player
            )
    );

}


/* =========================================================
   FIND BEDSTE TOMME STARTPLADS
========================================================= */

function start11FindBestEmptyStarterSlot(
    squadPlayer
) {

    if (
        !Array.isArray(spillere)
    ) {

        return null;

    }


    const formation =
        formationer[
            formationSelector.value
        ] ||
        formationer["4-4-2"];


    /*
        Prøv først en tom plads med samme position.
    */

    for (
        let index = 0;
        index < formation.length;
        index++
    ) {

        const role =
            formation[index]?.[0];


        if (
            !spillere[index] &&
            role === squadPlayer.position
        ) {

            return index;

        }

    }


    /*
        Ellers første tomme plads.
    */

    for (
        let index = 0;
        index < 11;
        index++
    ) {

        if (
            !spillere[index]
        ) {

            return index;

        }

    }


    return null;

}


/* =========================================================
   PLACER SPILLER I STARTOPSTILLING
========================================================= */

function start11PlaceSquadPlayerAsStarter(
    playerId,
    requestedSlot = null
) {

    const squadPlayer =
        start11FullSquad.find(
            player =>
                player.id === playerId
        );


    if (
        !squadPlayer
    ) {

        return;

    }


    if (
        squadPlayer.status !==
        "available"
    ) {

        visNotification(
            "Spilleren skal være Tilgængelig, før hun kan komme i kamptruppen."
        );

        return;

    }


    const existingStarterIndex =
        start11FindStarterIndexBySquadPlayer(
            squadPlayer
        );


    if (
        existingStarterIndex !== -1
    ) {

        visNotification(
            `${squadPlayer.name} er allerede i startopstillingen.`
        );

        return;

    }


    let targetSlot =
        Number.isInteger(
            requestedSlot
        )
            ? requestedSlot
            : start11FindBestEmptyStarterSlot(
                squadPlayer
            );


    if (
        targetSlot === null ||
        targetSlot < 0 ||
        targetSlot > 10
    ) {

        visNotification(
            "Startopstillingen er fuld. Flyt først en spiller til bænken."
        );

        return;

    }


    /*
        Hvis spilleren allerede sidder på bænken,
        fjernes hun derfra først.
    */

    const substituteIndex =
        start11FindSubstituteIndexBySquadPlayer(
            squadPlayer
        );


    if (
        substituteIndex !== -1
    ) {

        udskiftere.splice(
            substituteIndex,
            1
        );

    }


    /*
        RequestedSlot kommer kun fra en tom plads.
        Hvis noget alligevel er landet der imellem,
        stopper vi for at undgå at overskrive nogen.
    */

    if (
        spillere[targetSlot]
    ) {

        visNotification(
            "Den valgte plads er ikke længere tom."
        );

        tegnOpstilling();

        return;

    }


    spillere[targetSlot] =
        start11SquadPlayerToMatchPlayer(
            squadPlayer
        );


    squadPlayer.selected =
        true;


    start11SaveFullSquad();

    gemAlt();

    tegnOpstilling();

    opdaterUdskiftere();

    start11RenderSquadUI();


    visNotification(
        `${squadPlayer.name} er sat i startopstillingen.`
    );


    start11ClosePlayerPicker();

}


/* =========================================================
   PLACER SPILLER PÅ BÆNKEN
========================================================= */

function start11PlaceSquadPlayerAsSubstitute(
    playerId
) {

    const squadPlayer =
        start11FullSquad.find(
            player =>
                player.id === playerId
        );


    if (
        !squadPlayer
    ) {

        return;

    }


    if (
        squadPlayer.status !==
        "available"
    ) {

        visNotification(
            "Spilleren skal være Tilgængelig, før hun kan komme i kamptruppen."
        );

        return;

    }


    if (
        start11FindSubstituteIndexBySquadPlayer(
            squadPlayer
        ) !== -1
    ) {

        visNotification(
            `${squadPlayer.name} er allerede på bænken.`
        );

        return;

    }


    if (
        start11FindStarterIndexBySquadPlayer(
            squadPlayer
        ) !== -1
    ) {

        visNotification(
            `${squadPlayer.name} er allerede i startopstillingen. Brug drag hvis hun skal bytte med en udskifter.`
        );

        return;

    }


    udskiftere.push(
        start11SquadPlayerToMatchPlayer(
            squadPlayer
        )
    );


    squadPlayer.selected =
        true;


    start11SaveFullSquad();

    gemAlt();

    tegnOpstilling();

    opdaterUdskiftere();

    start11RenderSquadUI();


    visNotification(
        `${squadPlayer.name} er sat på bænken.`
    );


    start11ClosePlayerPicker();

}


/* =========================================================
   UDTAG / FRAVÆLG EN SPILLER
========================================================= */

function start11SetSquadPlayerSelected(
    playerId,
    selected
) {

    const player =
        start11FullSquad.find(
            item =>
                item.id === playerId
        );


    if (
        !player
    ) {

        return;

    }


    const role =
        start11GetPlayerRole(
            player
        );


    if (
        !selected &&
        (
            role === "starting" ||
            role === "substitute"
        )
    ) {

        visNotification(
            "Spilleren er allerede placeret i kampen. Fjern eller flyt spilleren fra opstillingen først."
        );

        return;

    }


    if (
        selected &&
        player.status !==
        "available"
    ) {

        visNotification(
            "Spilleren skal være Tilgængelig, før hun kan udtages."
        );

        return;

    }


    player.selected =
        selected;


    start11SaveFullSquad();

    start11RenderSquadUI();


    visNotification(
        selected
            ? `${player.name} er udtaget.`
            : `${player.name} er ikke længere udtaget.`
    );

}


/* =========================================================
   SPILLERVÆLGER-MODAL
========================================================= */

let start11PlayerPickerMode =
    null;

let start11PlayerPickerStarterSlot =
    null;


function start11EnsurePlayerPicker() {

    if (
        document.getElementById(
            "start11PlayerPickerModal"
        )
    ) {

        return;

    }


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "start11PlayerPickerModal";


    modal.className =
        "start11-player-picker-overlay";


    modal.innerHTML = `

        <div class="start11-player-picker-panel">

            <div class="start11-player-picker-top">

                <div>
                    <div class="start11-player-picker-kicker">
                        KAMPTRUP
                    </div>

                    <h2 id="start11PlayerPickerTitle">
                        VÆLG SPILLER
                    </h2>
                </div>

                <button
                    id="start11ClosePlayerPicker"
                    class="start11-player-picker-close"
                    type="button"
                >
                    ×
                </button>

            </div>

            <input
                id="start11PlayerPickerSearch"
                class="start11-player-picker-search"
                type="search"
                placeholder="Søg spiller..."
            >

            <div
                id="start11PlayerPickerList"
                class="start11-player-picker-list"
            ></div>

            <div class="start11-player-picker-footer">

                <span>
                    Nye spillere oprettes under TRUP → TILFØJ NY SPILLER
                </span>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    document
        .getElementById(
            "start11ClosePlayerPicker"
        )
        ?.addEventListener(
            "click",
            start11ClosePlayerPicker
        );


    document
        .getElementById(
            "start11PlayerPickerSearch"
        )
        ?.addEventListener(
            "input",
            start11RenderPlayerPicker
        );


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target === modal
            ) {

                start11ClosePlayerPicker();

            }

        }
    );

}


/* =========================================================
   ÅBN SPILLERVÆLGER
========================================================= */

function start11OpenPlayerPicker(
    mode,
    starterSlot = null
) {

    start11EnsurePlayerPicker();


    start11PlayerPickerMode =
        mode;


    start11PlayerPickerStarterSlot =
        Number.isInteger(
            starterSlot
        )
            ? starterSlot
            : null;


    const title =
        document.getElementById(
            "start11PlayerPickerTitle"
        );


    if (
        title
    ) {

        if (
            mode === "starter"
        ) {

            const formation =
                formationer[
                    formationSelector.value
                ] ||
                formationer["4-4-2"];


            const role =
                Number.isInteger(
                    starterSlot
                )
                    ? formation[
                        starterSlot
                    ]?.[0]
                    : null;


            title.textContent =
                role
                    ? `VÆLG SPILLER TIL ${role}`
                    : "VÆLG SPILLER TIL STARTOPSTILLING";

        } else {

            title.textContent =
                "VÆLG UDSKIFTER";

        }

    }


    const search =
        document.getElementById(
            "start11PlayerPickerSearch"
        );


    if (
        search
    ) {

        search.value =
            "";

    }


    start11RenderPlayerPicker();


    document.getElementById(
        "start11PlayerPickerModal"
    ).style.display =
        "flex";


    setTimeout(
        () => {

            search?.focus();

        },
        30
    );

}


/* =========================================================
   LUK SPILLERVÆLGER
========================================================= */

function start11ClosePlayerPicker() {

    const modal =
        document.getElementById(
            "start11PlayerPickerModal"
        );


    if (
        modal
    ) {

        modal.style.display =
            "none";

    }


    start11PlayerPickerMode =
        null;


    start11PlayerPickerStarterSlot =
        null;

}


/* =========================================================
   RENDER SPILLERVÆLGER
========================================================= */

function start11RenderPlayerPicker() {

    const list =
        document.getElementById(
            "start11PlayerPickerList"
        );


    if (
        !list
    ) {

        return;

    }


    const search =
        (
            document.getElementById(
                "start11PlayerPickerSearch"
            )?.value ||
            ""
        )
            .trim()
            .toLocaleLowerCase("da-DK");


    const availablePlayers =
        start11FullSquad
            .filter(
                player => {

                    if (
                        player.status !==
                        "available"
                    ) {

                        return false;

                    }


                    /*
                        Vis kun spillere, som ikke allerede
                        står på banen eller bænken.
                    */

                    const role =
                        start11GetPlayerRole(
                            player
                        );


                    if (
                        role === "starting" ||
                        role === "substitute"
                    ) {

                        return false;

                    }


                    if (
                        search &&
                        !String(
                            player.name || ""
                        )
                            .toLocaleLowerCase(
                                "da-DK"
                            )
                            .includes(
                                search
                            )
                    ) {

                        return false;

                    }


                    return true;

                }
            )
            .sort(
                (a, b) => {

                    /*
                        Udtagne spillere først.
                    */

                    if (
                        a.selected !==
                        b.selected
                    ) {

                        return a.selected
                            ? -1
                            : 1;

                    }


                    return String(
                        a.name || ""
                    ).localeCompare(
                        String(
                            b.name || ""
                        ),
                        "da"
                    );

                }
            );


    list.innerHTML =
        "";


    if (
        !availablePlayers.length
    ) {

        list.innerHTML = `

            <div class="start11-player-picker-empty">

                <strong>
                    Ingen ledige spillere
                </strong>

                <span>
                    Opret en spiller via "TILFØJ NY SPILLER" i TRUP,
                    eller fjern en spiller fra den nuværende opstilling.
                </span>

            </div>

        `;

        return;

    }


    availablePlayers.forEach(
        player => {

            const row =
                document.createElement(
                    "button"
                );


            row.type =
                "button";


            row.className =
                "start11-player-picker-row";


            row.innerHTML = `

                <span class="start11-picker-number">
                    ${start11Escape(player.number || "—")}
                </span>

                <span class="start11-picker-main">

                    <strong>
                        ${start11Escape(player.name)}
                    </strong>

                    <small>
                        ${start11Escape(
                            positionsNavne[
                                player.position
                            ] ||
                            player.position
                        )}
                    </small>

                </span>

                <span class="start11-picker-selected ${player.selected ? "yes" : ""}">
                    ${player.selected ? "UDTAGET" : "IKKE UDTAGET"}
                </span>

                <span class="start11-picker-arrow">
                    →
                </span>

            `;


            row.addEventListener(
                "click",
                () => {

                    if (
                        start11PlayerPickerMode ===
                        "starter"
                    ) {

                        start11PlaceSquadPlayerAsStarter(
                            player.id,
                            start11PlayerPickerStarterSlot
                        );

                    } else {

                        start11PlaceSquadPlayerAsSubstitute(
                            player.id
                        );

                    }

                }
            );


            list.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   INTERCEPT GAMLE "TILFØJ SPILLER"-KLIK
   Vi bruger capture, så de gamle click-handlers ikke når
   at åbne den gamle spiller-modal på tomme pladser.
========================================================= */

function start11InstallLineupPickerIntercept() {

    if (
        window.__start11PickerInterceptInstalled
    ) {

        return;

    }


    window.__start11PickerInterceptInstalled =
        true;


    document.addEventListener(
        "click",
        event => {

            /*
                "+ TILFØJ UDSKIFTER"
            */

            const addSubButton =
                event.target.closest(
                    "#addSubstituteButton"
                );


            if (
                addSubButton
            ) {

                event.preventDefault();

                event.stopImmediatePropagation();

                start11OpenPlayerPicker(
                    "substitute"
                );

                return;

            }


            /*
                Tom plads på banen.
            */

            const emptySlot =
                event.target.closest(
                    "#pitch .player-slot.empty-slot"
                );


            if (
                emptySlot
            ) {

                const pitchElement =
                    document.getElementById(
                        "pitch"
                    );


                const slots =
                    pitchElement
                        ? Array.from(
                            pitchElement.querySelectorAll(
                                ".player-slot"
                            )
                        )
                        : [];


                const slotIndex =
                    slots.indexOf(
                        emptySlot
                    );


                if (
                    slotIndex !== -1
                ) {

                    event.preventDefault();

                    event.stopImmediatePropagation();

                    start11OpenPlayerPicker(
                        "starter",
                        slotIndex
                    );

                    return;

                }

            }

        },
        true
    );

}


/* =========================================================
   UDVId HELE-TRUP MODALEN MED ALLE SPILLERDATA
========================================================= */

function start11EnsureFullPlayerFields() {

    const grid =
        document.querySelector(
            "#squadPlayerModal .squad-player-form-grid"
        );


    if (
        !grid ||
        document.getElementById(
            "squadPlayerFocusWithBall"
        )
    ) {

        return;

    }


    const extra =
        document.createElement(
            "div"
        );


    extra.className =
        "start11-squad-extra-fields";


    extra.innerHTML = `

        <label>
            Styrker
            <textarea
                id="squadPlayerStrengths"
                rows="3"
                placeholder="Fx 1v1, fart, blik for spillet..."
            ></textarea>
        </label>

        <label>
            Svagheder / udviklingsområder
            <textarea
                id="squadPlayerWeaknesses"
                rows="3"
                placeholder="Fx orientering, duelspil..."
            ></textarea>
        </label>

        <label>
            Fokuspunkter med bold
            <textarea
                id="squadPlayerFocusWithBall"
                rows="3"
                placeholder="Spillerspecifikt fokus med bold..."
            ></textarea>
        </label>

        <label>
            Fokuspunkter uden bold
            <textarea
                id="squadPlayerFocusWithoutBall"
                rows="3"
                placeholder="Spillerspecifikt fokus uden bold..."
            ></textarea>
        </label>

        <label class="start11-squad-extra-wide">
            Videolink
            <input
                id="squadPlayerVideo"
                type="url"
                placeholder="https://..."
            >
        </label>

    `;


    grid.insertAdjacentElement(
        "afterend",
        extra
    );

}


/* =========================================================
   OVERRIDE: ÅBN TRUP-SPILLER MODAL
========================================================= */

function start11OpenSquadPlayerModal(
    id = null
) {

    start11EnsureFullPlayerFields();


    const modal =
        document.getElementById(
            "squadPlayerModal"
        );


    if (
        !modal
    ) {

        return;

    }


    start11EditingSquadPlayerId =
        id;


    const player =
        id
            ? start11FullSquad.find(
                item =>
                    item.id === id
            )
            : null;


    const setValue =
        (
            elementId,
            value
        ) => {

            const element =
                document.getElementById(
                    elementId
                );


            if (
                element
            ) {

                element.value =
                    value ?? "";

            }

        };


    setValue(
        "squadPlayerName",
        player?.name || ""
    );

    setValue(
        "squadPlayerNumber",
        player?.number || ""
    );

    setValue(
        "squadPlayerPosition",
        player?.position || "CM"
    );

    setValue(
        "squadPlayerStatus",
        player?.status || "available"
    );


    if (typeof window.s25MountPlayerGroupSelect === "function") {
        window.s25MountPlayerGroupSelect(player);
    }

    setValue(
        "squadPlayerStrengths",
        player?.strengths || ""
    );

    setValue(
        "squadPlayerWeaknesses",
        player?.weaknesses || ""
    );

    setValue(
        "squadPlayerFocusWithBall",
        player?.focusWithBall || ""
    );

    setValue(
        "squadPlayerFocusWithoutBall",
        player?.focusWithoutBall || ""
    );

    setValue(
        "squadPlayerVideo",
        player?.video || ""
    );


    const selected =
        document.getElementById(
            "squadPlayerSelected"
        );


    if (
        selected
    ) {

        selected.checked =
            Boolean(
                player?.selected
            );

    }


    const title =
        document.getElementById(
            "squadPlayerModalTitle"
        );


    if (
        title
    ) {

        title.textContent =
            player
                ? "REDIGER SPILLER"
                : "TILFØJ NY SPILLER";

    }


    const deleteButton =
        document.getElementById(
            "deleteSquadPlayerButton"
        );


    if (
        deleteButton
    ) {

        deleteButton.style.display =
            player
                ? "inline-flex"
                : "none";

    }


    modal.style.display =
        "flex";

}


/* =========================================================
   OVERRIDE: GEM TRUP-SPILLER
========================================================= */

function start11SaveSquadPlayerFromModal() {

    const name =
        document.getElementById(
            "squadPlayerName"
        )?.value.trim() ||
        "";


    if (
        !name
    ) {

        visNotification(
            "Indtast spillerens navn."
        );

        return;

    }


    const data = {

        name,

        number:
            document.getElementById(
                "squadPlayerNumber"
            )?.value.trim() ||
            "",

        position:
            document.getElementById(
                "squadPlayerPosition"
            )?.value ||
            "CM",

        status:
            document.getElementById(
                "squadPlayerStatus"
            )?.value ||
            "available",

        strengths:
            document.getElementById(
                "squadPlayerStrengths"
            )?.value.trim() ||
            "",

        weaknesses:
            document.getElementById(
                "squadPlayerWeaknesses"
            )?.value.trim() ||
            "",

        focusWithBall:
            document.getElementById(
                "squadPlayerFocusWithBall"
            )?.value.trim() ||
            "",

        focusWithoutBall:
            document.getElementById(
                "squadPlayerFocusWithoutBall"
            )?.value.trim() ||
            "",

        video:
            document.getElementById(
                "squadPlayerVideo"
            )?.value.trim() ||
            ""

    };


    const selected =
        Boolean(
            document.getElementById(
                "squadPlayerSelected"
            )?.checked
        );


    let player =
        null;


    if (
        start11EditingSquadPlayerId
    ) {

        player =
            start11FullSquad.find(
                item =>
                    item.id ===
                    start11EditingSquadPlayerId
            );


        if (
            player
        ) {

            Object.assign(
                player,
                data
            );


            player.selected =
                data.status === "available"
                    ? selected
                    : false;

        }

    } else {

        player = {

            id:
                start11MakeId(),

            ...data,

            selected:
                data.status === "available"
                    ? selected
                    : false

        };


        start11FullSquad.push(
            player
        );

    }


    start11SaveFullSquad();

    start11CloseSquadPlayerModal();

    start11RenderSquadUI();


    visNotification(
        `${name} er gemt i truppen.`
    );

}


/* =========================================================
   OVERRIDE: RENDER KAMPTRUP
   "UDTAGET" får START / BÆNK / FRAVÆLG.
========================================================= */

function start11RenderMatchSquad() {

    const list =
        document.getElementById(
            "matchSquadOverview"
        );


    const count =
        document.getElementById(
            "matchSquadCount"
        );


    const heading =
        document.getElementById(
            "matchSquadHeading"
        );


    if (
        !list
    ) {

        return;

    }


    const players =
        start11PlayersForSquadView();


    if (
        count
    ) {

        count.textContent =
            String(
                players.length
            );

    }


    if (
        heading
    ) {

        heading.textContent =
            start11SquadView === "all"
                ? "TRUP"
                : start11SquadView === "notSelected"
                    ? "IKKE UDTAGET"
                    : "KAMPTRUP";

    }


    list.innerHTML =
        "";


    const roleOrder = {
        starting: 0,
        substitute: 1,
        selected: 2,
        "not-selected": 3
    };


    players
        .sort(
            (a, b) => {

                const roleA =
                    start11GetPlayerRole(
                        a
                    );


                const roleB =
                    start11GetPlayerRole(
                        b
                    );


                if (
                    roleOrder[roleA] !==
                    roleOrder[roleB]
                ) {

                    return (
                        roleOrder[roleA] -
                        roleOrder[roleB]
                    );

                }


                return String(
                    a.name || ""
                ).localeCompare(
                    String(
                        b.name || ""
                    ),
                    "da"
                );

            }
        )
        .forEach(
            player => {

                const role =
                    start11GetPlayerRole(
                        player
                    );


                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "squad-overview-row start11-squad-overview-row-v2";


                let actions =
                    "";


                if (
                    role === "selected"
                ) {

                    actions = `

                        <div class="start11-squad-actions">

                            <button
                                type="button"
                                class="start11-squad-action start"
                                data-action="start"
                            >
                                START
                            </button>

                            <button
                                type="button"
                                class="start11-squad-action bench"
                                data-action="bench"
                            >
                                BÆNK
                            </button>

                            <button
                                type="button"
                                class="start11-squad-action remove"
                                data-action="remove"
                                title="Ikke udtaget"
                            >
                                ×
                            </button>

                        </div>

                    `;

                } else if (
                    role === "not-selected"
                ) {

                    actions = `

                        <button
                            type="button"
                            class="start11-squad-action select"
                            data-action="select"
                        >
                            UDTAG
                        </button>

                    `;

                } else {

                    actions = `

                        <span class="squad-role-pill ${start11Escape(role)}">
                            ${start11Escape(start11RoleLabel(role))}
                        </span>

                    `;

                }


                row.innerHTML = `

                    <span class="squad-overview-check">
                        ${player.selected || role !== "not-selected" ? "✓" : ""}
                    </span>

                    <span class="squad-overview-number">
                        ${start11Escape(player.number || "—")}
                    </span>

                    <span class="squad-overview-name">
                        ${start11Escape(player.name)}
                    </span>

                    <span class="squad-overview-position">
                        ${start11Escape(player.position)}
                    </span>

                    <div class="start11-squad-row-action-cell">
                        ${actions}
                    </div>

                `;


                row
                    .querySelector(
                        '[data-action="start"]'
                    )
                    ?.addEventListener(
                        "click",
                        event => {

                            event.stopPropagation();

                            start11PlaceSquadPlayerAsStarter(
                                player.id
                            );

                        }
                    );


                row
                    .querySelector(
                        '[data-action="bench"]'
                    )
                    ?.addEventListener(
                        "click",
                        event => {

                            event.stopPropagation();

                            start11PlaceSquadPlayerAsSubstitute(
                                player.id
                            );

                        }
                    );


                row
                    .querySelector(
                        '[data-action="remove"]'
                    )
                    ?.addEventListener(
                        "click",
                        event => {

                            event.stopPropagation();

                            start11SetSquadPlayerSelected(
                                player.id,
                                false
                            );

                        }
                    );


                row
                    .querySelector(
                        '[data-action="select"]'
                    )
                    ?.addEventListener(
                        "click",
                        event => {

                            event.stopPropagation();

                            start11SetSquadPlayerSelected(
                                player.id,
                                true
                            );

                        }
                    );


                /*
                    Klik på selve rækken åbner spillerens
                    trup-profil i stedet for at udtage/fravælge
                    ved et uheld.
                */

                row.addEventListener(
                    "click",
                    () => {

                        start11OpenSquadPlayerModal(
                            player.id
                        );

                    }
                );


                list.appendChild(
                    row
                );

            }
        );

}


/* =========================================================
   STYLING TIL NYE ELEMENTER
   Indsættes fra JS, så du ikke behøver ændre CSS igen.
========================================================= */

function start11InstallSquadPickerStyles() {

    if (
        document.getElementById(
            "start11SquadPickerStyles"
        )
    ) {

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "start11SquadPickerStyles";


    style.textContent = `

        .start11-player-picker-overlay {
            position: fixed;
            inset: 0;
            z-index: 100000;
            display: none;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: rgba(0, 0, 0, .78);
            backdrop-filter: blur(8px);
        }

        .start11-player-picker-panel {
            width: min(620px, 100%);
            max-height: min(760px, 90vh);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            border: 1px solid rgba(130, 255, 84, .28);
            border-radius: 8px;
            background:
                linear-gradient(180deg, #0a130b, #030705);
            box-shadow:
                0 25px 70px rgba(0,0,0,.65);
        }

        .start11-player-picker-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 18px 20px 14px;
            border-bottom: 1px solid rgba(255,255,255,.07);
        }

        .start11-player-picker-kicker {
            margin-bottom: 4px;
            color: #9ddd49;
            font-size: 9px;
            font-weight: 900;
            letter-spacing: 1px;
        }

        .start11-player-picker-top h2 {
            margin: 0;
            color: #f5f7f3;
            font-size: 17px;
        }

        .start11-player-picker-close {
            width: 34px;
            height: 34px;
            border: 1px solid rgba(255,255,255,.12);
            border-radius: 5px;
            color: #d9ded9;
            background: #070c08;
            font-size: 22px;
            cursor: pointer;
        }

        .start11-player-picker-search {
            height: 42px;
            margin: 14px 16px 8px;
            padding: 0 13px;
            border: 1px solid #2a352b;
            border-radius: 5px;
            outline: 0;
            color: #f0f3ef;
            background: #040805;
        }

        .start11-player-picker-search:focus {
            border-color: rgba(130,255,84,.58);
        }

        .start11-player-picker-list {
            min-height: 180px;
            overflow-y: auto;
            padding: 6px 12px 12px;
        }

        .start11-player-picker-row {
            width: 100%;
            min-height: 54px;
            display: grid;
            grid-template-columns: 42px minmax(0, 1fr) auto 24px;
            align-items: center;
            gap: 10px;
            padding: 7px 10px;
            border: 0;
            border-bottom: 1px solid rgba(255,255,255,.055);
            color: #edf1ec;
            background: transparent;
            text-align: left;
            cursor: pointer;
        }

        .start11-player-picker-row:hover {
            background: rgba(130,255,84,.055);
        }

        .start11-picker-number {
            width: 30px;
            height: 30px;
            display: grid;
            place-items: center;
            border-radius: 4px;
            color: #071005;
            background: #9ddd49;
            font-size: 10px;
            font-weight: 1000;
        }

        .start11-picker-main {
            min-width: 0;
            display: grid;
            gap: 3px;
        }

        .start11-picker-main strong {
            overflow: hidden;
            color: #f5f7f3;
            font-size: 11px;
            white-space: nowrap;
            text-overflow: ellipsis;
        }

        .start11-picker-main small {
            color: #788279;
            font-size: 8px;
        }

        .start11-picker-selected {
            padding: 4px 7px;
            border-radius: 999px;
            color: #89928a;
            background: rgba(255,255,255,.055);
            font-size: 7px;
            font-weight: 900;
        }

        .start11-picker-selected.yes {
            color: #9af073;
            background: rgba(75, 156, 47, .22);
        }

        .start11-picker-arrow {
            color: #9ddd49;
            font-size: 15px;
        }

        .start11-player-picker-footer {
            padding: 10px 16px;
            border-top: 1px solid rgba(255,255,255,.06);
            color: #69726a;
            font-size: 8px;
        }

        .start11-player-picker-empty {
            min-height: 180px;
            display: grid;
            align-content: center;
            justify-items: center;
            gap: 8px;
            padding: 25px;
            text-align: center;
        }

        .start11-player-picker-empty strong {
            color: #e9ede8;
            font-size: 12px;
        }

        .start11-player-picker-empty span {
            max-width: 360px;
            color: #758076;
            font-size: 9px;
            line-height: 1.5;
        }

        .start11-squad-overview-row-v2 {
            grid-template-columns:
                20px
                26px
                minmax(70px, 1fr)
                34px
                minmax(92px, auto) !important;
        }

        .start11-squad-row-action-cell {
            min-width: 0;
            display: flex;
            justify-content: flex-end;
        }

        .start11-squad-actions {
            display: flex;
            align-items: center;
            gap: 3px;
        }

        .start11-squad-action {
            height: 25px;
            padding: 0 7px;
            border: 1px solid rgba(157,221,73,.2);
            border-radius: 3px;
            color: #aeb8af;
            background: #071008;
            font-size: 7px;
            font-weight: 900;
            cursor: pointer;
        }

        .start11-squad-action:hover {
            border-color: #9ddd49;
            color: #9ddd49;
        }

        .start11-squad-action.start {
            color: #071005;
            border-color: #9ddd49;
            background: #9ddd49;
        }

        .start11-squad-action.bench {
            color: #8cc7ff;
            border-color: rgba(74,145,214,.4);
            background: rgba(46,108,168,.18);
        }

        .start11-squad-action.remove {
            width: 25px;
            padding: 0;
            color: #ff8e87;
            border-color: rgba(212,74,66,.3);
        }

        .start11-squad-action.select {
            color: #9ddd49;
        }

        .start11-squad-extra-fields {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin: 0 0 12px;
        }

        .start11-squad-extra-fields label {
            display: grid;
            gap: 6px;
            color: #9ea79f;
            font-size: 9px;
            font-weight: 800;
        }

        .start11-squad-extra-fields textarea,
        .start11-squad-extra-fields input {
            width: 100%;
            padding: 9px 11px;
            border: 1px solid #29342a;
            border-radius: 4px;
            outline: none;
            resize: vertical;
            color: #e6ebe5;
            background: #040905;
            font-size: 10px;
            font-family: Arial, Helvetica, sans-serif;
        }

        .start11-squad-extra-fields textarea:focus,
        .start11-squad-extra-fields input:focus {
            border-color: rgba(130,255,84,.56);
        }

        .start11-squad-extra-wide {
            grid-column: 1 / -1;
        }

        #squadPlayerModal .start11-account-panel {
            max-height: 92vh;
            overflow-y: auto;
        }

        @media (max-width: 720px) {

            .start11-squad-extra-fields {
                grid-template-columns: 1fr;
            }

            .start11-squad-extra-wide {
                grid-column: auto;
            }

            .start11-player-picker-row {
                grid-template-columns: 36px minmax(0,1fr) 20px;
            }

            .start11-picker-selected {
                display: none;
            }

        }

    `;


    document.head.appendChild(
        style
    );

}


/* =========================================================
   START FIXEN
========================================================= */

function start11InitSquadMatchFixV2() {

    start11InstallSquadPickerStyles();

    start11EnsurePlayerPicker();

    start11EnsureFullPlayerFields();

    start11InstallLineupPickerIntercept();

    start11RenderSquadUI();

}


/*
    Filen bliver lagt efter den gamle kode.
    Derfor kører denne efter resten er læst ind.
*/

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        () => {

            setTimeout(
                start11InitSquadMatchFixV2,
                50
            );

        }
    );

} else {

    setTimeout(
        start11InitSquadMatchFixV2,
        50
    );

}


/* =========================================================
   START APP
========================================================= */


setupAccountModals();

initialiserStart11();

/* =========================================================
   START11 – KAMPTRUP FLOW V3
   Kun ændringer til den ønskede spiller-/kamptrup-workflow:

   - Højreklik på STARTER -> tilbage til KAMPTRUP
   - Højreklik på UDSKIFTER -> tilbage til KAMPTRUP
   - Højreklik på spiller i KAMPTRUP/TRUP -> rediger spillerprofil
   - Venstreklik på IKKE UDTAGET spiller -> udtag direkte
   - Nye spillere oprettes fortsat via "+ TILFØJ NY SPILLER"
   - Redigering i TRUP synkroniseres til startopstilling/bænk/PDF
========================================================= */


/* =========================================================
   HJÆLPER – FIND TRUPSPILLER FRA KAMP-SPILLER
========================================================= */

function start11FindSquadPlayerFromMatchPlayer(
    matchPlayer
) {

    if (
        !matchPlayer
    ) {

        return null;

    }


    let squadPlayer =
        start11FullSquad.find(
            player =>
                start11SamePlayer(
                    player,
                    matchPlayer
                )
        );


    /*
        Hvis spilleren af en eller anden grund ikke
        findes i hele truppen endnu, opretter vi
        trup-referencen uden at slette data.
    */
    if (
        !squadPlayer
    ) {

        squadPlayer =
            start11NormalizeSquadPlayer(
                matchPlayer,
                true
            );


        start11FullSquad.push(
            squadPlayer
        );

    }


    return squadPlayer;

}


/* =========================================================
   HJÆLPER – SYNKRONISER TRUPPROFIL TIL KAMP-SPILLER
========================================================= */

function start11CopySquadDataToMatchPlayer(
    squadPlayer,
    matchPlayer
) {

    if (
        !squadPlayer ||
        !matchPlayer
    ) {

        return;

    }


    matchPlayer.squadId =
        squadPlayer.id;

    matchPlayer.name =
        squadPlayer.name ||
        "";

    matchPlayer.number =
        squadPlayer.number ||
        "";

    matchPlayer.position =
        squadPlayer.position ||
        "CM";

    matchPlayer.strengths =
        squadPlayer.strengths ||
        "";

    matchPlayer.weaknesses =
        squadPlayer.weaknesses ||
        "";

    matchPlayer.focusWithBall =
        squadPlayer.focusWithBall ||
        "";

    matchPlayer.focusWithoutBall =
        squadPlayer.focusWithoutBall ||
        "";

    matchPlayer.video =
        squadPlayer.video ||
        "";

}


/* =========================================================
   HØJREKLIK STARTER -> TILBAGE TIL KAMPTRUP
========================================================= */

function start11ReturnStarterToMatchSquad(
    index
) {

    if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= spillere.length
    ) {

        return;

    }


    const matchPlayer =
        spillere[index];


    if (
        !matchPlayer
    ) {

        return;

    }


    const squadPlayer =
        start11FindSquadPlayerFromMatchPlayer(
            matchPlayer
        );


    squadPlayer.selected =
        true;


    /*
        Spilleren fjernes KUN fra den konkrete
        startopstilling. Hun bliver stadig udtaget.
    */
    spillere[index] =
        null;


    start11SaveFullSquad();

    gemAlt();

    tegnOpstilling();

    opdaterUdskiftere();

    start11RenderSquadUI();


    visNotification(
        `${squadPlayer.name} er flyttet tilbage til kamptruppen.`
    );

}


/* =========================================================
   HØJREKLIK UDSKIFTER -> TILBAGE TIL KAMPTRUP
========================================================= */

function start11ReturnSubstituteToMatchSquad(
    index
) {

    if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= udskiftere.length
    ) {

        return;

    }


    const matchPlayer =
        udskiftere[index];


    if (
        !matchPlayer
    ) {

        return;

    }


    const squadPlayer =
        start11FindSquadPlayerFromMatchPlayer(
            matchPlayer
        );


    squadPlayer.selected =
        true;


    /*
        Fjern kun fra bænken.
        Spilleren forbliver i KAMPTRUP.
    */
    udskiftere.splice(
        index,
        1
    );


    start11SaveFullSquad();

    gemAlt();

    tegnOpstilling();

    opdaterUdskiftere();

    start11RenderSquadUI();


    visNotification(
        `${squadPlayer.name} er flyttet tilbage til kamptruppen.`
    );

}


/* =========================================================
   NYT HØJREKLIK-FLOW
   Capture bruges bevidst, så de gamle contextmenu-handlers
   på startopstilling og bænk ikke åbner den gamle modal.
========================================================= */

function start11InstallContextMenuFlowV3() {

    if (
        window.__start11ContextMenuFlowV3
    ) {

        return;

    }


    window.__start11ContextMenuFlowV3 =
        true;


    document.addEventListener(
        "contextmenu",
        event => {

            /*
                1) STARTOPSTILLING
                Højreklik = tilbage til KAMPTRUP.
            */
            const starterSlot =
                event.target.closest(
                    "#pitch .player-slot:not(.empty-slot)"
                );


            if (
                starterSlot
            ) {

                const slots =
                    Array.from(
                        pitch.querySelectorAll(
                            ".player-slot"
                        )
                    );


                const index =
                    slots.indexOf(
                        starterSlot
                    );


                if (
                    index !== -1
                ) {

                    event.preventDefault();

                    event.stopImmediatePropagation();

                    start11ReturnStarterToMatchSquad(
                        index
                    );

                    return;

                }

            }


            /*
                2) UDSKIFTER
                Højreklik = tilbage til KAMPTRUP.
            */
            const substituteRow =
                event.target.closest(
                    "#substituteList .substitute"
                );


            if (
                substituteRow
            ) {

                const index =
                    Number(
                        substituteRow.dataset.index
                    );


                if (
                    Number.isInteger(index)
                ) {

                    event.preventDefault();

                    event.stopImmediatePropagation();

                    start11ReturnSubstituteToMatchSquad(
                        index
                    );

                    return;

                }

            }


            /*
                3) HELE TRUPPEN
                Højreklik = rediger spillerprofil.
            */
            const fullSquadRow =
                event.target.closest(
                    "#fullSquadList .full-squad-row"
                );


            if (
                fullSquadRow
            ) {

                const playerId =
                    fullSquadRow.dataset.playerId;


                if (
                    playerId
                ) {

                    event.preventDefault();

                    event.stopImmediatePropagation();

                    start11OpenSquadPlayerModal(
                        playerId
                    );

                    return;

                }

            }


            /*
                4) KAMPTRUP
                Højreklik = rediger spillerprofil.
            */
            const matchSquadRow =
                event.target.closest(
                    "#matchSquadOverview .squad-overview-row"
                );


            if (
                matchSquadRow
            ) {

                const playerId =
                    matchSquadRow.dataset.playerId;


                if (
                    playerId
                ) {

                    event.preventDefault();

                    event.stopImmediatePropagation();

                    start11OpenSquadPlayerModal(
                        playerId
                    );

                    return;

                }

            }

        },
        true
    );

}


/* =========================================================
   HELE TRUPPEN
   Venstreklik på IKKE UDTAGET = udtag direkte.
   Venstreklik på allerede udtaget = åbn profil.
   Højreklik = profil (håndteres ovenfor).
========================================================= */

function start11RenderFullSquad() {

    const list =
        document.getElementById(
            "fullSquadList"
        );


    const count =
        document.getElementById(
            "fullSquadCount"
        );


    if (
        !list
    ) {

        return;

    }


    if (
        count
    ) {

        count.textContent =
            String(
                start11FullSquad.length
            );

    }


    if (typeof window.s25MountSquadGroups === "function") {
        window.s25MountSquadGroups();
    }


    const players =
        start11GetVisibleSquad();


    list.innerHTML =
        "";


    if (
        !players.length
    ) {

        list.innerHTML = `
            <div class="start11-help-text">
                Ingen spillere matcher filteret.
            </div>
        `;

        return;

    }


    players.forEach(
        player => {

            const role =
                start11GetPlayerRole(
                    player
                );


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "full-squad-row" +
                (
                    player.selected
                        ? ""
                        : " not-selected"
                );


            row.dataset.playerId =
                player.id;


            const selectionLabel =
                (
                    role === "starting"
                )
                    ? "STARTER"
                    : (
                        role === "substitute"
                    )
                        ? "BÆNK"
                        : (
                            player.selected
                        )
                            ? "UDTAGET"
                            : start11StatusLabel(
                                player.status
                            );


            const selectionClass =
                (
                    role === "starting" ||
                    role === "substitute" ||
                    player.selected
                )
                    ? "available"
                    : player.status;


            row.innerHTML = `

                <span class="squad-no">
                    ${start11Escape(player.number || "—")}
                </span>

                <span class="squad-name">
                    ${start11Escape(player.name)}
                </span>

                <span class="squad-pos">
                    ${start11Escape(player.position)}
                </span>

                <span class="squad-status-pill ${start11Escape(selectionClass)}">
                    ${start11Escape(selectionLabel)}
                </span>

            `;


            row.addEventListener(
                "click",
                () => {

                    /*
                        Ikke udtaget:
                        ét venstreklik -> KAMPTRUP.
                    */
                    if (
                        !player.selected &&
                        role === "not-selected"
                    ) {

                        start11SetSquadPlayerSelected(
                            player.id,
                            true
                        );

                        return;

                    }


                    /*
                        Allerede udtaget/placeret:
                        venstreklik åbner profilen.
                    */
                    start11OpenSquadPlayerModal(
                        player.id
                    );

                }
            );


            list.appendChild(
                row
            );

        }
    );


    if (typeof window.s25OrganizeSquadRows === "function") {
        window.s25OrganizeSquadRows();
    }

}


/* =========================================================
   KAMPTRUP
   - UDTAGET får START / BÆNK / ×
   - Ikke udtaget får UDTAG
   - Starter/bænk vises som status
   - Venstreklik på ikke udtaget = udtag direkte
   - Venstreklik på øvrige = spillerprofil
   - Højreklik = spillerprofil
========================================================= */

function start11RenderMatchSquad() {

    const list =
        document.getElementById(
            "matchSquadOverview"
        );


    const count =
        document.getElementById(
            "matchSquadCount"
        );


    const heading =
        document.getElementById(
            "matchSquadHeading"
        );


    if (
        !list
    ) {

        return;

    }


    const players =
        start11PlayersForSquadView();


    if (
        count
    ) {

        count.textContent =
            String(
                players.length
            );

    }


    if (
        heading
    ) {

        heading.textContent =
            start11SquadView === "all"
                ? "TRUP"
                : start11SquadView === "notSelected"
                    ? "IKKE UDTAGET"
                    : "KAMPTRUP";

    }


    list.innerHTML =
        "";


    const roleOrder = {
        starting: 0,
        substitute: 1,
        selected: 2,
        "not-selected": 3
    };


    players
        .sort(
            (a, b) => {

                const roleA =
                    start11GetPlayerRole(a);


                const roleB =
                    start11GetPlayerRole(b);


                if (
                    roleOrder[roleA] !==
                    roleOrder[roleB]
                ) {

                    return (
                        roleOrder[roleA] -
                        roleOrder[roleB]
                    );

                }


                return String(
                    a.name || ""
                ).localeCompare(
                    String(
                        b.name || ""
                    ),
                    "da"
                );

            }
        )
        .forEach(
            player => {

                const role =
                    start11GetPlayerRole(
                        player
                    );


                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "squad-overview-row start11-squad-overview-row-v2";


                row.dataset.playerId =
                    player.id;


                let actions =
                    "";


                /*
                    UDTAGET, men ikke placeret endnu.
                */
                if (
                    role === "selected"
                ) {

                    actions = `

                        <div class="start11-squad-actions">

                            <button
                                type="button"
                                class="start11-squad-action start"
                                data-action="start"
                            >
                                START
                            </button>

                            <button
                                type="button"
                                class="start11-squad-action bench"
                                data-action="bench"
                            >
                                BÆNK
                            </button>

                            <button
                                type="button"
                                class="start11-squad-action remove"
                                data-action="remove"
                                title="Fjern fra kamptrup"
                            >
                                ×
                            </button>

                        </div>

                    `;

                }

                /*
                    IKKE UDTAGET.
                */
                else if (
                    role === "not-selected"
                ) {

                    actions = `

                        <button
                            type="button"
                            class="start11-squad-action select"
                            data-action="select"
                        >
                            UDTAG
                        </button>

                    `;

                }

                /*
                    STARTER / UDSKIFTER.
                */
                else {

                    actions = `

                        <span class="squad-role-pill ${start11Escape(role)}">
                            ${start11Escape(start11RoleLabel(role))}
                        </span>

                    `;

                }


                row.innerHTML = `

                    <span class="squad-overview-check">
                        ${player.selected || role !== "not-selected" ? "✓" : ""}
                    </span>

                    <span class="squad-overview-number">
                        ${start11Escape(player.number || "—")}
                    </span>

                    <span class="squad-overview-name">
                        ${start11Escape(player.name)}
                    </span>

                    <span class="squad-overview-position">
                        ${start11Escape(player.position)}
                    </span>

                    <div class="start11-squad-row-action-cell">
                        ${actions}
                    </div>

                `;


                row
                    .querySelector(
                        '[data-action="start"]'
                    )
                    ?.addEventListener(
                        "click",
                        event => {

                            event.stopPropagation();

                            start11PlaceSquadPlayerAsStarter(
                                player.id
                            );

                        }
                    );


                row
                    .querySelector(
                        '[data-action="bench"]'
                    )
                    ?.addEventListener(
                        "click",
                        event => {

                            event.stopPropagation();

                            start11PlaceSquadPlayerAsSubstitute(
                                player.id
                            );

                        }
                    );


                row
                    .querySelector(
                        '[data-action="remove"]'
                    )
                    ?.addEventListener(
                        "click",
                        event => {

                            event.stopPropagation();

                            start11SetSquadPlayerSelected(
                                player.id,
                                false
                            );

                        }
                    );


                row
                    .querySelector(
                        '[data-action="select"]'
                    )
                    ?.addEventListener(
                        "click",
                        event => {

                            event.stopPropagation();

                            start11SetSquadPlayerSelected(
                                player.id,
                                true
                            );

                        }
                    );


                row.addEventListener(
                    "click",
                    () => {

                        /*
                            Hvis denne visning viser en
                            ikke-udtaget spiller:
                            ét venstreklik = udtag.
                        */
                        if (
                            role === "not-selected"
                        ) {

                            start11SetSquadPlayerSelected(
                                player.id,
                                true
                            );

                            return;

                        }


                        /*
                            Spillere i KAMPTRUP:
                            venstreklik = spillerprofil.
                        */
                        start11OpenSquadPlayerModal(
                            player.id
                        );

                    }
                );


                list.appendChild(
                    row
                );

            }
        );

}


/* =========================================================
   GEM TRUP-SPILLER
   Samme modal som før, men ændringer synkroniseres nu også
   til den konkrete kamp, så navn/nummer/fokuspunkter/PDF følger.
========================================================= */

function start11SaveSquadPlayerFromModal() {

    const name =
        document.getElementById(
            "squadPlayerName"
        )?.value.trim() ||
        "";


    if (
        !name
    ) {

        visNotification(
            "Indtast spillerens navn."
        );

        return;

    }


    const data = {

        name,

        number:
            document.getElementById(
                "squadPlayerNumber"
            )?.value.trim() ||
            "",

        position:
            document.getElementById(
                "squadPlayerPosition"
            )?.value ||
            "CM",

        status:
            document.getElementById(
                "squadPlayerStatus"
            )?.value ||
            "available",

        strengths:
            document.getElementById(
                "squadPlayerStrengths"
            )?.value.trim() ||
            "",

        weaknesses:
            document.getElementById(
                "squadPlayerWeaknesses"
            )?.value.trim() ||
            "",

        focusWithBall:
            document.getElementById(
                "squadPlayerFocusWithBall"
            )?.value.trim() ||
            "",

        focusWithoutBall:
            document.getElementById(
                "squadPlayerFocusWithoutBall"
            )?.value.trim() ||
            "",

        video:
            document.getElementById(
                "squadPlayerVideo"
            )?.value.trim() ||
            ""

    };


    const selectedCheckbox =
        Boolean(
            document.getElementById(
                "squadPlayerSelected"
            )?.checked
        );


    let player =
        null;


    /*
        REDIGER EKSISTERENDE SPILLER.
    */
    if (
        start11EditingSquadPlayerId
    ) {

        player =
            start11FullSquad.find(
                item =>
                    item.id ===
                    start11EditingSquadPlayerId
            );


        if (
            player
        ) {

            Object.assign(
                player,
                data
            );


            /*
                Hvis spilleren allerede står på banen
                eller bænken, er hun altid udtaget.
                Ellers følger vi checkboxen.
            */
            const role =
                start11GetPlayerRole(
                    player
                );


            player.selected =
                (
                    role === "starting" ||
                    role === "substitute"
                )
                    ? true
                    : (
                        data.status === "available"
                            ? selectedCheckbox
                            : false
                    );


            /*
                Synkroniser til STARTOPSTILLING.
            */
            spillere.forEach(
                matchPlayer => {

                    if (
                        matchPlayer &&
                        start11SamePlayer(
                            player,
                            matchPlayer
                        )
                    ) {

                        start11CopySquadDataToMatchPlayer(
                            player,
                            matchPlayer
                        );

                    }

                }
            );


            /*
                Synkroniser til UDSKIFTERE.
            */
            udskiftere.forEach(
                matchPlayer => {

                    if (
                        matchPlayer &&
                        start11SamePlayer(
                            player,
                            matchPlayer
                        )
                    ) {

                        start11CopySquadDataToMatchPlayer(
                            player,
                            matchPlayer
                        );

                    }

                }
            );

        }

    }

    /*
        NY SPILLER.
        Nye spillere oprettes KUN her fra TRUP-modalens
        "+ TILFØJ NY SPILLER".
    */
    else {

        player = {

            id:
                start11MakeId(),

            ...data,

            selected:
                (
                    data.status === "available"
                )
                    ? selectedCheckbox
                    : false

        };


        start11FullSquad.push(
            player
        );

    }


    start11SaveFullSquad();


    /*
        Gem kampdata hvis en eksisterende placeret
        spiller er blevet redigeret.
    */
    gemAlt();

    tegnOpstilling();

    opdaterUdskiftere();


    start11CloseSquadPlayerModal();

    start11RenderSquadUI();


    visNotification(
        `${name} er gemt i truppen.`
    );

}


/* =========================================================
   START V3
========================================================= */

function start11InitCampaignFlowV3() {

    start11InstallContextMenuFlowV3();

    start11RenderSquadUI();

}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        () => {

            setTimeout(
                start11InitCampaignFlowV3,
                100
            );

        }
    );

} else {

    setTimeout(
        start11InitCampaignFlowV3,
        100
    );

}



/* =========================================================
   START11 V36 – NEW STARTOPSTILLING PAGE MOUNT
   Reuses the existing native lineup/squad DOM. No duplicate
   lineup state is created; drag/drop and existing handlers stay.
========================================================= */
(function(){
    if(window.__START11_V36_LINEUP__) return;
    window.__START11_V36_LINEUP__ = true;

    function v36ShowLineup(){
        const home=document.getElementById('s34HomeView');
        const lineup=document.getElementById('s34LineupView');
        if(home) home.hidden=true;
        if(lineup) lineup.hidden=false;
        v36MountNativeLineup();
        try{ if(typeof tegnOpstilling==='function') tegnOpstilling(); }catch(e){}
        try{ if(typeof opdaterUdskiftere==='function') opdaterUdskiftere(); }catch(e){}
        try{ if(typeof start11RenderSquadUI==='function') start11RenderSquadUI(); }catch(e){}
    }

    function v36ShowHome(){
        const home=document.getElementById('s34HomeView');
        const lineup=document.getElementById('s34LineupView');
        if(lineup) lineup.hidden=true;
        if(home) home.hidden=false;
    }

    function v36MountNativeLineup(){
        const centerHost=document.getElementById('s35NativeCenterHost');
        const squadHost=document.getElementById('s35NativeSquadHost');
        const center=document.getElementById('lineupSection');
        const squad=document.getElementById('squadSection');
        if(centerHost && center && center.parentElement!==centerHost) centerHost.appendChild(center);
        if(squadHost && squad && squad.parentElement!==squadHost) squadHost.appendChild(squad);
    }

    function v36Bind(){
        v36MountNativeLineup();
        ['s34OpenMatch'].forEach(id=>document.getElementById(id)?.addEventListener('click',v36ShowLineup));
        document.getElementById('s34BackMatches')?.addEventListener('click',v36ShowHome);
        document.querySelectorAll('[data-s34="matches"]').forEach(btn=>btn.addEventListener('click',v36ShowLineup));
        document.getElementById('s34SaveLineup')?.addEventListener('click',()=>{try{ if(typeof gemAlt==='function') gemAlt(); }catch(e){}});
        document.getElementById('s34ResetLineup')?.addEventListener('click',()=>{
            if(!confirm('Vil du nulstille startopstillingen for kampen?')) return;
            try{
                if(Array.isArray(spillere)) for(let i=0;i<spillere.length;i++) spillere[i]=null;
                if(Array.isArray(udskiftere)) udskiftere.length=0;
                if(typeof gemAlt==='function') gemAlt();
                if(typeof tegnOpstilling==='function') tegnOpstilling();
                if(typeof opdaterUdskiftere==='function') opdaterUdskiftere();
                if(typeof start11RenderSquadUI==='function') start11RenderSquadUI();
            }catch(e){ console.warn('START11 V36 reset:',e); }
        });
    }

    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(v36Bind,0));
    else setTimeout(v36Bind,0);
    window.start11V36ShowLineup=v36ShowLineup;
    window.start11V36MountNativeLineup=v36MountNativeLineup;
})();

/* =========================================================
   START11 V37 – LINEUP WORKSPACE FINISH
   Finishes the V36 shell without replacing the native lineup.
========================================================= */
(function(){
    if (window.__START11_V37_LINEUP__) return;
    window.__START11_V37_LINEUP__ = true;

    function v37Click(id){
        const el = document.getElementById(id);
        if (el) el.click();
    }

    function v37ShowHome(){
        const home = document.getElementById("s34HomeView");
        const lineup = document.getElementById("s34LineupView");
        if (lineup) lineup.hidden = true;
        if (home) home.hidden = false;
        window.scrollTo({top:0, behavior:"smooth"});
    }

    function v37Bind(){
        /* Whole home lineup preview is an entry point to the native lineup workspace. */
        const preview = document.querySelector("#s34HomeView .s34-lineup");
        if (preview && !preview.dataset.v37Bound){
            preview.dataset.v37Bound = "1";
            preview.setAttribute("role","button");
            preview.setAttribute("tabindex","0");
            preview.title = "Åbn startopstilling";
            preview.addEventListener("click", () => v37Click("s34OpenMatch"));
            preview.addEventListener("keydown", e => {
                if (e.key === "Enter" || e.key === " "){
                    e.preventDefault();
                    v37Click("s34OpenMatch");
                }
            });
        }

        /* Make the two secondary match tabs use the existing native sections. */
        const tactics = document.getElementById("s35OpenTactics");
        if (tactics && !tactics.dataset.v37Bound){
            tactics.dataset.v37Bound = "1";
            tactics.addEventListener("click", () => {
                const old = document.querySelector('[data-start11-target="tacticsSection"]');
                if (old) old.click();
                else document.getElementById("tacticsSection")?.scrollIntoView({behavior:"smooth"});
            });
        }

        const notes = document.getElementById("s35OpenNotes");
        if (notes && !notes.dataset.v37Bound){
            notes.dataset.v37Bound = "1";
            notes.addEventListener("click", () => {
                const target =
                    document.getElementById("playerDetails") ||
                    document.getElementById("matchNotesSection") ||
                    document.querySelector(".match-notes-card");
                target?.scrollIntoView({behavior:"smooth", block:"start"});
            });
        }

        /* Footer controls call the existing native controls/functions. */
        const share = document.getElementById("s34ShareLineup");
        if (share && !share.dataset.v37Bound){
            share.dataset.v37Bound = "1";
            share.addEventListener("click", () => {
                const nativeShare =
                    document.getElementById("shareLineupButton") ||
                    document.querySelector('[data-action="share-lineup"]');
                if (nativeShare) nativeShare.click();
                else if (typeof window.start11OpenBriefStudio === "function") window.start11OpenBriefStudio("match");
            });
        }

        /* Keep the back action deterministic even after native DOM has been moved. */
        const back = document.getElementById("s34BackMatches");
        if (back && !back.dataset.v37Extra){
            back.dataset.v37Extra = "1";
            back.addEventListener("click", v37ShowHome);
        }
    }

    if (document.readyState === "loading"){
        document.addEventListener("DOMContentLoaded", () => setTimeout(v37Bind, 250));
    } else {
        setTimeout(v37Bind, 250);
    }
    setTimeout(v37Bind, 1200);
})();

/* =========================================================
   START11 V39 – ONE MATCH UI ONLY
   The legacy dashboard is no longer a navigation destination.
   Its native lineup/squad nodes are still reused inside V36.
========================================================= */
(function(){
    if (window.__START11_V39_ONE_MATCH_UI__) return;
    window.__START11_V39_ONE_MATCH_UI__ = true;

    const $ = id => document.getElementById(id);
    const $$ = sel => Array.from(document.querySelectorAll(sel));

    function retireLegacyChrome(){
        document.body.classList.add("s34-active","s39-modern-only");

        const top = document.querySelector(".start11-global-topbar");
        const dash = document.querySelector(".start11-dashboard");

        [top,dash].forEach(el=>{
            if(!el) return;
            el.hidden = true;
            el.setAttribute("aria-hidden","true");
            el.style.setProperty("display","none","important");
        });

        const app = $("s34App");
        if(app){
            app.hidden = false;
            app.removeAttribute("aria-hidden");
            app.style.removeProperty("display");
        }
    }

    function showHome(){
        retireLegacyChrome();
        const home = $("s34HomeView");
        const lineup = $("s34LineupView");
        if(lineup) lineup.hidden = true;
        if(home) home.hidden = false;
        $$("[data-s34]").forEach(b=>{
            b.classList.toggle("active", b.dataset.s34 === "home");
        });
        window.scrollTo({top:0,behavior:"smooth"});
    }

    function showLineup(){
        retireLegacyChrome();

        if(typeof window.start11V36MountNativeLineup === "function"){
            window.start11V36MountNativeLineup();
        }

        const home = $("s34HomeView");
        const lineup = $("s34LineupView");
        if(home) home.hidden = true;
        if(lineup) lineup.hidden = false;

        try{ if(typeof tegnOpstilling === "function") tegnOpstilling(); }catch(e){}
        try{ if(typeof opdaterUdskiftere === "function") opdaterUdskiftere(); }catch(e){}
        try{ if(typeof start11RenderSquadUI === "function") start11RenderSquadUI(); }catch(e){}

        $$("[data-s34]").forEach(b=>{
            b.classList.toggle("active", b.dataset.s34 === "matches");
        });
        window.scrollTo({top:0,behavior:"smooth"});
    }

    function routeModern(section){
        if(section === "home") return showHome();
        if(section === "matches" || section === "lineup") return showLineup();

        const target = document.querySelector(`[data-s34="${section}"]`);
        if(target) target.click();
    }

    function captureOldNavigation(e){
        const oldNav = e.target.closest?.(".start11-nav-item");
        if(!oldNav) return;

        e.preventDefault();
        e.stopImmediatePropagation();

        const target = oldNav.dataset.start11Target || "";
        if(target === "lineupSection" || target === "matchesSection") return showLineup();
        if(target === "squadSection") return routeModern("players");
        if(target === "tacticsSection"){
            showLineup();
            setTimeout(()=>$("s35OpenTactics")?.click(),0);
            return;
        }
        showHome();
    }

    function bind(){
        retireLegacyChrome();

        /* Old dashboard navigation is intercepted before its original handlers run. */
        document.addEventListener("click",captureOldNavigation,true);

        /* New sidebar: KAMPE always means the single modern match workspace. */
        $$('[data-s34="matches"]').forEach(btn=>{
            if(btn.dataset.v39Bound) return;
            btn.dataset.v39Bound = "1";
            btn.addEventListener("click",e=>{
                e.preventDefault();
                e.stopImmediatePropagation();
                showLineup();
            },true);
        });

        /* All known "open match/startopstilling" entries go to the same workspace. */
        ["s34OpenMatch","openCurrentMatchButton"].forEach(id=>{
            const btn=$(id);
            if(!btn || btn.dataset.v39Bound) return;
            btn.dataset.v39Bound="1";
            btn.addEventListener("click",e=>{
                e.preventDefault();
                e.stopImmediatePropagation();
                showLineup();
            },true);
        });

        const back=$("s34BackMatches");
        if(back && !back.dataset.v39Bound){
            back.dataset.v39Bound="1";
            back.addEventListener("click",e=>{
                e.preventDefault();
                e.stopImmediatePropagation();
                showHome();
            },true);
        }

        /* No observer: avoid the V38 self-triggering mutation loop/freezes. */
        setTimeout(retireLegacyChrome,100);
        setTimeout(retireLegacyChrome,1000);
    }

    if(document.readyState === "loading"){
        document.addEventListener("DOMContentLoaded",bind,{once:true});
    }else{
        bind();
    }

    window.start11ShowHome = showHome;
    window.start11ShowLineup = showLineup;
})();

/* =========================================================
   START11 V41 – REAL MODERN ROUTES
   No legacy dashboard navigation. Reuse native functionality
   inside the modern shell.
========================================================= */
(function(){
    if(window.__START11_V41_ROUTES__) return;
    window.__START11_V41_ROUTES__=true;

    const $=id=>document.getElementById(id);
    const $$=s=>Array.from(document.querySelectorAll(s));

    function allModernViews(){
        return ["s34HomeView","s34LineupView","s34PlayersView"]
            .map($).filter(Boolean);
    }

    function showOnly(id){
        document.body.classList.add("s34-active","s39-modern-only");
        allModernViews().forEach(v=>v.hidden=(v.id!==id));
        const app=$("s34App");
        if(app) app.hidden=false;
        window.scrollTo({top:0,behavior:"smooth"});
    }

    function activeNav(name){
        $$("[data-s34]").forEach(b=>b.classList.toggle("active",b.dataset.s34===name));
    }

    function showHome(){
        showOnly("s34HomeView");
        activeNav("home");
    }

    function showPlayers(){
        const host=$("s41PlayersHost");
        const squad=$("squadSection");
        if(host && squad && squad.parentElement!==host) host.appendChild(squad);
        showOnly("s34PlayersView");
        activeNav("players");
        try{ if(typeof start11RenderSquadUI==="function") start11RenderSquadUI(); }catch(e){}
    }

    function showLineup(){
        if(typeof window.start11ShowLineup==="function" &&
           window.start11ShowLineup!==showLineup){
            window.start11ShowLineup();
        }else{
            showOnly("s34LineupView");
        }
        activeNav("matches");
    }

    function openTactics(){
        /* Existing tactics editor/modal – never reveal the old dashboard. */
        const edit=$("editTacticsBottom");
        if(edit){ edit.click(); return; }
        const plan=$("editMatchPlanButton") || $("editMatchPlanShortcut");
        if(plan) plan.click();
    }

    function openCalendar(){
        /* Calendar already has its own shell/modal. Open it directly. */
        if(typeof window.start11CalendarSetOpen==="function"){
            window.start11CalendarSetOpen(true);
            return;
        }
        /* Modules initialise slightly later on some loads. */
        setTimeout(()=>{
            if(typeof window.start11CalendarSetOpen==="function"){
                window.start11CalendarSetOpen(true);
            }
        },500);
    }

    function matchPdf(){
        if(typeof window.genererPDF==="function"){
            window.genererPDF();
            return;
        }
        $("dashboardPdfButton")?.click();
    }

    function syncTeamSelector(){
        const source=$("teamSelector");
        const modern=$("s41TeamSelector");
        if(!source || !modern) return;

        modern.innerHTML="";
        Array.from(source.options).forEach(opt=>{
            const copy=document.createElement("option");
            copy.value=opt.value;
            copy.textContent=opt.textContent;
            copy.disabled=opt.disabled;
            modern.appendChild(copy);
        });
        modern.value=source.value;

        if(!modern.dataset.v41Bound){
            modern.dataset.v41Bound="1";
            modern.addEventListener("change",()=>{
                source.value=modern.value;
                source.dispatchEvent(new Event("change",{bubbles:true}));
                setTimeout(syncTeamSelector,80);
            });
        }
    }

    function mountRealAccountMenu(){
        const host=$("s41AccountHost");
        const menu=$("accountMenu");
        if(host && menu && menu.parentElement!==host){
            host.appendChild(menu);
            menu.style.display="";
        }
    }

    function capture(el,fn){
        if(!el || el.dataset.v41Bound) return;
        el.dataset.v41Bound="1";
        el.addEventListener("click",e=>{
            e.preventDefault();
            e.stopImmediatePropagation();
            fn();
        },true);
    }

    function bind(){
        mountRealAccountMenu();
        syncTeamSelector();

        $$('[data-s34="players"]').forEach(x=>capture(x,showPlayers));
        capture($("s34OpenSquad"),showPlayers);
        capture($("s41PlayersBack"),showHome);

        capture($("s34OpenCalendar"),openCalendar);
        capture($("s35OpenTactics"),openTactics);

        $$('[data-s34="share"]').forEach(x=>capture(x,matchPdf));
        capture($("s34ShareLineup"),matchPdf);

        $$('[data-s34="settings"]').forEach(x=>capture(x,()=>{
            mountRealAccountMenu();
            $("accountMenuButton")?.click();
        }));

        /* Sidebar team button focuses the exact same team selector as the topbar. */
        capture($("s34TeamSwitch"),()=>{
            const s=$("s41TeamSelector");
            if(!s) return;
            s.focus();
            try{s.showPicker?.();}catch(e){s.click();}
        });

        const share=$("s34ShareLineup");
        if(share) share.textContent="▣ Generer kamp-PDF";
        $$('[data-s34="share"]').forEach(x=>{
            const span=x.querySelector("span");
            if(span) span.textContent="Kamp-PDF";
        });

        /* Keep the modern selector updated when cloud/team data arrives. */
        setTimeout(syncTeamSelector,300);
        setTimeout(syncTeamSelector,1200);
        setTimeout(mountRealAccountMenu,300);
    }

    if(document.readyState==="loading"){
        document.addEventListener("DOMContentLoaded",()=>setTimeout(bind,80),{once:true});
    }else{
        setTimeout(bind,80);
    }
})();

/* =========================================================
   START11 V42 – MATCH SQUAD CONTROLS IN MODERN LINEUP
   The modern lineup's right panel must use KAMPTRUP/TRUP/
   IKKE UDTAGET, not the passive full-squad card.
========================================================= */
(function(){
    if(window.__START11_V42_MATCH_SQUAD__) return;
    window.__START11_V42_MATCH_SQUAD__ = true;

    const $ = id => document.getElementById(id);

    function findMatchSquadCard(){
        const list = $("matchSquadOverview");
        if(!list) return null;

        /* Find the smallest ancestor that also owns the three squad tabs. */
        let node = list.parentElement;
        while(node && node !== document.body){
            if(node.querySelector?.(".squad-view-tab")) return node;
            node = node.parentElement;
        }

        return list.parentElement;
    }

    function mountCorrectSquadPanels(){
        const lineupHost = $("s35NativeSquadHost");
        const playersHost = $("s41PlayersHost");
        const squadSection = $("squadSection");
        const matchCard = findMatchSquadCard();

        /*
          V36 used to move the complete squadSection into the lineup.
          Put that section on the dedicated Players page instead.
        */
        if(playersHost && squadSection && squadSection.parentElement !== playersHost){
            playersHost.appendChild(squadSection);
        }

        /*
          Only the interactive match-squad card belongs beside the pitch.
          It contains KAMPTRUP / TRUP / IKKE UDTAGET and therefore uses
          the existing START / BÆNK / × / UDTAG renderer.
        */
        if(lineupHost && matchCard && matchCard.parentElement !== lineupHost){
            lineupHost.appendChild(matchCard);
        }

        if(matchCard){
            matchCard.hidden = false;
            matchCard.style.display = "";
            matchCard.style.visibility = "visible";
            matchCard.style.pointerEvents = "auto";
        }

        try{
            if(typeof start11RenderMatchSquad === "function"){
                start11RenderMatchSquad();
            }
        }catch(e){
            console.warn("START11 V42 match squad render:", e);
        }
    }

    function bind(){
        mountCorrectSquadPanels();

        /* V36 can remount squadSection when a match is opened.
           Correct the mount immediately afterwards. */
        document.querySelectorAll('[data-s34="matches"], #s34OpenMatch')
            .forEach(btn=>{
                if(btn.dataset.v42Bound) return;
                btn.dataset.v42Bound = "1";
                btn.addEventListener("click",()=>{
                    setTimeout(mountCorrectSquadPanels, 0);
                    setTimeout(mountCorrectSquadPanels, 80);
                });
            });

        /* Opening the Players page should keep the full squad there. */
        document.querySelectorAll('[data-s34="players"], #s34OpenSquad')
            .forEach(btn=>{
                if(btn.dataset.v42SquadBound) return;
                btn.dataset.v42SquadBound = "1";
                btn.addEventListener("click",()=>setTimeout(mountCorrectSquadPanels,0));
            });

        /* If an older mount moves squadSection again, repair it. */
        const host = $("s35NativeSquadHost");
        if(host && !host.dataset.v42Observed){
            host.dataset.v42Observed = "1";
            new MutationObserver(()=>setTimeout(mountCorrectSquadPanels,0))
                .observe(host,{childList:true});
        }
    }

    if(document.readyState === "loading"){
        document.addEventListener("DOMContentLoaded",()=>setTimeout(bind,120),{once:true});
    }else{
        setTimeout(bind,120);
    }

    setTimeout(mountCorrectSquadPanels,700);
})();


/* =========================================================
   START11 V43 – DBU LEAGUE CACHE FOR MODERN HOME
   Henter ligadata fra den eksisterende DBU Edge Function uden
   at ændre den nuværende DBU-sync eller kamptrup.
========================================================= */
(function(){
    if(window.__START11_V43_LEAGUE_CACHE__) return;
    window.__START11_V43_LEAGUE_CACHE__ = true;

    const LEAGUE_KEY = "start11DbuLeague";

    async function v43FetchLeague(){
        const dbuUrl =
            document.getElementById("dbuTeamUrlInput")?.value?.trim() ||
            localStorage.getItem(
                typeof START11_DBU_URL_KEY !== "undefined"
                    ? START11_DBU_URL_KEY
                    : "start11DbuTeamUrl"
            ) ||
            "";

        if(!dbuUrl) return;

        try{
            if(typeof ensureSession === "function"){
                const ok = await ensureSession();
                if(!ok) return;
            }

            if(
                typeof SUPABASE_URL === "undefined" ||
                typeof SUPABASE_KEY === "undefined"
            ) return;

            const response = await fetch(
                `${SUPABASE_URL}/functions/v1/dbu-matches`,
                {
                    method:"POST",
                    headers:{
                        apikey:SUPABASE_KEY,
                        Authorization:`Bearer ${session?.access_token || ""}`,
                        "Content-Type":"application/json"
                    },
                    body:JSON.stringify({url:dbuUrl})
                }
            );

            if(!response.ok) return;

            const data = await response.json();
            if(!data?.success || !data?.league) return;

            localStorage.setItem(
                LEAGUE_KEY,
                JSON.stringify(data.league)
            );

            if(
                typeof activeTeamId !== "undefined" &&
                activeTeamId &&
                typeof start11WriteTeamScopedValue === "function"
            ){
                start11WriteTeamScopedValue(
                    LEAGUE_KEY,
                    JSON.stringify(data.league),
                    activeTeamId
                );
            }

            window.dispatchEvent(
                new CustomEvent("start11:league-updated")
            );
        }catch(error){
            console.warn("START11 V43 league:", error);
        }
    }

    function bind(){
        const sync = document.getElementById("syncDbuMatchesButton");
        if(sync && sync.dataset.v43LeagueBound !== "1"){
            sync.dataset.v43LeagueBound = "1";
            sync.addEventListener(
                "click",
                () => setTimeout(v43FetchLeague, 250)
            );
        }

        const myTeams = document.getElementById("myTeamsMenuButton");
        if(myTeams && myTeams.dataset.v43LeagueBound !== "1"){
            myTeams.dataset.v43LeagueBound = "1";
            myTeams.addEventListener(
                "click",
                () => setTimeout(v43FetchLeague, 300)
            );
        }

        setTimeout(v43FetchLeague, 900);
    }

    if(document.readyState === "loading"){
        document.addEventListener("DOMContentLoaded", bind, {once:true});
    }else{
        bind();
    }
})();
