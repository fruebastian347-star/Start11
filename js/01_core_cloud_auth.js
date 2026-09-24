/* =========================================================
   START11 – V6 DBU DATA FIX
   Denne version bevarer V5-dashboarddesignet, men fjerner
   den gamle hårdkodede Fortuna/Oure-rettelse.

   DBU Edge Function V4 skal bruges sammen med denne fil.
========================================================= */

/* =========================================================
   START11 – CLOUD VERSION
   Bevarer den eksisterende funktionalitet og tilføjer:
   - Login med Supabase Auth
   - Flere private hold pr. bruger
   - Cloud-sync på tværs af enheder
   - Eksisterende localStorage bruges som lokal cache/offline fallback
========================================================= */

/* ---------------- SUPABASE KONFIGURATION ---------------- */
const SUPABASE_URL = "https://tupevekyghledskkuwyz.supabase.co";
const SUPABASE_KEY = "sb_publishable_GxUOb84Z5EFogSbgylbGig_xyT7bFEj";
const CLOUD_TABLE = "start11_teams";
const SESSION_KEY = "start11SupabaseSession";
const ACTIVE_TEAM_KEY = "start11ActiveTeamId";

const cloudConfigured =
    !SUPABASE_URL.includes("INDSAET_") &&
    !SUPABASE_KEY.includes("INDSAET_");

let session = null;
let cloudTeams = [];
let activeTeamId = null;
let cloudReady = false;
let cloudSaveTimer = null;
let cloudSaveInProgress = false;
let cloudSaveQueued = false;



/* =========================================================
   ELEMENTER
========================================================= */

const pitch = document.getElementById("pitch");
const formationSelector = document.getElementById("formationSelector");
const rosterList = document.getElementById("rosterList");
const substituteList = document.getElementById("substituteList");

const playerModal = document.getElementById("playerModal");
const playerForm = document.getElementById("playerForm");

const matchplanModal = document.getElementById("matchplanModal");

const playerDetails = document.getElementById("playerDetails");

const notification = document.getElementById("notification");

const pdfDocument = document.getElementById("pdfDocument");


let currentSlot = null;
let currentPlayerSource = "starting";
let currentSubstituteIndex = null;

let draggedPlayer = null;
let playerWasDragged = false;


/* =========================================================
   STANDARD KAMPPLAN
========================================================= */

const defaultKampplan = () => ({
    homeTeam: "FC THY",
    awayTeam: "",
    matchDate: "",
    matchTime: "",
    matchPlace: "",

    practicalInfo: "",
    matchProgram: "",

    teamWithBall: "",
    teamWithoutBall: "",

    coachMessage: "",

    homeLogo: "",
    awayLogo: "",
    backgroundImage: ""
});


/* =========================================================
   LOKALE DATA
========================================================= */

let spillere =
    JSON.parse(
        localStorage.getItem(
            "startopstillingSpillere"
        )
    ) ||
    Array(11).fill(null);


let udskiftere =
    JSON.parse(
        localStorage.getItem(
            "startopstillingUdskiftere"
        )
    ) ||
    [];


let kampplan = {
    ...defaultKampplan(),

    ...(
        JSON.parse(
            localStorage.getItem(
                "kampplan"
            )
        ) || {}
    )
};


let currentFormation =
    localStorage.getItem(
        "start11Formation"
    ) ||
    "4-4-2";


/* =========================================================
   FORMATIONER
========================================================= */

const formationer = {

    "4-4-2": [
        ["GK", 50, 85],

        ["LB", 22, 60],
        ["CB", 38, 62],
        ["CB", 62, 62],
        ["RB", 78, 60],

        ["LM", 18, 38],
        ["CM", 38, 42],
        ["CM", 62, 42],
        ["RM", 82, 38],

        ["ST", 38, 18],
        ["ST", 62, 18]
    ],


    "4-3-3": [
        ["GK", 50, 85],

        ["LB", 22, 60],
        ["CB", 38, 62],
        ["CB", 62, 62],
        ["RB", 78, 60],

        ["CM", 32, 42],
        ["DM", 50, 48],
        ["CM", 68, 42],

        ["LW", 22, 18],
        ["ST", 50, 15],
        ["RW", 78, 18]
    ],


    "4-2-3-1": [
        ["GK", 50, 85],

        ["LB", 22, 60],
        ["CB", 38, 62],
        ["CB", 62, 62],
        ["RB", 78, 60],

        ["DM", 38, 48],
        ["DM", 62, 48],

        ["LW", 22, 32],
        ["AM", 50, 35],
        ["RW", 78, 32],

        ["ST", 50, 15]
    ],


    "4-4-2-diamond": [
        ["GK", 50, 85],

        ["LB", 22, 60],
        ["CB", 38, 60],
        ["CB", 62, 60],
        ["RB", 78, 60],

        ["LM", 25, 42],
        ["DM", 50, 52],
        ["RM", 75, 42],

        ["AM", 50, 30],

        ["ST", 38, 15],
        ["ST", 62, 15]
    ],


    "3-5-2": [
        ["GK", 50, 85],

        ["CB", 30, 62],
        ["CB", 50, 62],
        ["CB", 70, 62],

        ["LM", 12, 42],
        ["CM", 33, 45],
        ["DM", 50, 50],
        ["CM", 67, 45],
        ["RM", 88, 42],

        ["ST", 38, 15],
        ["ST", 62, 15]
    ],


    "5-3-2": [
        ["GK", 50, 85],

        ["LB", 10, 60],
        ["CB", 30, 62],
        ["CB", 50, 62],
        ["CB", 70, 62],
        ["RB", 90, 60],

        ["CM", 33, 42],
        ["DM", 50, 48],
        ["CM", 67, 42],

        ["ST", 38, 15],
        ["ST", 62, 15]
    ],


    "3-4-3": [
        ["GK", 50, 85],

        ["CB", 30, 62],
        ["CB", 50, 62],
        ["CB", 70, 62],

        ["LM", 22, 42],
        ["CM", 40, 45],
        ["CM", 60, 45],
        ["RM", 78, 42],

        ["LW", 25, 18],
        ["ST", 50, 15],
        ["RW", 75, 18]
    ],


    "4-1-4-1": [
        ["GK", 50, 85],

        ["LB", 18, 60],
        ["CB", 38, 62],
        ["CB", 62, 62],
        ["RB", 82, 60],

        ["DM", 50, 50],

        ["LM", 18, 35],
        ["CM", 38, 38],
        ["CM", 62, 38],
        ["RM", 82, 35],

        ["ST", 50, 15]
    ]
};


const positionsNavne = {

    GK: "Målmand",

    RB: "Højre back",

    CB: "Centerback",

    LB: "Venstre back",

    DM: "6'er",

    CM: "8'er",

    AM: "10'er",

    RM: "Højre midtbane",

    LM: "Venstre midtbane",

    RW: "Højre kant",

    LW: "Venstre kant",

    ST: "Angriber"

};


/* =========================================================
   SUPABASE / CLOUD
========================================================= */

function getSession() {

    try {

        return JSON.parse(
            localStorage.getItem(
                SESSION_KEY
            )
        ) || null;

    } catch (error) {

        return null;

    }

}


function setSession(value) {

    session = value;


    if (value) {

        localStorage.setItem(
            SESSION_KEY,
            JSON.stringify(value)
        );

    } else {

        localStorage.removeItem(
            SESSION_KEY
        );

    }

}


/* =========================================================
   HEADERS TIL SUPABASE
========================================================= */

function authHeaders(
    token = session?.access_token
) {

    const headers = {

        apikey:
            SUPABASE_KEY,

        "Content-Type":
            "application/json"

    };


    if (token) {

        headers.Authorization =
            `Bearer ${token}`;

    }


    return headers;

}


/* =========================================================
   SUPABASE REQUEST
========================================================= */

async function supabaseRequest(
    path,
    options = {}
) {

    if (!cloudConfigured) {

        throw new Error(
            "Supabase er ikke konfigureret endnu."
        );

    }


    const response =
        await fetch(
            `${SUPABASE_URL}${path}`,
            {

                ...options,

                headers: {

                    ...authHeaders(),

                    ...(options.headers || {})

                }

            }
        );


    const text =
        await response.text();


    let data = null;


    try {

        data =
            text
                ? JSON.parse(text)
                : null;

    } catch (error) {

        data = text;

    }


    if (!response.ok) {

        const message =

            data?.msg ||

            data?.message ||

            data?.error_description ||

            data?.error ||

            `HTTP ${response.status}`;


        throw new Error(
            message
        );

    }


    return data;

}


/* =========================================================
   REFRESH LOGIN
========================================================= */

async function refreshSession() {

    if (
        !session?.refresh_token
    ) {

        return false;

    }


    const oldSession =
        session;


    try {

        const response =
            await fetch(
                `${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
                {

                    method:
                        "POST",

                    headers: {

                        apikey:
                            SUPABASE_KEY,

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            refresh_token:
                                oldSession.refresh_token

                        })

                }
            );


        const text =
            await response.text();


        let data =
            null;


        try {

            data =
                text
                    ? JSON.parse(text)
                    : null;

        } catch (error) {

            data =
                null;

        }


        if (
            !response.ok ||
            !data?.access_token
        ) {

            throw new Error(
                data?.message ||
                data?.error_description ||
                data?.error ||
                `HTTP ${response.status}`
            );

        }


        const refreshedSession = {

            ...oldSession,
            ...data,

            refresh_token:
                data.refresh_token ||
                oldSession.refresh_token,

            user:
                data.user ||
                oldSession.user

        };


        setSession(
            refreshedSession
        );


        return true;

    } catch (error) {

        console.error(
            "Kunne ikke refreshe login:",
            error
        );


        session =
            oldSession;


        return Boolean(
            oldSession?.access_token
        );

    }

}



/* =========================================================
   TJEK LOGIN
========================================================= */

async function ensureSession() {

    if (
        !cloudConfigured
    ) {

        return false;

    }


    session =
        getSession();


    if (
        !session
    ) {

        return false;

    }


    if (
        session.expires_at &&
        Date.now() / 1000 >
            session.expires_at - 60
    ) {

        return await refreshSession();

    }


    return true;

}


/* =========================================================
   LOGIN MODAL
========================================================= */

function showLogin() {

    document
        .getElementById(
            "cloudLoginModal"
        )
        ?.style
        .setProperty(
            "display",
            "flex"
        );

}


function hideLogin() {

    document
        .getElementById(
            "cloudLoginModal"
        )
        ?.style
        .setProperty(
            "display",
            "none"
        );

}


/* =========================================================
   ACCOUNT UI
========================================================= */

function updateAccountUI() {

    const loggedIn =
        Boolean(session);


    const user =
        session?.user ||
        null;


    const emailAddress =
        user?.email ||
        "";


    /*
        Først bruger vi et rigtigt navn fra Supabase,
        hvis kontoen senere får gemt et navn.

        Ellers laver vi et pænt navn ud fra emailen.
    */

    let displayName =
        user?.user_metadata?.full_name ||
        user?.user_metadata?.name ||
        "";


    if (
        !displayName &&
        emailAddress
    ) {

        const emailName =
            emailAddress
                .split("@")[0]
                .replace(
                    /[._-]+/g,
                    " "
                )
                .trim();


        displayName =
            emailName
                .split(" ")
                .filter(Boolean)
                .map(
                    word =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1)
                )
                .join(" ");

    }


    if (!displayName) {

        displayName =
            "Bruger";

    }


    /*
        Initialer.
        Fx:
        Christopher Bækhøj -> CB
    */

    const nameParts =
        displayName
            .split(/\s+/)
            .filter(Boolean);


    let initials =
        nameParts
            .slice(
                0,
                2
            )
            .map(
                part =>
                    part.charAt(0).toUpperCase()
            )
            .join("");


    if (!initials) {

        initials =
            "U";

    }


    const email =
        document.getElementById(
            "accountEmail"
        );


    const displayNameElement =
        document.getElementById(
            "accountDisplayName"
        );


    const dropdownName =
        document.getElementById(
            "accountDropdownName"
        );


    const avatar =
        document.getElementById(
            "accountAvatar"
        );


    const dropdownAvatar =
        document.getElementById(
            "accountDropdownAvatar"
        );


    const login =
        document.getElementById(
            "loginButton"
        );


    const logout =
        document.getElementById(
            "logoutButton"
        );


    const team =
        document.getElementById(
            "teamControls"
        );


const accountMenu =
    document.getElementById(
        "accountMenu"
    );


const accountMenuButton =
    document.getElementById(
        "accountMenuButton"
    );


const accountDropdown =
    document.getElementById(
        "accountDropdown"
    );


if (
    accountMenu &&
    accountMenuButton
) {

    accountMenuButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();


            const open =
                accountMenu.classList.toggle(
                    "open"
                );


            accountMenuButton.setAttribute(
                "aria-expanded",
                String(open)
            );

        }
    );


    document.addEventListener(
        "click",
        event => {

            if (
                !accountMenu.contains(
                    event.target
                )
            ) {

                accountMenu.classList.remove(
                    "open"
                );


                accountMenuButton.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }

        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                accountMenu.classList.remove(
                    "open"
                );


                accountMenuButton.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }

        }
    );

}


    const status =
        document.getElementById(
            "cloudStatus"
        );


    if (email) {

        email.textContent =
            loggedIn
                ? emailAddress
                : "Ikke logget ind";

    }


    if (displayNameElement) {

        displayNameElement.textContent =
            displayName;

    }


    if (dropdownName) {

        dropdownName.textContent =
            displayName;

    }


    if (avatar) {

        avatar.textContent =
            initials;

    }


    if (dropdownAvatar) {

        dropdownAvatar.textContent =
            initials;

    }


    /* V51: Modern home greeting uses the authenticated account name. */
    const modernCoachName =
        document.getElementById(
            "s34CoachName"
        );

    if (modernCoachName) {

        modernCoachName.textContent =
            displayName;

    }


    /* V51: Use the active DBU club logo as the top-right profile image.
       The existing V9 DBU sync stores that logo in the active team theme. */
    if (avatar) {

        let dbuLogo = "";

        try {

            if (
                typeof start11V9SyncLogoFromDbu ===
                "function"
            ) {

                dbuLogo =
                    start11V9SyncLogoFromDbu(
                        false
                    ) || "";

            }

            if (
                !dbuLogo &&
                typeof start11V9GetActiveTheme ===
                    "function"
            ) {

                dbuLogo =
                    start11V9GetActiveTheme()?.logo ||
                    "";

            }

        } catch (error) {

            dbuLogo = "";

        }


        if (dbuLogo) {

            avatar.textContent = "";
            avatar.classList.add(
                "s51-dbu-avatar"
            );

            const dbuImage =
                document.createElement(
                    "img"
                );

            dbuImage.src =
                dbuLogo;

            dbuImage.alt =
                "";

            dbuImage.addEventListener(
                "error",
                () => {

                    avatar.classList.remove(
                        "s51-dbu-avatar"
                    );

                    avatar.textContent =
                        initials;

                },
                {
                    once: true
                }
            );

            avatar.appendChild(
                dbuImage
            );

        } else {

            avatar.classList.remove(
                "s51-dbu-avatar"
            );

            avatar.textContent =
                initials;

        }

    }


    if (login) {

        login.style.display =
            loggedIn
                ? "none"
                : "inline-flex";

    }


    if (logout) {

        /*
            Logout ligger nu inde i dropdownen.
            Den skal derfor være flex når brugeren
            er logget ind.
        */

        logout.style.display =
            loggedIn
                ? "flex"
                : "none";

    }


    if (team) {

        team.style.display =
            loggedIn
                ? "flex"
                : "none";

    }


    if (accountMenu) {

        accountMenu.style.display =
            loggedIn
                ? "block"
                : "none";

    }


    if (status) {

        status.textContent =
            loggedIn
                ? "☁ Synkroniseret"
                : "Lokal tilstand";

    }

}


/* =========================================================
   LOGIN / OPRET KONTO
========================================================= */

async function loginOrSignup(
    mode
) {

    if (
        !cloudConfigured
    ) {

        visNotification(
            "Indsæt først Supabase URL og publishable key i start11.js"
        );

        return;

    }


    const email =
        document
            .getElementById(
                "loginEmail"
            )
            .value
            .trim();


    const password =
        document
            .getElementById(
                "loginPassword"
            )
            .value;


    if (
        !email ||
        !password
    ) {

        visNotification(
            "Indtast email og adgangskode."
        );

        return;

    }


    try {

        const endpoint =
            mode === "signup"
                ? "/auth/v1/signup"
                : "/auth/v1/token?grant_type=password";


        const data =
            await supabaseRequest(
                endpoint,
                {

                    method:
                        "POST",

                    body:
                        JSON.stringify({

                            email,
                            password

                        })

                }
            );


        if (
            mode === "signup" &&
            !data?.access_token
        ) {

            visNotification(
                "Konto oprettet. Tjek din email hvis bekræftelse er slået til."
            );

            return;

        }


        setSession(
            data
        );


        hideLogin();


        await loadCloudTeams();


        updateAccountUI();


        visNotification(
            "Logget ind og synkroniseret."
        );

    } catch (error) {

        visNotification(
            "Login fejlede: " +
            error.message
        );

    }

}


/* =========================================================
   LOG UD
========================================================= */

async function logout() {

    try {

        if (session) {

            await supabaseRequest(
                "/auth/v1/logout",
                {
                    method:
                        "POST"
                }
            );

        }

    } catch (error) {

        // Logout fortsætter lokalt
        // selv hvis request fejler.

    }


    setSession(null);

    cloudTeams = [];

    activeTeamId = null;

    cloudReady = false;


    updateTeamSelector();

    updateAccountUI();


    visNotification(
        "Du er logget ud. Data bliver på denne enhed."
    );

}


/* =========================================================
   SAMLE HOLDETS DATA
========================================================= */

function collectTeamData() {

    return {

        spillere,

        udskiftere,

        kampplan,

        formation:
            formationSelector.value

    };

}


/* =========================================================
   INDLÆS HOLDDATA
========================================================= */

function applyTeamData(
    data
) {

    const d =
        data || {};


    spillere =
        Array.isArray(
            d.spillere
        )
            ? d.spillere
            : Array(11).fill(null);


    udskiftere =
        Array.isArray(
            d.udskiftere
        )
            ? d.udskiftere
            : [];


    kampplan = {

        ...defaultKampplan(),

        ...(d.kampplan || {})

    };


    currentFormation =
        d.formation ||
        "4-4-2";


    formationSelector.value =
        currentFormation;


    localStorage.setItem(
        "start11Formation",
        currentFormation
    );


    localStorage.setItem(
        "startopstillingSpillere",
        JSON.stringify(
            spillere
        )
    );


    localStorage.setItem(
        "startopstillingUdskiftere",
        JSON.stringify(
            udskiftere
        )
    );


    localStorage.setItem(
        "kampplan",
        JSON.stringify(
            kampplan
        )
    );


    opdaterKampTitel();

    tegnOpstilling();

    opdaterUdskiftere();


    opdaterBilledePreview(
        "homeLogo",
        kampplan.homeLogo
    );


    opdaterBilledePreview(
        "awayLogo",
        kampplan.awayLogo
    );


    opdaterBilledePreview(
        "background",
        kampplan.backgroundImage
    );

}


/* =========================================================
   HENT HOLD FRA CLOUD
========================================================= */

async function loadCloudTeams() {

    if (
        !(await ensureSession())
    ) {

        updateAccountUI();

        return;

    }


    try {

        cloudTeams =
            await supabaseRequest(
                `/rest/v1/${CLOUD_TABLE}?select=id,name,data,updated_at&order=created_at.asc`
            );


        if (
            !Array.isArray(
                cloudTeams
            )
        ) {

            cloudTeams = [];

        }


        /*
            Hvis kontoen ikke har et hold endnu,
            opretter vi det første hold med de
            eksisterende lokale data.
        */

        if (
            !cloudTeams.length
        ) {

            const created =
                await createCloudTeam(
                    "Mit første hold",
                    false
                );


            cloudTeams = [
                created
            ];

        }


        const savedId =
            localStorage.getItem(
                ACTIVE_TEAM_KEY
            );


        const selected =
            cloudTeams.find(
                team =>
                    team.id === savedId
            ) ||
            cloudTeams[0];


        activeTeamId =
            selected.id;


        localStorage.setItem(
            ACTIVE_TEAM_KEY,
            activeTeamId
        );


        updateTeamSelector();


        applyTeamData(
            selected.data
        );


        cloudReady =
            true;

    } catch (error) {

        cloudReady =
            false;


        visNotification(
            "Kunne ikke hente cloud-data: " +
            error.message
        );

    }

}


/* =========================================================
   OPRET CLOUD HOLD
========================================================= */

async function createCloudTeam(
    name,
    notify = true
) {

    const id =
        crypto.randomUUID();


    const row = {

        id,

        user_id:
            session.user.id,

        name,

        data:
            collectTeamData()

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
        team.id
    );


    updateTeamSelector();


    if (notify) {

        visNotification(
            `${name} oprettet.`
        );

    }


    return team;

}


/* =========================================================
   GEM CLOUD NU
========================================================= */

async function saveCloudNow() {

    if (
        !cloudReady ||
        !session ||
        !activeTeamId
    ) {

        return;

    }


    if (
        cloudSaveInProgress
    ) {

        cloudSaveQueued =
            true;

        return;

    }


    cloudSaveInProgress =
        true;


    try {

        const currentTeam =
            cloudTeams.find(
                team =>
                    team.id === activeTeamId
            );


        const body = {

            name:
                currentTeam?.name ||
                "Mit hold",

            data:
                collectTeamData(),

            updated_at:
                new Date().toISOString()

        };


        await supabaseRequest(
            `/rest/v1/${CLOUD_TABLE}?id=eq.${encodeURIComponent(activeTeamId)}`,
            {

                method:
                    "PATCH",

                headers: {

                    Prefer:
                        "return=minimal"

                },

                body:
                    JSON.stringify(
                        body
                    )

            }
        );


        if (
            currentTeam
        ) {

            currentTeam.data =
                body.data;

            currentTeam.updated_at =
                body.updated_at;

            renderTeamsDashboard();

        }


        const status =
            document.getElementById(
                "cloudStatus"
            );


        if (status) {

            status.textContent =
                "☁ Synkroniseret";

        }

    } catch (error) {

        const status =
            document.getElementById(
                "cloudStatus"
            );


        if (status) {

            status.textContent =
                "⚠ Ikke synkroniseret";

        }


        console.error(
            "Cloud save fejl:",
            error
        );

    } finally {

        cloudSaveInProgress =
            false;


        if (
            cloudSaveQueued
        ) {

            cloudSaveQueued =
                false;

            saveCloudNow();

        }

    }

}


/* =========================================================
   PLANLÆG CLOUD GEMNING
========================================================= */

function scheduleCloudSave() {

    if (
        !cloudReady
    ) {

        return;

    }


    const status =
        document.getElementById(
            "cloudStatus"
        );


    if (status) {

        status.textContent =
            "☁ Gemmer...";

    }


    clearTimeout(
        cloudSaveTimer
    );


    cloudSaveTimer =
        setTimeout(
            saveCloudNow,
            600
        );

}


/* =========================================================
   HOLDVÆLGER
========================================================= */

function updateTeamSelector() {

    const selector =
        document.getElementById(
            "teamSelector"
        );


    if (
        !selector
    ) {

        return;

    }


    selector.innerHTML =
        "";


    cloudTeams.forEach(
        team => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                team.id;


            option.textContent =
                team.name;


            if (
                team.id ===
                activeTeamId
            ) {

                option.selected =
                    true;

            }


            selector.appendChild(
                option
            );

        }
    );

}


/* =========================================================
   SKIFT HOLD
========================================================= */

async function changeTeam(
    teamId
) {

    if (
        !teamId ||
        teamId === activeTeamId
    ) {

        return;

    }


    await saveCloudNow();


    const selected =
        cloudTeams.find(
            team =>
                team.id === teamId
        );


    if (
        !selected
    ) {

        return;

    }


    activeTeamId =
        selected.id;


    localStorage.setItem(
        ACTIVE_TEAM_KEY,
        activeTeamId
    );


    applyTeamData(
        selected.data
    );


    updateTeamSelector();

    renderTeamsDashboard();


    visNotification(
        `Skiftet til ${selected.name}`
    );

}


/* =========================================================
   OPRET NYT HOLD
========================================================= */

async function addTeam(nameFromUi = null) {

    if (
        !session
    ) {

        showLogin();

        return;

    }


    const providedName =
        typeof nameFromUi === "string"
            ? nameFromUi.trim()
            : "";


    const name =
        providedName ||
        prompt(
            "Hvad skal holdet hedde?"
        );


    if (
        !name ||
        !name.trim()
    ) {

        return;

    }


    try {

        await saveCloudNow();


        const currentData =
            collectTeamData();


        const team =
            await createCloudTeam(
                name.trim()
            );


        /*
            Det nye hold starter som en kopi
            af den nuværende opstilling.
            Derefter kan det redigeres separat.
        */

        applyTeamData(
            currentData
        );


        team.data =
            currentData;


        await saveCloudNow();


        updateTeamSelector();

        renderTeamsDashboard();

    } catch (error) {

        visNotification(
            "Kunne ikke oprette hold: " +
            error.message
        );

    }

}
/* =========================================================
   GEM ALT
========================================================= */

function gemAlt() {

    localStorage.setItem(
        "startopstillingSpillere",
        JSON.stringify(spillere)
    );

    localStorage.setItem(
        "startopstillingUdskiftere",
        JSON.stringify(udskiftere)
    );

    localStorage.setItem(
        "kampplan",
        JSON.stringify(kampplan)
    );

    localStorage.setItem(
        "start11Formation",
        formationSelector.value
    );

    scheduleCloudSave();
}


/* =========================================================
   OPSTILLING
========================================================= */

function tegnOpstilling() {

    document
        .querySelectorAll(".player-slot")
        .forEach(e => e.remove());


    const formation =
        formationer[
            formationSelector.value
        ] ||
        formationer["4-4-2"];


    formation.forEach(
        (position, index) => {

            const [rolle, x, y] =
                position;


            const slot =
                document.createElement(
                    "div"
                );


            slot.className =
                "player-slot";


            slot.style.left =
                `${x}%`;


            slot.style.top =
                `${y}%`;


            const spiller =
                spillere[index];


            if (spiller) {

                if (
                    spiller.position ===
                    "GK"
                ) {

                    slot.classList.add(
                        "goalkeeper"
                    );

                }


                slot.innerHTML = `

                    <div class="shirt">
                        ${escapeHTML(spiller.number)}
                    </div>

                    <div class="player-name">
                        ${escapeHTML(spiller.name)}
                    </div>

                `;


                gørSpillerTrækbar(
                    slot,
                    spiller,
                    index
                );


                slot.addEventListener(
                    "click",
                    () => {

                        if (
                            playerWasDragged
                        ) {

                            return;

                        }


                        currentPlayerSource =
                            "starting";

                        currentSubstituteIndex =
                            null;

                        currentSlot =
                            index;


                        visDetaljer(
                            spiller
                        );

                    }
                );


                slot.addEventListener(
                    "contextmenu",
                    e => {

                        e.preventDefault();


                        currentPlayerSource =
                            "starting";

                        currentSubstituteIndex =
                            null;

                        currentSlot =
                            index;


                        åbnPlayerModal();

                    }
                );

            } else {

                slot.classList.add(
                    "empty-slot"
                );


                slot.innerHTML = `

                    <div class="shirt">
                        +
                    </div>

                    <div class="player-name">
                        Tilføj
                    </div>

                `;


                slot.addEventListener(
                    "click",
                    () => {

                        currentPlayerSource =
                            "starting";

                        currentSubstituteIndex =
                            null;

                        currentSlot =
                            index;


                        åbnPlayerModal();

                    }
                );

            }


            pitch.appendChild(
                slot
            );

        }
    );


    opdaterRoster();

}


/* =========================================================
   DRAG & DROP
========================================================= */

function gørSpillerTrækbar(
    element,
    spiller,
    index
) {

    let dragging = false;
    let pointerIsDown = false;

    let startX = 0;
    let startY = 0;


    function nulstilDrag() {

        pointerIsDown = false;
        dragging = false;

        element.classList.remove(
            "dragging"
        );

        draggedPlayer = null;

    }


    element.addEventListener(
        "pointerdown",
        event => {

            if (
                event.button !== 0
            ) {

                return;

            }


            pointerIsDown = true;
            dragging = false;
            playerWasDragged = false;


            startX =
                event.clientX;

            startY =
                event.clientY;


            draggedPlayer = {

                element,
                spiller,
                index,
                source: "starting"

            };


            try {

                element.setPointerCapture(
                    event.pointerId
                );

            } catch (error) {

                // Pointer capture er ikke kritisk.

            }

        }
    );


    element.addEventListener(
        "pointermove",
        event => {

            /*
                Intet drag uden pointerdown.
            */
            if (
                !pointerIsDown
            ) {

                return;

            }


            /*
                Venstre museknap skal stadig
                være holdt nede.
            */
            if (
                (event.buttons & 1) !== 1
            ) {

                return;

            }


            if (
                !draggedPlayer ||
                draggedPlayer.element !==
                    element
            ) {

                return;

            }


            const dx =
                Math.abs(
                    event.clientX -
                    startX
                );


            const dy =
                Math.abs(
                    event.clientY -
                    startY
                );


            /*
                Et normalt klik må ikke
                starte drag.
            */
            if (
                !dragging &&
                dx < 8 &&
                dy < 8
            ) {

                return;

            }


            /*
                Start rigtigt drag.
            */
            if (
                !dragging
            ) {

                dragging = true;

                playerWasDragged = true;


                element.classList.add(
                    "dragging"
                );

            }


            const rect =
                pitch.getBoundingClientRect();


            const x =
                Math.max(
                    20,
                    Math.min(
                        rect.width - 20,
                        event.clientX -
                        rect.left
                    )
                );


            const y =
                Math.max(
                    20,
                    Math.min(
                        rect.height - 20,
                        event.clientY -
                        rect.top
                    )
                );


            element.style.left =
                `${x}px`;

            element.style.top =
                `${y}px`;

        }
    );


    element.addEventListener(
        "pointerup",
        event => {

            const wasDragging =
                dragging;


            pointerIsDown = false;


            /*
                Hvis det bare var et klik,
                må vi IKKE ændre placeringen.
            */
            if (
                !wasDragging
            ) {

                nulstilDrag();

                return;

            }


            /*
                Først: er spilleren sluppet
                over en udskifter?
            */
            const substituteIndex =
                findUdskifterVedPunkt(
                    event.clientX,
                    event.clientY
                );


            if (
                substituteIndex !== null
            ) {

                const starter =
                    spillere[
                        index
                    ];


                const substitute =
                    udskiftere[
                        substituteIndex
                    ];


                if (
                    starter &&
                    substitute
                ) {

                    spillere[
                        index
                    ] =
                        substitute;


                    udskiftere[
                        substituteIndex
                    ] =
                        starter;


                    gemAlt();


                    nulstilDrag();


                    tegnOpstilling();


                    visNotification(
                        `${starter.name} og ${substitute.name} har byttet plads`
                    );


                    setTimeout(
                        () => {

                            playerWasDragged =
                                false;

                        },
                        100
                    );


                    return;

                }

            }


            /*
                Ellers: find nærmeste
                plads på banen.
            */
            const newIndex =
                findNaermestePosition(
                    event
                );


            if (
                newIndex !== null &&
                newIndex !== index
            ) {

                const flyttet =
                    spillere[
                        index
                    ];


                const destination =
                    spillere[
                        newIndex
                    ];


                spillere[
                    index
                ] =
                    destination;


                spillere[
                    newIndex
                ] =
                    flyttet;


                gemAlt();


                nulstilDrag();


                tegnOpstilling();


                visNotification(

                    destination

                        ? `${flyttet.name} og ${destination.name} har byttet plads`

                        : `${flyttet.name} flyttet`

                );

            } else {

                /*
                    Slippes spilleren et forkert
                    sted, tegnes den bare tilbage
                    på sin formation.
                */
                nulstilDrag();

                tegnOpstilling();

            }


            setTimeout(
                () => {

                    playerWasDragged =
                        false;

                },
                100
            );

        }
    );


    element.addEventListener(
        "pointercancel",
        () => {

            nulstilDrag();

            playerWasDragged =
                false;


            tegnOpstilling();

        }
    );


    element.addEventListener(
        "lostpointercapture",
        () => {

            /*
                Hvis pointer capture mistes
                under et drag, nulstilles det.
            */
            if (
                pointerIsDown &&
                dragging
            ) {

                nulstilDrag();

                tegnOpstilling();

            }

        }
    );

}


/* =========================================================
   FIND NÆRMESTE POSITION
========================================================= */

function findNaermestePosition(
    event
) {

    const formation =
        formationer[
            formationSelector.value
        ];


    const rect =
        pitch.getBoundingClientRect();


    const mouseX =
        event.clientX -
        rect.left;


    const mouseY =
        event.clientY -
        rect.top;


    let nearest =
        null;


    let shortest =
        Infinity;


    formation.forEach(
        ([, x, y], index) => {

            const px =
                x / 100 *
                rect.width;


            const py =
                y / 100 *
                rect.height;


            const d =
                Math.hypot(
                    mouseX - px,
                    mouseY - py
                );


            if (
                d < shortest
            ) {

                shortest =
                    d;


                nearest =
                    index;

            }

        }
    );


    return shortest > 100
        ? null
        : nearest;

}

/* =========================================================
   FIND UDSKIFTER VED POSITION
========================================================= */

function findUdskifterVedPunkt(
    clientX,
    clientY
) {

    const rows =
        substituteList.querySelectorAll(
            ".substitute"
        );


    for (
        const row of rows
    ) {

        const rect =
            row.getBoundingClientRect();


        if (
            clientX >= rect.left &&
            clientX <= rect.right &&
            clientY >= rect.top &&
            clientY <= rect.bottom
        ) {

            const index =
                Number(
                    row.dataset.index
                );


            if (
                Number.isInteger(index)
            ) {

                return index;

            }

        }

    }


    return null;

}


/* =========================================================
   UDSKIFTER – DRAG & DROP
========================================================= */

function gørUdskifterTrækbar(
    element,
    spiller,
    index
) {

    let pointerIsDown = false;
    let dragging = false;

    let startX = 0;
    let startY = 0;

    let ghost = null;


    function fjernGhost() {

        if (ghost) {

            ghost.remove();
            ghost = null;

        }

    }


    function nulstilDrag() {

        pointerIsDown = false;
        dragging = false;

        element.classList.remove(
            "dragging"
        );

        fjernGhost();

    }


    element.addEventListener(
        "pointerdown",
        event => {

            if (
                event.button !== 0
            ) {

                return;

            }


            pointerIsDown = true;
            dragging = false;

            playerWasDragged = false;


            startX =
                event.clientX;

            startY =
                event.clientY;


            /*
                Fjern evt. gammel ghost først.
            */
            fjernGhost();


            try {

                element.setPointerCapture(
                    event.pointerId
                );

            } catch (error) {

                // Ignorer hvis browseren ikke kan capture pointeren.

            }

        }
    );


    element.addEventListener(
        "pointermove",
        event => {

            /*
                Ingen pointerdown = ingen drag.
            */
            if (
                !pointerIsDown
            ) {

                return;

            }


            /*
                Venstre museknap skal stadig
                fysisk være holdt nede.
            */
            if (
                (event.buttons & 1) !== 1
            ) {

                nulstilDrag();

                return;

            }


            const dx =
                Math.abs(
                    event.clientX -
                    startX
                );


            const dy =
                Math.abs(
                    event.clientY -
                    startY
                );


            /*
                Start først drag efter 8 pixels.
            */
            if (
                !dragging &&
                dx < 8 &&
                dy < 8
            ) {

                return;

            }


            if (
                !dragging
            ) {

                dragging = true;
                playerWasDragged = true;


                element.classList.add(
                    "dragging"
                );


                /*
                    Sørg for at der KUN findes
                    én ghost.
                */
                fjernGhost();


                ghost =
                    element.cloneNode(
                        true
                    );


                ghost.classList.add(
                    "substitute-drag-ghost"
                );


                ghost.removeAttribute(
                    "id"
                );


                ghost.style.position =
                    "fixed";

                ghost.style.left =
                    `${event.clientX}px`;

                ghost.style.top =
                    `${event.clientY}px`;

                ghost.style.transform =
                    "translate(-50%, -50%)";

                ghost.style.width =
                    `${element.offsetWidth}px`;

                ghost.style.pointerEvents =
                    "none";

                ghost.style.zIndex =
                    "99999";

                ghost.style.margin =
                    "0";


                document.body.appendChild(
                    ghost
                );

            }


            if (
                ghost
            ) {

                ghost.style.left =
                    `${event.clientX}px`;

                ghost.style.top =
                    `${event.clientY}px`;

            }

        }
    );


    element.addEventListener(
        "pointerup",
        event => {

            const wasDragging =
                dragging;


            pointerIsDown = false;


            if (
                !wasDragging
            ) {

                nulstilDrag();

                return;

            }


            const pitchIndex =
                findNaermestePosition(
                    event
                );


            if (
                pitchIndex !== null
            ) {

                const udskifter =
                    udskiftere[
                        index
                    ];


                const starter =
                    spillere[
                        pitchIndex
                    ];


                if (
                    udskifter
                ) {

                    spillere[
                        pitchIndex
                    ] =
                        udskifter;


                    if (
                        starter
                    ) {

                        udskiftere[
                            index
                        ] =
                            starter;

                    } else {

                        udskiftere.splice(
                            index,
                            1
                        );

                    }


                    gemAlt();


                    nulstilDrag();


                    tegnOpstilling();


                    if (
                        starter
                    ) {

                        visNotification(
                            `${udskifter.name} og ${starter.name} har byttet plads`
                        );

                    } else {

                        visNotification(
                            `${udskifter.name} er flyttet ind i startopstillingen`
                        );

                    }


                    setTimeout(
                        () => {

                            playerWasDragged =
                                false;

                        },
                        100
                    );


                    return;

                }

            }


            /*
                Slappes den et forkert sted,
                nulstilles den bare.
            */
            nulstilDrag();


            setTimeout(
                () => {

                    playerWasDragged =
                        false;

                },
                100
            );

        }
    );


    element.addEventListener(
        "pointercancel",
        () => {

            nulstilDrag();

            playerWasDragged =
                false;

        }
    );


    element.addEventListener(
        "lostpointercapture",
        () => {

            /*
                Vigtigt:
                ryd alt op hvis pointer-capture
                mistes.
            */
            if (
                pointerIsDown ||
                dragging
            ) {

                nulstilDrag();

            }

        }
    );


    element.addEventListener(
        "mouseleave",
        event => {

            /*
                Hvis musen IKKE er trykket ned,
                må der aldrig ligge en ghost.
            */
            if (
                (event.buttons & 1) !== 1
            ) {

                nulstilDrag();

            }

        }
    );

}



/* =========================================================
   ROSTER
========================================================= */

function opdaterRoster() {

    rosterList.innerHTML =
        "";


    spillere.forEach(
        (spiller, index) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "roster-player";


            const number =
                String(
                    index + 1
                ).padStart(
                    2,
                    "0"
                );


            if (spiller) {

                row.innerHTML = `

                    <div class="roster-number">
                        ${number}
                    </div>

                    <div class="roster-name">
                        ${escapeHTML(spiller.name)}
                    </div>

                    <div class="roster-position">
                        (${escapeHTML(spiller.position)})
                    </div>

                `;


                row.addEventListener(
                    "click",
                    () => {

                        currentPlayerSource =
                            "starting";

                        currentSubstituteIndex =
                            null;

                        currentSlot =
                            index;


                        visDetaljer(
                            spiller
                        );

                    }
                );


                row.addEventListener(
                    "contextmenu",
                    e => {

                        e.preventDefault();


                        currentPlayerSource =
                            "starting";

                        currentSubstituteIndex =
                            null;

                        currentSlot =
                            index;


                        åbnPlayerModal();

                    }
                );

            } else {

                row.innerHTML = `

                    <div class="roster-number">
                        ${number}
                    </div>

                    <div class="roster-name empty-player">
                        Tom plads
                    </div>

                    <div class="roster-position">
                        --
                    </div>

                `;


                row.addEventListener(
                    "click",
                    () => {

                        currentPlayerSource =
                            "starting";

                        currentSubstituteIndex =
                            null;

                        currentSlot =
                            index;


                        åbnPlayerModal();

                    }
                );

            }


            rosterList.appendChild(
                row
            );

        }
    );


    opdaterUdskiftere();

}


/* =========================================================
   ÅBN SPILLER MODAL
========================================================= */

function åbnPlayerModal() {

    const spiller =
        currentPlayerSource ===
        "substitute"

            ? udskiftere[
                currentSubstituteIndex
            ]

            : spillere[
                currentSlot
            ];


    document.getElementById(
        "modalTitle"
    ).textContent =
        spiller
            ? "Rediger spiller"
            : "Tilføj spiller";


    if (spiller) {

        document.getElementById(
            "playerName"
        ).value =
            spiller.name;


        document.getElementById(
            "playerNumber"
        ).value =
            spiller.number;


        document.getElementById(
            "playerPosition"
        ).value =
            spiller.position;


        document.getElementById(
            "playerStrengths"
        ).value =
            spiller.strengths ||
            "";


        document.getElementById(
            "playerWeaknesses"
        ).value =
            spiller.weaknesses ||
            "";


        document.getElementById(
            "playerFocusWithBall"
        ).value =
            spiller.focusWithBall ||
            "";


        document.getElementById(
            "playerFocusWithoutBall"
        ).value =
            spiller.focusWithoutBall ||
            "";


        document.getElementById(
            "playerVideo"
        ).value =
            spiller.video ||
            "";

    } else {

        playerForm.reset();


document.getElementById(
    "playerNumber"
).value =
    currentPlayerSource === "starting" &&
    currentSlot !== null
        ? currentSlot + 1
        : "";

    }


    playerModal.style.display =
        "flex";

}


/* =========================================================
   LUK SPILLER MODAL
========================================================= */

function lukPlayerModal() {

    playerModal.style.display =
        "none";

}


/* =========================================================
   GEM SPILLER
========================================================= */

playerForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const spiller = {

            name:
                document
                    .getElementById(
                        "playerName"
                    )
                    .value
                    .trim(),

            number:
                document
                    .getElementById(
                        "playerNumber"
                    )
                    .value,

            position:
                document
                    .getElementById(
                        "playerPosition"
                    )
                    .value,

            strengths:
                document
                    .getElementById(
                        "playerStrengths"
                    )
                    .value
                    .trim(),

            weaknesses:
                document
                    .getElementById(
                        "playerWeaknesses"
                    )
                    .value
                    .trim(),

            focusWithBall:
                document
                    .getElementById(
                        "playerFocusWithBall"
                    )
                    .value
                    .trim(),

            focusWithoutBall:
                document
                    .getElementById(
                        "playerFocusWithoutBall"
                    )
                    .value
                    .trim(),

            video:
                document
                    .getElementById(
                        "playerVideo"
                    )
                    .value
                    .trim()

        };


if (
    currentPlayerSource ===
    "substitute"
) {

    udskiftere[
        currentSubstituteIndex
    ] =
        spiller;

} else {

    spillere[
        currentSlot
    ] =
        spiller;

}


gemAlt();


tegnOpstilling();

opdaterUdskiftere();


        visDetaljer(
            spiller
        );


        lukPlayerModal();


        visNotification(
            `${spiller.name} er gemt`
        );

    }
);


/* =========================================================
   FJERN SPILLER
========================================================= */

function fjernSpiller() {

    let spiller =
        null;


    if (
        currentPlayerSource ===
        "substitute"
    ) {

        if (
            currentSubstituteIndex === null
        ) {

            return;

        }


        spiller =
            udskiftere[
                currentSubstituteIndex
            ];


        udskiftere.splice(
            currentSubstituteIndex,
            1
        );


        currentSubstituteIndex =
            null;

    } else {

        if (
            currentSlot === null
        ) {

            return;

        }


        spiller =
            spillere[
                currentSlot
            ];


        spillere[
            currentSlot
        ] =
            null;

    }


    gemAlt();

    tegnOpstilling();

    opdaterUdskiftere();


    playerDetails.innerHTML = `

        <div class="no-player">
            Spilleren er fjernet.
        </div>

    `;


    lukPlayerModal();


    if (spiller) {

        visNotification(
            `${spiller.name} er fjernet`
        );

    }

}


/* =========================================================
   SPILLERDETALJER
========================================================= */

function visDetaljer(
    spiller
) {

    const strengths =
        lavListe(
            spiller.strengths
        );


    const weaknesses =
        lavListe(
            spiller.weaknesses
        );


    const focusWithBall =
        spiller.focusWithBall ||
        "Ingen fokuspunkter tilføjet endnu.";


    const focusWithoutBall =
        spiller.focusWithoutBall ||
        "Ingen fokuspunkter tilføjet endnu.";


    const positionName =
        positionsNavne[
            spiller.position
        ] ||
        spiller.position;


    playerDetails.innerHTML = `

        <div class="details-left">

            <div class="shirt details-shirt ${spiller.position === "GK" ? "goalkeeper" : ""}">
                ${escapeHTML(spiller.number)}
            </div>

            <div>

                <div class="details-name">
                    ${escapeHTML(spiller.name).toUpperCase()}
                </div>

                <div class="details-position">
                    ${escapeHTML(positionName)}
                </div>

                <button
                    class="edit-player-btn"
                    id="detailsEditButton"
                >
                    ✎ REDIGER SPILLER
                </button>

            </div>

        </div>


        <div class="details-column">

            <h3 class="strength-title">
                STYRKER / POSITIVE
            </h3>

            ${strengths}

        </div>


        <div class="details-column">

            <h3 class="weakness-title">
                SVAGHEDER / NEGATIVE
            </h3>

            ${weaknesses}

        </div>

    `;


    document
        .getElementById(
            "detailsEditButton"
        )
        .addEventListener(
            "click",
            () => {

const startingIndex =
    spillere.indexOf(
        spiller
    );


const substituteIndex =
    udskiftere.indexOf(
        spiller
    );


if (
    startingIndex !== -1
) {

    currentPlayerSource =
        "starting";

    currentSlot =
        startingIndex;

    currentSubstituteIndex =
        null;

} else {

    currentPlayerSource =
        "substitute";

    currentSlot =
        null;

    currentSubstituteIndex =
        substituteIndex;

}


åbnPlayerModal();

            }
        );


    const focusBox =
        document.createElement(
            "div"
        );


    focusBox.style.gridColumn =
        "1 / -1";


    focusBox.innerHTML = `

        <div
            class="details-column"
            style="
                border-left:none;
                border-top:1px solid rgba(255,255,255,.12)
            "
        >

            <h3>
                🎯 SPILLERENS FOKUSPUNKTER
            </h3>


            <div class="pdf-focus-grid">

                <div class="pdf-focus-block with-ball">

                    <div class="pdf-focus-block-title">
                        MED BOLD
                    </div>

                    <div class="pdf-focus-block-text">
                        ${escapeHTML(focusWithBall)}
                    </div>

                </div>


                <div class="pdf-focus-block without-ball">

                    <div class="pdf-focus-block-title">
                        UDEN BOLD
                    </div>

                    <div class="pdf-focus-block-text">
                        ${escapeHTML(focusWithoutBall)}
                    </div>

                </div>

            </div>

        </div>

    `;


    playerDetails.appendChild(
        focusBox
    );


    if (
        spiller.video
    ) {

        const video =
            document.createElement(
                "div"
            );


        video.style.gridColumn =
            "1 / -1";


        video.style.padding =
            "0 15px 15px";


        video.innerHTML = `

            🎥

            <a
                href="${escapeHTML(spiller.video)}"
                target="_blank"
                style="color:#9ddd49;"
            >
                Se spillerens video
            </a>

        `;


        playerDetails.appendChild(
            video
        );

    }

}


/* =========================================================
   KAMPPLAN
========================================================= */

function åbnKampplan() {

    [
        "homeTeam",
        "awayTeam",
        "matchDate",
        "matchTime",
        "matchPlace",
        "practicalInfo",
        "matchProgram",
        "teamWithBall",
        "teamWithoutBall",
        "coachMessage"

    ].forEach(
        id => {

            document.getElementById(
                id
            ).value =
                kampplan[id] ||
                "";

        }
    );


    opdaterBilledePreview(
        "homeLogo",
        kampplan.homeLogo
    );


    opdaterBilledePreview(
        "awayLogo",
        kampplan.awayLogo
    );


    opdaterBilledePreview(
        "background",
        kampplan.backgroundImage
    );


    matchplanModal.style.display =
        "flex";

}


/* =========================================================
   LUK KAMPPLAN
========================================================= */

function lukKampplan() {

    matchplanModal.style.display =
        "none";

}


/* =========================================================
   GEM KAMPPLAN
========================================================= */

function gemKampplan() {

    kampplan = {

        ...kampplan,

        homeTeam:
            document
                .getElementById(
                    "homeTeam"
                )
                .value
                .trim(),

        awayTeam:
            document
                .getElementById(
                    "awayTeam"
                )
                .value
                .trim(),

        matchDate:
            document
                .getElementById(
                    "matchDate"
                )
                .value,

        matchTime:
            document
                .getElementById(
                    "matchTime"
                )
                .value,

        matchPlace:
            document
                .getElementById(
                    "matchPlace"
                )
                .value
                .trim(),

        practicalInfo:
            document
                .getElementById(
                    "practicalInfo"
                )
                .value
                .trim(),

        matchProgram:
            document
                .getElementById(
                    "matchProgram"
                )
                .value
                .trim(),

        teamWithBall:
            document
                .getElementById(
                    "teamWithBall"
                )
                .value
                .trim(),

        teamWithoutBall:
            document
                .getElementById(
                    "teamWithoutBall"
                )
                .value
                .trim(),

        coachMessage:
            document
                .getElementById(
                    "coachMessage"
                )
                .value
                .trim()

    };


    gemAlt();


    opdaterKampTitel();


    lukKampplan();


    visNotification(
        "Kampplan gemt!"
    );

}


/* =========================================================
   OPDATER KAMPTITEL
========================================================= */

function opdaterKampTitel() {

    document.getElementById(
        "displayHomeTeam"
    ).textContent =
        kampplan.homeTeam ||
        "FC THY";


    document.getElementById(
        "displayAwayTeam"
    ).textContent =
        kampplan.awayTeam ||
        "MODSTANDER";

}


/* =========================================================
   UDSKIFTERE
========================================================= */

function opdaterUdskiftere() {

    substituteList.innerHTML =
        "";


    udskiftere.forEach(
        (spiller, index) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "substitute";


            row.dataset.index =
                index;


            row.innerHTML = `

                <div class="sub-shirt">

                    <span class="sub-shirt-number">
                        ${escapeHTML(
                            spiller.number || ""
                        )}
                    </span>

                </div>


                <div class="substitute-info">

                    <div class="substitute-name">
                        ${escapeHTML(
                            spiller.name
                        )}
                    </div>

                    <div class="substitute-position">
                        ${
                            spiller.position
                                ? escapeHTML(
                                    positionsNavne[
                                        spiller.position
                                    ] ||
                                    spiller.position
                                )
                                : "Udskifter"
                        }
                    </div>

                </div>

            `;


            gørUdskifterTrækbar(
                row,
                spiller,
                index
            );


            /*
                Klik på udskifter =
                vis spillerens information.
            */

            row.addEventListener(
                "click",
                () => {

                    if (
                        playerWasDragged
                    ) {

                        return;

                    }


                    currentPlayerSource =
                        "substitute";


                    currentSubstituteIndex =
                        index;


                    currentSlot =
                        null;


                    visDetaljer(
                        spiller
                    );

                }
            );


            /*
                Højreklik =
                rediger hele spilleren.
            */

            row.addEventListener(
                "contextmenu",
                event => {

                    event.preventDefault();


                    currentPlayerSource =
                        "substitute";


                    currentSubstituteIndex =
                        index;


                    currentSlot =
                        null;


                    åbnPlayerModal();

                }
            );


            substituteList.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   BILLEDER
========================================================= */

function setupImageUpload(
    inputId,
    property,
    previewId
) {

    const input =
        document.getElementById(
            inputId
        );


    if (!input) {

        return;

    }


    input.addEventListener(
        "change",
        event => {

            const file =
                event.target.files[0];


            if (!file) {

                return;

            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                visNotification(
                    "Filen skal være et billede."
                );

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                e => {

                    kampplan[
                        property
                    ] =
                        e.target.result;


                    gemAlt();


                    opdaterBilledePreview(
                        previewId,
                        e.target.result
                    );


                    visNotification(
                        "Billede gemt."
                    );

                };


            reader.readAsDataURL(
                file
            );

        }
    );

}


/* =========================================================
   BILLEDE PREVIEW
========================================================= */

function opdaterBilledePreview(
    type,
    data
) {

    if (
        type === "homeLogo"
    ) {

        const p =
            document.getElementById(
                "homeLogoPreview"
            );


        p.innerHTML =
            data

                ? `<img src="${data}" alt="Hjemmehold logo">`

                : "";

    }


    if (
        type === "awayLogo"
    ) {

        const p =
            document.getElementById(
                "awayLogoPreview"
            );


        p.innerHTML =
            data

                ? `<img src="${data}" alt="Modstander logo">`

                : "";

    }


    if (
        type === "background"
    ) {

        const p =
            document.getElementById(
                "backgroundPreview"
            );


        p.style.backgroundImage =
            data

                ? `url("${data}")`

                : "";

    }

}


/* =========================================================
   FJERN BILLEDE
========================================================= */

function fjernBillede(
    type
) {

    if (
        type === "homeLogo"
    ) {

        kampplan.homeLogo =
            "";


        document.getElementById(
            "homeLogoInput"
        ).value =
            "";


        opdaterBilledePreview(
            "homeLogo",
            ""
        );

    }


    if (
        type === "awayLogo"
    ) {

        kampplan.awayLogo =
            "";


        document.getElementById(
            "awayLogoInput"
        ).value =
            "";


        opdaterBilledePreview(
            "awayLogo",
            ""
        );

    }


    if (
        type === "background"
    ) {

        kampplan.backgroundImage =
            "";


        document.getElementById(
            "backgroundInput"
        ).value =
            "";


        opdaterBilledePreview(
            "background",
            ""
        );

    }


    gemAlt();


    visNotification(
        "Billede fjernet."
    );

}


/* =========================================================
   DEL 3
   PDF + HJÆLPEFUNKTIONER
========================================================= */


/* =========================================================
   GENERER PDF
========================================================= */

function genererPDF() {

    gemAlt();


    pdfDocument.innerHTML =
        lavPDF();


    pdfDocument.style.display =
        "block";


    const oldTitle =
        document.title;


    document.title =
        `${kampplan.homeTeam || "FC THY"} - ${kampplan.awayTeam || "Kampplan"}`;


    setTimeout(
        function() {

            window.print();


            setTimeout(
                function() {

                    pdfDocument.style.display =
                        "none";


                    document.title =
                        oldTitle;

                },
                800
            );

        },
        350
    );
}


/* =========================================================
   LAV PDF
========================================================= */

function lavPDF() {

    const home =
        kampplan.homeTeam ||
        "FC THY";


    const away =
        kampplan.awayTeam ||
        "MODSTANDER";


    const dato =
        formaterDato(
            kampplan.matchDate
        );


    const formationName =
        formationSelector.options[
            formationSelector.selectedIndex
        ].text;


    const background =
        kampplan.backgroundImage
            ? `

                <div class="pdf-background">

                    <img
                        src="${kampplan.backgroundImage}"
                    >

                    <div class="pdf-background-overlay"></div>

                </div>

            `
            : "";


    return `


        <!-- =================================================
             SIDE 1
        ================================================== -->

        <section class="pdf-page">

            ${background}


            <div class="pdf-content pdf-cover-content">


                <div class="pdf-logos">

                    ${
                        kampplan.homeLogo
                        ?
                        `
                        <img
                            class="pdf-logo"
                            src="${kampplan.homeLogo}"
                        >
                        `
                        :
                        ""
                    }


                    ${
                        kampplan.awayLogo
                        ?
                        `
                        <img
                            class="pdf-logo"
                            src="${kampplan.awayLogo}"
                        >
                        `
                        :
                        ""
                    }

                </div>


                <div class="pdf-cover-title">

                    ${escapeHTML(home)}

                </div>


                <div class="pdf-cover-vs">
                    VS
                </div>


                <div class="pdf-cover-title">

                    ${escapeHTML(away)}

                </div>


                <div class="pdf-cover-meta">

                    ${
                        dato
                        ?
                        `
                        <span>
                            ${dato}
                        </span>
                        `
                        :
                        ""
                    }


                    ${
                        kampplan.matchTime
                        ?
                        `
                        <span>
                            ${escapeHTML(
                                kampplan.matchTime
                            )}
                        </span>
                        `
                        :
                        ""
                    }


                    ${
                        kampplan.matchPlace
                        ?
                        `
                        <span>
                            ${escapeHTML(
                                kampplan.matchPlace
                            )}
                        </span>
                        `
                        :
                        ""
                    }

                </div>


            </div>


            <div class="pdf-footer">
                KAMPPLAN · ${escapeHTML(home)} vs ${escapeHTML(away)}
            </div>

        </section>



        <!-- =================================================
             SIDE 2
        ================================================== -->

        <section class="pdf-page">

            <div class="pdf-content">

                <h1 class="pdf-heading">
                    Praktisk info
                </h1>


                ${
                    kampplan.practicalInfo
                    ?
                    `

                    <div class="pdf-box">

                        <div class="pdf-text">
                            ${escapeHTML(
                                kampplan.practicalInfo
                            )}
                        </div>

                    </div>

                    `
                    :
                    ""
                }


                ${
                    kampplan.matchProgram
                    ?
                    `

                    <h2 class="pdf-subheading">
                        PROGRAM
                    </h2>

                    <div class="pdf-box">

                        <div class="pdf-text">
                            ${escapeHTML(
                                kampplan.matchProgram
                            )}
                        </div>

                    </div>

                    `
                    :
                    ""
                }


                ${
                    kampplan.coachMessage
                    ?
                    `

                    <h2 class="pdf-subheading">
                        BESKED TIL SPILLERNE
                    </h2>

                    <div class="pdf-box">

                        <div class="pdf-text">
                            ${escapeHTML(
                                kampplan.coachMessage
                            )}
                        </div>

                    </div>

                    `
                    :
                    ""
                }

            </div>


            <div class="pdf-footer">
                KAMPPLAN
            </div>

        </section>



        <!-- =================================================
             SIDE 3
             STARTOPSTILLING
        ================================================== -->

        <section class="pdf-page pdf-lineup-page">

            <div class="pdf-content">

                <div class="pdf-lineup-header">

                    <h1 class="pdf-heading">
                        Startopstilling
                    </h1>

                    <div class="pdf-formation-label">
                        ${escapeHTML(
                            formationName
                        )}
                    </div>

                </div>


                ${lavPDFBane()}

                ${lavPDFUdskiftere()}

            </div>


            <div class="pdf-footer">
                ${escapeHTML(home)}
                ·
                ${escapeHTML(away)}
                ·
                ${escapeHTML(formationName)}
            </div>

        </section>



        <!-- =================================================
             SIDE 4
             HOLDTAKTIK
        ================================================== -->

        <section class="pdf-page">

            <div class="pdf-content">

                <h1 class="pdf-heading">
                    Holdtaktiske fokuspunkter
                </h1>


                <div class="pdf-tactics-grid">


                    <div class="
                        pdf-tactic-card
                        with-ball
                    ">

                        <h3>
                            Med bold
                        </h3>


                        <div class="pdf-text">

                            ${
                                kampplan.teamWithBall
                                ?
                                escapeHTML(
                                    kampplan.teamWithBall
                                )
                                :
                                "Ingen fokuspunkter tilføjet."
                            }

                        </div>

                    </div>



                    <div class="
                        pdf-tactic-card
                        without-ball
                    ">

                        <h3>
                            Uden bold
                        </h3>


                        <div class="pdf-text">

                            ${
                                kampplan.teamWithoutBall
                                ?
                                escapeHTML(
                                    kampplan.teamWithoutBall
                                )
                                :
                                "Ingen fokuspunkter tilføjet."
                            }

                        </div>

                    </div>


                </div>

            </div>


            <div class="pdf-footer">
                HOLDTAKTISKE FOKUSPUNKTER
            </div>

        </section>



        <!-- SIDE 5+ (Dynamiske spillersider) -->
        ${lavSpillerePDF()}

    `;
}


/* =========================================================
   PDF BANE
========================================================= */

function lavPDFBane() {

    const formation =
        formationer[
            formationSelector.value
        ];


    let playersHTML =
        "";


    formation.forEach(
        (position, index) => {

            const [
                rolle,
                x,
                y
            ] = position;


            const spiller =
                spillere[index];


            if (!spiller) {
                return;
            }


            const keeper =
                spiller.position === "GK";


            playersHTML += `

                <div
                    class="pdf-player-slot"
                    style="
                        left:${x}%;
                        top:${y}%;
                    "
                >

                    <div
                        class="
                            pdf-shirt
                            ${keeper
                                ? "goalkeeper"
                                : ""}
                        "
                    >
                        ${escapeHTML(
                            spiller.number
                        )}
                    </div>


                    <div class="pdf-player-name">
                        ${escapeHTML(
                            spiller.name
                        )}
                    </div>

                </div>

            `;

        }
    );


    return `

        <div class="pdf-pitch">


            <div class="pdf-pitch-lines">

                <div class="pdf-halfway"></div>

                <div class="pdf-center-circle"></div>

                <div class="pdf-center-dot"></div>

                <div class="
                    pdf-penalty
                    top
                "></div>

                <div class="
                    pdf-goal
                    top
                "></div>

                <div class="
                    pdf-penalty
                    bottom
                "></div>

                <div class="
                    pdf-goal
                    bottom
                "></div>

            </div>


            ${playersHTML}

        </div>

    `;
}

function lavPDFUdskiftere() {

    if (
        !udskiftere.length
    ) {

        return "";

    }


    return `

        <div class="pdf-substitutes">

            <div class="pdf-substitutes-title">
                UDSKIFTERE
            </div>


            <div class="pdf-substitutes-list">

                ${
                    udskiftere
                        .map(
                            spiller => `

                                <div class="pdf-substitute">

                                    <span class="pdf-substitute-number">
                                        #${escapeHTML(
                                            spiller.number
                                        )}
                                    </span>

                                    <span>
                                        ${escapeHTML(
                                            spiller.name
                                        )}
                                    </span>

                                </div>

                            `
                        )
                        .join("")
                }

            </div>

        </div>

    `;

}

/* =========================================================
   SPILLERE PDF
========================================================= */

function lavSpillerePDF() {

const aktive = [

    ...spillere
        .filter(Boolean)
        .map(
            spiller => ({
                ...spiller,
                pdfPlayerStatus:
                    "STARTOPSTILLING"
            })
        ),

    ...udskiftere
        .filter(Boolean)
        .map(
            spiller => ({
                ...spiller,
                pdfPlayerStatus:
                    "UDSKIFTER"
            })
        )

];


    if (
        aktive.length === 0
    ) {

        return `
            <section class="pdf-page">

                <div class="pdf-content">

                    <h1 class="pdf-heading">
                        Spillerspecifikke fokuspunkter
                    </h1>

                    <div class="pdf-box">
                        Ingen spillere tilføjet endnu.
                    </div>

                </div>

                <div class="pdf-footer">
                    SPILLERSPECIFIKKE FOKUSPUNKTER
                </div>

            </section>
        `;

    }


    let sider = [];


    for (
        let i = 0;
        i < aktive.length;
        i += 3
    ) {

        sider.push(`

            <section class="pdf-page">

                <div class="pdf-content">

                    <h1 class="pdf-heading">
                        Spillerspecifikke fokuspunkter
                    </h1>

                    ${
                        aktive
                            .slice(
                                i,
                                i + 3
                            )
                            .map(
                                spiller =>
                                    lavSpillerPDF(
                                        spiller
                                    )
                            )
                            .join("")
                    }

                </div>

                <div class="pdf-footer">
                    SPILLERSPECIFIKKE FOKUSPUNKTER
                </div>

            </section>

        `);

    }


    return sider.join("");

}


/* =========================================================
   SPILLER PDF
========================================================= */

function lavSpillerPDF(
    spiller
) {

    const position =
        positionsNavne[
            spiller.position
        ] ||
        spiller.position;


    return `

        <div class="pdf-player-card">


            <div class="pdf-player-card-header">

                <div class="pdf-player-card-name">

                    ${escapeHTML(
                        spiller.name
                    )}

                </div>


                <div class="pdf-player-card-position">

#${escapeHTML(
    spiller.number
)}
·
${escapeHTML(
    position
)}

${
    spiller.pdfPlayerStatus
        ? ` · ${escapeHTML(
            spiller.pdfPlayerStatus
        )}`
        : ""
}

                </div>

            </div>


            <div class="pdf-focus-grid">


                <div class="
                    pdf-focus-block
                    with-ball
                ">

                    <div class="pdf-focus-block-title">
                        MED BOLD
                    </div>


                    <div class="pdf-focus-block-text">

                        ${
                            spiller.focusWithBall
                            ?
                            escapeHTML(
                                spiller.focusWithBall
                            )
                            :
                            "Ingen fokuspunkter tilføjet."
                        }

                    </div>

                </div>



                <div class="
                    pdf-focus-block
                    without-ball
                ">

                    <div class="pdf-focus-block-title">
                        UDEN BOLD
                    </div>


                    <div class="pdf-focus-block-text">

                        ${
                            spiller.focusWithoutBall
                            ?
                            escapeHTML(
                                spiller.focusWithoutBall
                            )
                            :
                            "Ingen fokuspunkter tilføjet."
                        }

                    </div>

                </div>


            </div>


            ${
                spiller.video
                ?
                `

                <div
                    style="
                        margin-top:8px;
                        font-size:9px;
                    "
                >

                    🎥

                    ${escapeHTML(
                        spiller.video
                    )}

                </div>

                `
                :
                ""
            }


        </div>

    `;
}


/* =========================================================
   LISTE
========================================================= */

function lavListe(
    tekst
) {

    if (
        !tekst
    ) {

        return `

            <div class="trait-list">

                <li>
                    Ingen tilføjet endnu.
                </li>

            </div>

        `;

    }


    const items =
        tekst
            .split(/\n|,/)
            .filter(
                item =>
                    item.trim()
            );


    return `

        <ul class="trait-list">

            ${
                items
                    .map(
                        item => `

                            <li>

                                <span class="check-icon">
                                    ✓
                                </span>

                                ${escapeHTML(
                                    item.trim()
                                )}

                            </li>

                        `
                    )
                    .join("")
            }

        </ul>

    `;
}


/* =========================================================
   DATO
========================================================= */

function formaterDato(
    dato
) {

    if (
        !dato
    ) {

        return "";

    }


    const parts =
        dato.split("-");


    if (
        parts.length !== 3
    ) {

        return dato;

    }


    return `${parts[2]}/${parts[1]}/${parts[0]}`;

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   NOTIFICATION
========================================================= */

function visNotification(
    tekst
) {

    notification.textContent =
        tekst;


    notification.classList.add(
        "show"
    );


    setTimeout(
        function() {

            notification.classList.remove(
                "show"
            );

        },
        2500
    );

}


/* =========================================================
   SLUT PÅ DEL 3
   DEL 4 STARTER HERUNDER
========================================================= */

/* =========================================================
   DEL 4 FORTSÆTTER:
   EVENT LISTENERS + INITIALISERING
========================================================= */

/* =========================================================
   FORMATION
========================================================= */

formationSelector.addEventListener(
    "change",
    () => {

        currentFormation =
            formationSelector.value;


        localStorage.setItem(
            "start11Formation",
            currentFormation
        );


        /*
            Spillernes pladser i arrayet bevares.
            Det er kun formationens positioner på banen,
            der ændres.
        */

        tegnOpstilling();


        gemAlt();


        visNotification(
            `Formation ændret til ${currentFormation}`
        );

    }
);


/* =========================================================
   GEM-KNAP
========================================================= */

const saveButton =
    document.getElementById(
        "saveButton"
    );


if (saveButton) {

    saveButton.addEventListener(
        "click",
        async () => {

            gemAlt();


            if (
                cloudReady &&
                session
            ) {

                await saveCloudNow();


                visNotification(
                    "Opstillingen er gemt og synkroniseret."
                );

            } else {

                visNotification(
                    "Opstillingen er gemt på denne enhed."
                );

            }

        }
    );

}

/* =========================================================
   START11 – ACCOUNT MODALS / HOLD-DASHBOARD
========================================================= */

function closeAccountDropdown() {

    const menu =
        document.getElementById(
            "accountMenu"
        );

    const button =
        document.getElementById(
            "accountMenuButton"
        );


    menu?.classList.remove(
        "open"
    );


    button?.setAttribute(
        "aria-expanded",
        "false"
    );

}


function openStart11Modal(
    id
) {

    const modal =
        document.getElementById(
            id
        );


    if (!modal) {

        return;

    }


    closeAccountDropdown();


    modal.style.display =
        "flex";

}


function closeStart11Modal(
    id
) {

    const modal =
        document.getElementById(
            id
        );


    if (modal) {

        modal.style.display =
            "none";

    }

}


/* =========================================================
   HOLD – SYNKRONISERINGSTID
========================================================= */

function formatTeamSyncTime(
    value
) {

    if (!value) {

        return "Ikke synkroniseret endnu";

    }


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Ukendt";

    }


    const diff =
        Date.now() -
        date.getTime();


    if (
        diff >= 0 &&
        diff < 60000
    ) {

        return "Nu";

    }


    if (
        diff >= 0 &&
        diff < 3600000
    ) {

        return (
            Math.max(
                1,
                Math.floor(
                    diff / 60000
                )
            ) +
            " min siden"
        );

    }


    return date.toLocaleString(
        "da-DK",
        {

            day:
                "2-digit",

            month:
                "2-digit",

            year:
                date.getFullYear() !==
                new Date().getFullYear()
                    ? "numeric"
                    : undefined,

            hour:
                "2-digit",

            minute:
                "2-digit"

        }
    );

}


/* =========================================================
   MINE HOLD – RENDER
========================================================= */

function renderTeamsDashboard() {

    const list =
        document.getElementById(
            "teamsDashboardList"
        );


    if (!list) {

        return;

    }


    list.innerHTML =
        "";


    if (
        !cloudTeams.length
    ) {

        list.innerHTML = `
            <div class="team-dashboard-card">

                <div class="team-card-main">

                    <div class="team-card-name">
                        Ingen hold endnu
                    </div>

                    <div class="team-sync-text">
                        Opret dit første hold nedenfor.
                    </div>

                </div>

            </div>
        `;

        return;

    }


    cloudTeams.forEach(
        team => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "team-dashboard-card" +
                (
                    team.id ===
                    activeTeamId
                        ? " active"
                        : ""
                );


            card.dataset.teamId =
                team.id;


            /* -------------------------
               VENSTRE DEL
            ------------------------- */

            const main =
                document.createElement(
                    "div"
                );


            main.className =
                "team-card-main";


            const titleRow =
                document.createElement(
                    "div"
                );


            titleRow.className =
                "team-card-title-row";


            const name =
                document.createElement(
                    "div"
                );


            name.className =
                "team-card-name";


            name.textContent =
                team.name ||
                "Mit hold";


            titleRow.appendChild(
                name
            );


            if (
                team.id ===
                activeTeamId
            ) {

                const activeBadge =
                    document.createElement(
                        "span"
                    );


                activeBadge.className =
                    "team-active-badge";


                activeBadge.textContent =
                    "AKTIVT HOLD";


                titleRow.appendChild(
                    activeBadge
                );

            }


            const sync =
                document.createElement(
                    "div"
                );


            sync.className =
                "team-sync-text";


            sync.textContent =
                "Sidst synkroniseret: " +
                formatTeamSyncTime(
                    team.updated_at
                );


            main.append(
                titleRow,
                sync
            );


            main.addEventListener(
                "click",
                async () => {

                    if (
                        team.id ===
                        activeTeamId
                    ) {

                        return;

                    }


                    await changeTeam(
                        team.id
                    );


                    renderTeamsDashboard();

                }
            );


            /* -------------------------
               KNAPPER
            ------------------------- */

            const actions =
                document.createElement(
                    "div"
                );


            actions.className =
                "team-card-actions";


            /* OMDØB */

            const rename =
                document.createElement(
                    "button"
                );


            rename.type =
                "button";


            rename.className =
                "team-icon-button";


            rename.title =
                "Omdøb hold";


            rename.setAttribute(
                "aria-label",
                `Omdøb ${team.name}`
            );


            rename.textContent =
                "✎";


            rename.addEventListener(
                "click",
                event => {

                    event.stopPropagation();


                    showRenameTeamRow(
                        card,
                        team
                    );

                }
            );


            /* SLET */

            const del =
                document.createElement(
                    "button"
                );


            del.type =
                "button";


            del.className =
                "team-icon-button delete";


            del.title =
                "Slet hold";


            del.setAttribute(
                "aria-label",
                `Slet ${team.name}`
            );


            del.textContent =
                "🗑";


            del.addEventListener(
                "click",
                async event => {

                    event.stopPropagation();


                    await deleteTeamFromDashboard(
                        team.id
                    );

                }
            );


            actions.append(
                rename,
                del
            );


            card.append(
                main,
                actions
            );


            list.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   OMDØB HOLD
========================================================= */

function showRenameTeamRow(
    card,
    team
) {

    const existing =
        card.querySelector(
            ".team-rename-row"
        );


    if (existing) {

        existing
            .querySelector(
                "input"
            )
            ?.focus();


        return;

    }


    const row =
        document.createElement(
            "div"
        );


    row.className =
        "team-rename-row";


    row.style.gridColumn =
        "1 / -1";


    const input =
        document.createElement(
            "input"
        );


    input.type =
        "text";


    input.maxLength =
        60;


    input.value =
        team.name ||
        "";


    input.setAttribute(
        "aria-label",
        "Nyt holdnavn"
    );


    const save =
        document.createElement(
            "button"
        );


    save.type =
        "button";


    save.className =
        "start11-secondary-button";


    save.textContent =
        "GEM";


    const submit =
        async () => {

            const newName =
                input.value.trim();


            if (
                !newName ||
                newName === team.name
            ) {

                row.remove();

                return;

            }


            await renameCloudTeam(
                team.id,
                newName
            );

        };


    save.addEventListener(
        "click",
        submit
    );


    input.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                submit();

            }


            if (
                event.key ===
                "Escape"
            ) {

                row.remove();

            }

        }
    );


    row.append(
        input,
        save
    );


    card.appendChild(
        row
    );


    input.focus();

    input.select();

}


/* =========================================================
   GEM NYT HOLDNAVN
========================================================= */

async function renameCloudTeam(
    teamId,
    newName
) {

    const team =
        cloudTeams.find(
            item =>
                item.id ===
                teamId
        );


    if (
        !team ||
        !newName.trim()
    ) {

        return;

    }


    try {

        const updatedAt =
            new Date().toISOString();


        await supabaseRequest(
            `/rest/v1/${CLOUD_TABLE}?id=eq.${encodeURIComponent(teamId)}`,
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
                            newName.trim(),

                        updated_at:
                            updatedAt

                    })

            }
        );


        team.name =
            newName.trim();


        team.updated_at =
            updatedAt;


        updateTeamSelector();

        renderTeamsDashboard();


        visNotification(
            "Holdet er omdøbt."
        );

    } catch (error) {

        visNotification(
            "Kunne ikke omdøbe hold: " +
            error.message
        );

    }

}


/* =========================================================
   SLET HOLD
========================================================= */

async function deleteTeamFromDashboard(
    teamId
) {

    const team =
        cloudTeams.find(
            item =>
                item.id ===
                teamId
        );


    if (!team) {

        return;

    }


    if (
        cloudTeams.length <= 1
    ) {

        visNotification(
            "Du skal have mindst ét hold på din konto."
        );

        return;

    }


    const accepted =
        confirm(
            `Vil du slette "${team.name}"? Denne handling kan ikke fortrydes.`
        );


    if (!accepted) {

        return;

    }


    try {

        if (
            teamId ===
            activeTeamId
        ) {

            await saveCloudNow();

        }


        await supabaseRequest(
            `/rest/v1/${CLOUD_TABLE}?id=eq.${encodeURIComponent(teamId)}`,
            {

                method:
                    "DELETE",

                headers: {

                    Prefer:
                        "return=minimal"

                }

            }
        );


        cloudTeams =
            cloudTeams.filter(
                item =>
                    item.id !==
                    teamId
            );


        if (
            teamId ===
            activeTeamId
        ) {

            const nextTeam =
                cloudTeams[0];


            activeTeamId =
                null;


            localStorage.removeItem(
                ACTIVE_TEAM_KEY
            );


            if (nextTeam) {

                activeTeamId =
                    nextTeam.id;


                localStorage.setItem(
                    ACTIVE_TEAM_KEY,
                    nextTeam.id
                );


                applyTeamData(
                    nextTeam.data
                );

            }

        }


        updateTeamSelector();

        renderTeamsDashboard();


        visNotification(
            `${team.name} er slettet.`
        );

    } catch (error) {

        visNotification(
            "Kunne ikke slette hold: " +
            error.message
        );

    }

}


/* =========================================================
   OPRET HOLD FRA MODAL
========================================================= */

async function createTeamFromDashboard() {

    const input =
        document.getElementById(
            "newTeamNameInput"
        );


    const name =
        input?.value?.trim();


    if (!name) {

        input?.focus();


        visNotification(
            "Skriv et navn til det nye hold."
        );


        return;

    }


    await addTeam(
        name
    );


    if (input) {

        input.value =
            "";

    }


    renderTeamsDashboard();

}


/* =========================================================
   KONTO – DISPLAY DATA
========================================================= */

function getAccountDisplayData() {

    const user =
        session?.user ||
        null;


    const email =
        user?.email ||
        "";


    let name =
        user?.user_metadata?.full_name ||
        user?.user_metadata?.name ||
        "";


    if (
        !name &&
        email
    ) {

        name =
            email
                .split("@")[0]
                .replace(
                    /[._-]+/g,
                    " "
                )
                .trim()
                .split(" ")
                .filter(Boolean)
                .map(
                    word =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1)
                )
                .join(" ");

    }


    name =
        name ||
        "Bruger";


    const initials =
        name
            .split(/\s+/)
            .filter(Boolean)
            .slice(
                0,
                2
            )
            .map(
                part =>
                    part
                        .charAt(0)
                        .toUpperCase()
            )
            .join("") ||
        "U";


    return {

        name,
        email,
        initials

    };

}


/* =========================================================
   KONTOINDSTILLINGER – RENDER
========================================================= */

function renderAccountSettings() {

    const {
        name,
        email,
        initials
    } =
        getAccountDisplayData();


    const avatar =
        document.getElementById(
            "settingsAvatar"
        );


    const displayName =
        document.getElementById(
            "settingsDisplayName"
        );


    const profileEmail =
        document.getElementById(
            "settingsProfileEmail"
        );


    const nameInput =
        document.getElementById(
            "settingsNameInput"
        );


    const emailInput =
        document.getElementById(
            "settingsEmailInput"
        );


    if (avatar) {

        avatar.textContent =
            initials;

    }


    if (displayName) {

        displayName.textContent =
            name;

    }


    if (profileEmail) {

        profileEmail.textContent =
            email;

    }


    if (nameInput) {

        nameInput.value =
            name;

    }


    if (emailInput) {

        emailInput.value =
            email;

    }

}


/* =========================================================
   GEM PROFIL
========================================================= */

async function saveAccountProfile() {

    const input =
        document.getElementById(
            "settingsNameInput"
        );


    const fullName =
        input?.value?.trim();


    if (
        !session ||
        !fullName
    ) {

        visNotification(
            "Skriv dit navn først."
        );


        return;

    }


    try {

        const updatedUser =
            await supabaseRequest(
                "/auth/v1/user",
                {

                    method:
                        "PUT",

                    body:
                        JSON.stringify({

                            data: {

                                full_name:
                                    fullName

                            }

                        })

                }
            );


        session.user =
            updatedUser;


        setSession(
            session
        );


        updateAccountUI();

        renderAccountSettings();


        visNotification(
            "Profilen er opdateret."
        );

    } catch (error) {

        visNotification(
            "Kunne ikke gemme profilen: " +
            error.message
        );

    }

}


/* =========================================================
   SKIFT ADGANGSKODE
========================================================= */

async function changeAccountPassword() {

    const password =
        document.getElementById(
            "newPasswordInput"
        )?.value ||
        "";


    const confirmPassword =
        document.getElementById(
            "confirmPasswordInput"
        )?.value ||
        "";


    if (
        password.length < 6
    ) {

        visNotification(
            "Adgangskoden skal være mindst 6 tegn."
        );


        return;

    }


    if (
        password !==
        confirmPassword
    ) {

        visNotification(
            "Adgangskoderne er ikke ens."
        );


        return;

    }


    try {

        const updatedUser =
            await supabaseRequest(
                "/auth/v1/user",
                {

                    method:
                        "PUT",

                    body:
                        JSON.stringify({

                            password

                        })

                }
            );


        if (
            updatedUser?.id &&
            session
        ) {

            session.user =
                updatedUser;


            setSession(
                session
            );

        }


        const passwordInput =
            document.getElementById(
                "newPasswordInput"
            );


        const passwordConfirmInput =
            document.getElementById(
                "confirmPasswordInput"
            );


        if (passwordInput) {

            passwordInput.value =
                "";

        }


        if (passwordConfirmInput) {

            passwordConfirmInput.value =
                "";

        }


        visNotification(
            "Adgangskoden er ændret."
        );

    } catch (error) {

        visNotification(
            "Kunne ikke ændre adgangskode: " +
            error.message
        );

    }

}


/* =========================================================
   ACCOUNT MODALS – EVENTS
========================================================= */

function setupAccountModals() {

    const openTeams =
        document.getElementById(
            "myTeamsMenuButton"
        );


    const openSettings =
        document.getElementById(
            "accountSettingsMenuButton"
        );


    const openHelp =
        document.getElementById(
            "helpSupportMenuButton"
        );


    /* MINE HOLD */

    openTeams?.addEventListener(
        "click",
        () => {

            renderTeamsDashboard();

            openStart11Modal(
                "myTeamsModal"
            );

        }
    );


    /* KONTO */

    openSettings?.addEventListener(
        "click",
        () => {

            renderAccountSettings();

            openStart11Modal(
                "accountSettingsModal"
            );

        }
    );


    /* HJÆLP */

    openHelp?.addEventListener(
        "click",
        () => {

            openStart11Modal(
                "helpSupportModal"
            );

        }
    );


    /* LUK-KNAPPER */

    document
        .getElementById(
            "closeMyTeamsModal"
        )
        ?.addEventListener(
            "click",
            () =>
                closeStart11Modal(
                    "myTeamsModal"
                )
        );


    document
        .getElementById(
            "closeAccountSettingsModal"
        )
        ?.addEventListener(
            "click",
            () =>
                closeStart11Modal(
                    "accountSettingsModal"
                )
        );


    document
        .getElementById(
            "closeHelpSupportModal"
        )
        ?.addEventListener(
            "click",
            () =>
                closeStart11Modal(
                    "helpSupportModal"
                )
        );


    /* OPRET HOLD */

    document
        .getElementById(
            "createTeamFromDashboard"
        )
        ?.addEventListener(
            "click",
            createTeamFromDashboard
        );


    document
        .getElementById(
            "newTeamNameInput"
        )
        ?.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    createTeamFromDashboard();

                }

            }
        );


    /* GEM PROFIL */

    document
        .getElementById(
            "saveAccountProfileButton"
        )
        ?.addEventListener(
            "click",
            saveAccountProfile
        );


    /* ADGANGSKODE */

    document
        .getElementById(
            "changePasswordButton"
        )
        ?.addEventListener(
            "click",
            changeAccountPassword
        );


    /* LOG UD FRA KONTOINDSTILLINGER */

    document
        .getElementById(
            "settingsLogoutButton"
        )
        ?.addEventListener(
            "click",
            async () => {

                closeStart11Modal(
                    "accountSettingsModal"
                );


                await logout();

            }
        );


    /* FAQ */

    document
        .querySelectorAll(
            ".faq-item"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const answer =
                            button.nextElementSibling;


                        const open =
                            button.getAttribute(
                                "aria-expanded"
                            ) ===
                            "true";


                        button.setAttribute(
                            "aria-expanded",
                            String(
                                !open
                            )
                        );


                        const icon =
                            button.querySelector(
                                "i"
                            );


                        if (icon) {

                            icon.textContent =
                                open
                                    ? "+"
                                    : "−";

                        }


                        answer?.classList.toggle(
                            "open",
                            !open
                        );

                    }
                );

            }
        );


    /* SUPPORT */

    document
        .getElementById(
            "supportContactButton"
        )
        ?.addEventListener(
            "click",
            () => {

                visNotification(
                    "Supportfunktionen er klar til at få tilføjet din supportmail."
                );

            }
        );


    /* KLIK UDENFOR */

    window.addEventListener(
        "click",
        event => {

            [
                "myTeamsModal",
                "accountSettingsModal",
                "helpSupportModal"

            ].forEach(
                id => {

                    const modal =
                        document.getElementById(
                            id
                        );


                    if (
                        modal &&
                        event.target ===
                        modal
                    ) {

                        closeStart11Modal(
                            id
                        );

                    }

                }
            );

        }
    );


    /* ESC */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !==
                "Escape"
            ) {

                return;

            }


            [
                "myTeamsModal",
                "accountSettingsModal",
                "helpSupportModal"

            ].forEach(
                closeStart11Modal
            );

        }
    );

}

/* =========================================================
   LOGIN-KNAP
========================================================= */

const loginButton =
    document.getElementById(
        "loginButton"
    );


if (loginButton) {

    loginButton.addEventListener(
        "click",
        () => {

            showLogin();

        }
    );

}


/* =========================================================
   LOG UD-KNAP
========================================================= */

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        logout
    );

}



/* =========================================================
   LUK LOGIN MODAL
========================================================= */

const closeCloudLogin =
    document.getElementById(
        "closeCloudLogin"
    );


if (closeCloudLogin) {

    closeCloudLogin.addEventListener(
        "click",
        hideLogin
    );

}


/* =========================================================
   LOGIN SUBMIT
========================================================= */

const loginSubmit =
    document.getElementById(
        "loginSubmit"
    );


if (loginSubmit) {

    loginSubmit.addEventListener(
        "click",
        () => {

            loginOrSignup(
                "login"
            );

        }
    );

}


/* =========================================================
   OPRET KONTO
========================================================= */

const signupSubmit =
    document.getElementById(
        "signupSubmit"
    );


if (signupSubmit) {

    signupSubmit.addEventListener(
        "click",
        () => {

            loginOrSignup(
                "signup"
            );

        }
    );

}


/* =========================================================
   ENTER I LOGIN-FELTER
========================================================= */

[
    "loginEmail",
    "loginPassword"

].forEach(
    id => {

        const input =
            document.getElementById(
                id
            );


        if (!input) {

            return;

        }


        input.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    loginOrSignup(
                        "login"
                    );

                }

            }
        );

    }
);


/* =========================================================
   HOLDVÆLGER
========================================================= */

const teamSelector =
    document.getElementById(
        "teamSelector"
    );


if (teamSelector) {

    teamSelector.addEventListener(
        "change",
        event => {

            changeTeam(
                event.target.value
            );

        }
    );

}


/* =========================================================
   NYT HOLD
========================================================= */

const newTeamButton =
    document.getElementById(
        "newTeamButton"
    );


if (newTeamButton) {

    newTeamButton.addEventListener(
        "click",
        addTeam
    );

}


/* =========================================================
   SPILLER MODAL – LUK
========================================================= */

const closePlayerModal =
    document.getElementById(
        "closePlayerModal"
    );


if (closePlayerModal) {

    closePlayerModal.addEventListener(
        "click",
        lukPlayerModal
    );

}


/* =========================================================
   SPILLER MODAL – ANNULLER
========================================================= */

const cancelPlayerButton =
    document.getElementById(
        "cancelPlayerButton"
    );


if (cancelPlayerButton) {

    cancelPlayerButton.addEventListener(
        "click",
        lukPlayerModal
    );

}


/* =========================================================
   FJERN SPILLER KNAP
========================================================= */

const removePlayerButton =
    document.getElementById(
        "removePlayerButton"
    );


if (removePlayerButton) {

    removePlayerButton.addEventListener(
        "click",
        fjernSpiller
    );

}


/* =========================================================
   KAMPPLAN KNAP
========================================================= */

const settingsButton =
    document.getElementById(
        "settingsButton"
    );


if (settingsButton) {

    settingsButton.addEventListener(
        "click",
        åbnKampplan
    );

}


/* =========================================================
   KAMPPLAN – LUK
========================================================= */

const closeMatchplan =
    document.getElementById(
        "closeMatchplan"
    );


if (closeMatchplan) {

    closeMatchplan.addEventListener(
        "click",
        lukKampplan
    );

}


/* =========================================================
   KAMPPLAN – ANNULLER
========================================================= */

const cancelMatchplan =
    document.getElementById(
        "cancelMatchplan"
    );


if (cancelMatchplan) {

    cancelMatchplan.addEventListener(
        "click",
        lukKampplan
    );

}


/* =========================================================
   KAMPPLAN – GEM
========================================================= */

const saveMatchplan =
    document.getElementById(
        "saveMatchplan"
    );


if (saveMatchplan) {

    saveMatchplan.addEventListener(
        "click",
        gemKampplan
    );

}


/* =========================================================
   PDF KNAP
========================================================= */

const pdfButton =
    document.getElementById(
        "pdfButton"
    );


if (pdfButton) {

    pdfButton.addEventListener(
        "click",
        () => {

            /*
                Vi gemmer først, så PDF'en altid
                bruger den nyeste version.
            */

            gemAlt();


            lavPDF();

        }
    );

}


/* =========================================================
   UDSKIFTER KNAP
========================================================= */

const addSubstituteButton =
    document.getElementById(
        "addSubstituteButton"
    );


if (addSubstituteButton) {

    addSubstituteButton.addEventListener(
        "click",
        tilfoejUdskifter
    );

}

function tilfoejUdskifter() {

    currentPlayerSource =
        "substitute";


    currentSubstituteIndex =
        udskiftere.length;


    currentSlot =
        null;


    playerForm.reset();


    document.getElementById(
        "modalTitle"
    ).textContent =
        "Tilføj udskifter";


    document.getElementById(
        "playerNumber"
    ).value =
        "";


    playerModal.style.display =
        "flex";

}

/* =========================================================
   BILLEDE UPLOADS
========================================================= */

setupImageUpload(
    "homeLogoInput",
    "homeLogo",
    "homeLogo"
);


setupImageUpload(
    "awayLogoInput",
    "awayLogo",
    "awayLogo"
);


setupImageUpload(
    "backgroundInput",
    "backgroundImage",
    "background"
);


/* =========================================================
   FJERN HJEMMELOGO
========================================================= */

const removeHomeLogo =
    document.getElementById(
        "removeHomeLogo"
    );


if (removeHomeLogo) {

    removeHomeLogo.addEventListener(
        "click",
        () => {

            fjernBillede(
                "homeLogo"
            );

        }
    );

}


/* =========================================================
   FJERN UDELOGO
========================================================= */

const removeAwayLogo =
    document.getElementById(
        "removeAwayLogo"
    );


if (removeAwayLogo) {

    removeAwayLogo.addEventListener(
        "click",
        () => {

            fjernBillede(
                "awayLogo"
            );

        }
    );

}


/* =========================================================
   FJERN BAGGRUND
========================================================= */

const removeBackground =
    document.getElementById(
        "removeBackground"
    );


if (removeBackground) {

    removeBackground.addEventListener(
        "click",
        () => {

            fjernBillede(
                "background"
            );

        }
    );

}


/* =========================================================
   LUK MODAL VED KLIK PÅ BAGGRUNDEN
========================================================= */

window.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            playerModal
        ) {

            lukPlayerModal();

        }


        if (
            event.target ===
            matchplanModal
        ) {

            lukKampplan();

        }


        const loginModal =
            document.getElementById(
                "cloudLoginModal"
            );


        if (
            loginModal &&
            event.target ===
            loginModal
        ) {

            hideLogin();

        }

    }
);


/* =========================================================
   ESC LUKKER MODALS
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !==
            "Escape"
        ) {

            return;

        }


        if (
            playerModal &&
            playerModal.style.display ===
            "flex"
        ) {

            lukPlayerModal();

        }


        if (
            matchplanModal &&
            matchplanModal.style.display ===
            "flex"
        ) {

            lukKampplan();

        }


        const loginModal =
            document.getElementById(
                "cloudLoginModal"
            );


        if (
            loginModal &&
            loginModal.style.display ===
            "flex"
        ) {

            hideLogin();

        }

    }
);


/* =========================================================
   GEM INDEN SIDEN LUKKER
========================================================= */

window.addEventListener(
    "beforeunload",
    () => {

        /*
            localStorage gemmes synkront.

            Cloud-request kan browseren ikke garantere
            bliver færdig under beforeunload, derfor
            er localStorage vores fallback.
        */

        localStorage.setItem(
            "startopstillingSpillere",
            JSON.stringify(
                spillere
            )
        );


        localStorage.setItem(
            "startopstillingUdskiftere",
            JSON.stringify(
                udskiftere
            )
        );


        localStorage.setItem(
            "kampplan",
            JSON.stringify(
                kampplan
            )
        );


        localStorage.setItem(
            "start11Formation",
            formationSelector.value
        );

    }
);


/* =========================================================
   INITIALISERING
========================================================= */

async function initialiserStart11() {

    /*
        Sørg for at spillere altid har 11 pladser.
    */

    if (
        !Array.isArray(
            spillere
        )
    ) {

        spillere =
            Array(11).fill(
                null
            );

    }


    while (
        spillere.length < 11
    ) {

        spillere.push(
            null
        );

    }


    if (
        spillere.length > 11
    ) {

        spillere =
            spillere.slice(
                0,
                11
            );

    }


    /*
        Formation fra localStorage.
    */

    if (
        formationer[
            currentFormation
        ]
    ) {

        formationSelector.value =
            currentFormation;

    } else {

        currentFormation =
            "4-4-2";


        formationSelector.value =
            "4-4-2";

    }


    /*
        Tegn lokal version først.
        Det gør at appen starter hurtigt,
        også hvis cloud er langsom.
    */

    opdaterKampTitel();


    tegnOpstilling();


    opdaterUdskiftere();


    opdaterBilledePreview(
        "homeLogo",
        kampplan.homeLogo
    );


    opdaterBilledePreview(
        "awayLogo",
        kampplan.awayLogo
    );


    opdaterBilledePreview(
        "background",
        kampplan.backgroundImage
    );


    /*
        Cloud er valgfrit indtil URL og key
        er indsat.
    */

    if (
        !cloudConfigured
    ) {

        updateAccountUI();


        const status =
            document.getElementById(
                "cloudStatus"
            );


        if (status) {

            status.textContent =
                "Cloud ikke konfigureret";

        }


        console.info(
            "START11: Supabase er ikke konfigureret endnu."
        );


        return;

    }


    /*
        Se om der allerede ligger en session.
    */

    const loggedIn =
        await ensureSession();


    if (
        loggedIn
    ) {

        updateAccountUI();


        await loadCloudTeams();

    } else {

        updateAccountUI();


        /*
            Når cloud er konfigureret, men brugeren
            ikke er logget ind, viser vi login.
        */

        showLogin();

    }

}


