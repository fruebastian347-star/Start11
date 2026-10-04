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

function start11MatchDocumentPDF(){
 if(typeof window.start11V73RenderDocumentPages==="function"){
   const css=`<style>
   #pdfDocument .v73-a4{--v73-accent:var(--v24-accent,#82ff54);position:relative;box-sizing:border-box;width:210mm;height:297mm;overflow:hidden;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;background:radial-gradient(circle at 88% 12%,rgba(130,255,84,.10),transparent 30%),linear-gradient(145deg,#071009 0%,#0a140d 52%,#050a07 100%)!important;color:#fff!important;page-break-after:always}
   #pdfDocument .v73-top-rule{position:absolute;left:0;right:0;top:0;height:1.4mm;background:var(--v73-accent)}
   #pdfDocument .v73-watermark{position:absolute;right:-8mm;top:28mm;transform:rotate(90deg);font-size:38pt;font-weight:950;letter-spacing:3mm;color:rgba(255,255,255,.018)}
   #pdfDocument .v73-page-body{position:absolute;inset:13mm 14mm 16mm;overflow:hidden}
   #pdfDocument .v73-footer{position:absolute;left:14mm;right:14mm;bottom:6mm;display:flex;justify-content:space-between;border-top:.3mm solid #26362b;padding-top:2mm;color:#738078;font-size:6pt;font-weight:900}
   #pdfDocument .v73-h1{font-size:23pt;font-weight:950;line-height:1.08;margin:0 0 4mm}#pdfDocument .v73-h2{font-size:13pt;font-weight:900;color:var(--v73-accent);margin:4mm 0 2mm}#pdfDocument .v73-text{font-size:9pt;line-height:1.55;color:#e7eee8;margin:0 0 2.5mm;white-space:pre-wrap}
   #pdfDocument .v73-divider hr{border:0;border-top:.3mm solid #36533c;margin:4mm 0}
   #pdfDocument .v73-image{text-align:center;margin:3mm 0}#pdfDocument .v73-image img{max-width:100%;max-height:100mm;object-fit:contain;border-radius:2mm}#pdfDocument .v73-image figcaption{color:#8d9a90;font-size:6pt;margin-top:1.5mm}
   #pdfDocument .v73-video{display:grid;grid-template-columns:34mm 1fr;gap:4mm;align-items:center;padding:3mm;border:.3mm solid #31523a;border-radius:2mm;background:#0b170e;margin:3mm 0}#pdfDocument .v73-video img,#pdfDocument .v73-video-ph{width:34mm;height:19mm;object-fit:cover;border-radius:1.5mm;background:#102a17;display:grid;place-items:center;color:var(--v73-accent);font-size:16pt}#pdfDocument .v73-video b{display:block;font-size:8pt}#pdfDocument .v73-video small,#pdfDocument .v73-video a{display:block;margin-top:1mm;font-size:6pt;color:#87958b;overflow-wrap:anywhere}#pdfDocument .v73-video a{color:var(--v73-accent)}
   #pdfDocument .v73-situation{margin:3mm 0}
   </style>`;
   return css+window.start11V73RenderDocumentPages();
 }
 return "";
}

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



        ${start11MatchDocumentPDF()}


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




/* =========================================================
   START11 V52 – PERSONAL HERO COVER + AUTH GREETING
========================================================= */
(function(){
    if(window.__START11_V52_HERO__) return;
    window.__START11_V52_HERO__=true;

    const COVER_KEY="start11_v52_hero_cover";

    function notify(message){
        try{
            if(typeof visNotification==="function") visNotification(message);
        }catch(_){}
    }

    function getRealAccountName(){
        try{
            const user=session?.user || null;
            const raw=
                user?.user_metadata?.full_name ||
                user?.user_metadata?.name ||
                "";
            if(raw && String(raw).trim()) return String(raw).trim();

            const email=String(user?.email || "");
            if(email){
                return email.split("@")[0]
                    .replace(/[._-]+/g," ")
                    .trim()
                    .split(" ")
                    .filter(Boolean)
                    .map(word=>word.charAt(0).toUpperCase()+word.slice(1))
                    .join(" ");
            }
        }catch(_){}
        return "";
    }

    function enforceGreeting(){
        const el=document.getElementById("s34CoachName");
        const name=getRealAccountName();
        if(el && name && el.textContent!==name) el.textContent=name;
    }

    function savedCover(){
        try{return localStorage.getItem(COVER_KEY)||""}catch(_){return ""}
    }

    function applyCover(dataUrl=savedCover()){
        const hero=document.getElementById("s52Hero");
        const photo=document.getElementById("s52HeroPhoto");
        const preview=document.getElementById("s52CoverPreview");
        if(hero && photo){
            if(dataUrl){
                photo.style.backgroundImage=`url("${dataUrl}")`;
                hero.classList.add("s52-has-photo");
            }else{
                photo.style.backgroundImage="";
                hero.classList.remove("s52-has-photo");
            }
        }
        if(preview){
            preview.classList.toggle("has-image",!!dataUrl);
            preview.style.backgroundImage=dataUrl?`url("${dataUrl}")`:"";
        }
    }

    function compressImage(file){
        return new Promise((resolve,reject)=>{
            const reader=new FileReader();
            reader.onerror=()=>reject(new Error("Kunne ikke læse billedet."));
            reader.onload=()=>{
                const img=new Image();
                img.onerror=()=>reject(new Error("Billedformatet kunne ikke læses."));
                img.onload=()=>{
                    const maxW=1800,maxH=700;
                    const scale=Math.min(1,maxW/img.width,maxH/img.height);
                    const w=Math.max(1,Math.round(img.width*scale));
                    const h=Math.max(1,Math.round(img.height*scale));
                    const canvas=document.createElement("canvas");
                    canvas.width=w;canvas.height=h;
                    const ctx=canvas.getContext("2d");
                    ctx.drawImage(img,0,0,w,h);
                    resolve(canvas.toDataURL("image/jpeg",.78));
                };
                img.src=reader.result;
            };
            reader.readAsDataURL(file);
        });
    }

    async function chooseCover(file){
        if(!file) return;
        if(!/^image\/(jpeg|png|webp)$/i.test(file.type||"")){
            notify("Vælg et JPG-, PNG- eller WebP-billede.");
            return;
        }
        try{
            const data=await compressImage(file);
            localStorage.setItem(COVER_KEY,data);
            applyCover(data);
            notify("Dashboard-billedet er gemt.");
        }catch(error){
            console.warn("START11 cover:",error);
            notify("Billedet kunne ikke gemmes. Prøv et mindre billede.");
        }
    }

    function bind(){
        applyCover();
        enforceGreeting();

        const choose=document.getElementById("s52CoverChoose");
        const input=document.getElementById("s52CoverInput");
        const remove=document.getElementById("s52CoverRemove");

        if(choose && !choose.dataset.s52Bound){
            choose.dataset.s52Bound="1";
            choose.addEventListener("click",()=>input?.click());
        }
        if(input && !input.dataset.s52Bound){
            input.dataset.s52Bound="1";
            input.addEventListener("change",async()=>{
                await chooseCover(input.files?.[0]);
                input.value="";
            });
        }
        if(remove && !remove.dataset.s52Bound){
            remove.dataset.s52Bound="1";
            remove.addEventListener("click",()=>{
                try{localStorage.removeItem(COVER_KEY)}catch(_){}
                applyCover("");
                notify("Dashboard-billedet er fjernet.");
            });
        }

        /* Other dashboard modules can refresh the hero with team data.
           Keep the greeting tied to the authenticated user instead. */
        const greeting=document.getElementById("s34CoachName");
        if(greeting && !greeting.dataset.s52Observed){
            greeting.dataset.s52Observed="1";
            new MutationObserver(enforceGreeting).observe(greeting,{
                childList:true,
                characterData:true,
                subtree:true
            });
        }
    }

    if(document.readyState==="loading"){
        document.addEventListener("DOMContentLoaded",()=>setTimeout(bind,120),{once:true});
    }else{
        setTimeout(bind,120);
    }
    setTimeout(bind,900);
})();


/* =========================================================
   START11 V71 – FREEFORM MATCH DOCUMENT
   Replaces the rigid tactical text form with a free document
   editor. Match metadata, logos, lineup and existing PDF pages
   remain compatible with the rest of START11.
========================================================= */
(function start11V71FreeMatchDocument(){
"use strict";
if(window.__START11_V71_MATCHDOC__)return;
window.__START11_V71_MATCHDOC__=true;

const q=s=>document.querySelector(s);
const E=v=>typeof escapeHTML==="function"?escapeHTML(String(v??"")):String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const id=()=>"md_"+Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const data=()=>{
  if(typeof kampplan==="undefined")return[];
  if(!Array.isArray(kampplan.documentBlocks))kampplan.documentBlocks=[];
  return kampplan.documentBlocks;
};
function touch(){
 try{localStorage.setItem("kampplan",JSON.stringify(kampplan))}catch(_){}
 try{if(typeof gemAlt==="function")gemAlt()}catch(_){}
}
function migrate(){
 /* V72: Intet fast indhold migreres automatisk. Kampdokumentet er frit. */
 data();
}
function clips(){
 try{
  const ps=typeof s13Data!=="undefined"&&Array.isArray(s13Data?.videoProjects)?s13Data.videoProjects:[];
  return ps.flatMap(p=>(p.clips||[]).map(c=>({key:String(p.id)+"::"+String(c.id),title:c.title||"Klip",project:p.title||"Kampanalyse",url:p.videoUrl||p.url||"",startSec:Number(c.startSec)||0,endSec:Number(c.endSec)||0})));
 }catch(_){return[]}
}
function fmt(sec){sec=Math.max(0,Number(sec)||0);const m=Math.floor(sec/60),s=Math.floor(sec%60);return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`}

function css(){
 if(q("#s71css"))return;
 const st=document.createElement("style");st.id="s71css";st.textContent=`
 #s71EditorSection{border:1px solid #203c26!important;background:#071009!important}
 .s71-head{display:flex;align-items:end;justify-content:space-between;gap:14px;margin-bottom:10px}.s71-head h3{margin:0!important}.s71-head p{margin:3px 0 0;color:#829087;font-size:10px}
 .s71-toolbar{position:sticky;top:0;z-index:20;display:flex;flex-wrap:wrap;gap:6px;padding:8px;background:#0a150c;border:1px solid #203c26;border-radius:8px;margin-bottom:9px}
 .s71-toolbar button{border:1px solid #31563a;background:#0c1a10;color:#eaf1eb;border-radius:6px;padding:7px 9px;font:inherit;font-size:9px;font-weight:900;cursor:pointer}.s71-toolbar button:hover{border-color:var(--s11-primary,#82ff54);color:var(--s11-primary,#82ff54)}
 #s71Doc{min-height:360px;padding:18px;background:#0a0f0b;border:1px solid #203c26;border-radius:8px}
 .s71-empty{display:grid;place-items:center;min-height:280px;text-align:center;color:#647168;font-size:11px}.s71-empty b{display:block;color:#c8d1ca;font-size:14px;margin-bottom:5px}
 .s71-block{position:relative;padding:8px 42px 8px 8px;border:1px solid transparent;border-radius:7px;margin:3px 0}.s71-block:hover,.s71-block:focus-within{border-color:#25442c;background:#0c160e}
 .s71-edit{outline:0;white-space:pre-wrap;min-height:22px;color:#eaf0eb}.s71-h1 .s71-edit{font-size:25px;font-weight:950;line-height:1.15}.s71-h2 .s71-edit{font-size:16px;font-weight:900;line-height:1.2;color:var(--s11-primary,#82ff54)}.s71-text .s71-edit{font-size:12px;line-height:1.65}
 .s71-actions{position:absolute;right:5px;top:5px;display:none;gap:2px}.s71-block:hover .s71-actions,.s71-block:focus-within .s71-actions{display:flex}.s71-actions button{width:25px;height:25px;padding:0;border:1px solid #294831;border-radius:5px;background:#071009;color:#9eaaa1;cursor:pointer;font-size:10px}.s71-actions button:hover{color:#fff;border-color:#82ff54}
 .s71-image img{display:block;max-width:100%;max-height:430px;object-fit:contain;border-radius:7px;margin:auto}.s71-caption{width:100%;box-sizing:border-box;margin-top:6px;background:transparent;border:0;border-bottom:1px solid #243b29;color:#b7c2ba;padding:5px;text-align:center;font:inherit;font-size:9px;outline:0}
 .s71-video-card{display:grid;grid-template-columns:54px 1fr auto;align-items:center;gap:10px;padding:10px;border:1px solid #27482f;border-radius:8px;background:#08150c}.s71-video-icon{width:54px;height:38px;border-radius:6px;background:#102a17;display:grid;place-items:center;color:#82ff54;font-size:17px}.s71-video-card b{font-size:11px}.s71-video-card small{display:block;color:#78877c;margin-top:3px}.s71-video-card a{color:#82ff54;font-size:9px;font-weight:900;text-decoration:none}
 .s71-video-edit{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:7px}.s71-video-edit input,.s71-video-edit select{width:100%;box-sizing:border-box;background:#071009;border:1px solid #294831;border-radius:5px;color:#fff;padding:7px;font:inherit;font-size:9px}
 .s71-divider{border:0;border-top:1px solid #315239;margin:12px 0}
 .s71-hiddenLegacy{display:none!important}
 @media(max-width:700px){.s71-video-edit{grid-template-columns:1fr}.s71-toolbar{position:static}}
 `;document.head.appendChild(st);
}
function actions(i){return `<div class="s71-actions"><button data-up="${i}" title="Flyt op">↑</button><button data-down="${i}" title="Flyt ned">↓</button><button data-del="${i}" title="Slet">×</button></div>`}
function render(){
 const host=q("#s71Doc");if(!host)return;const a=data();
 if(!a.length){host.innerHTML=`<div class="s71-empty"><div><b>Start med et tomt kampdokument</b>Tilføj overskrifter, tekst, billeder og video ovenfor.</div></div>`;return}
 const lib=clips();
 host.innerHTML=a.map((b,i)=>{
  if(b.type==="h1"||b.type==="h2"||b.type==="text")return `<div class="s71-block s71-${b.type}" data-i="${i}">${actions(i)}<div class="s71-edit" contenteditable="true" data-text="${i}" data-ph="Skriv her…">${E(b.text||"")}</div></div>`;
  if(b.type==="image")return `<div class="s71-block s71-image" data-i="${i}">${actions(i)}<img src="${E(b.src||"")}" alt=""><input class="s71-caption" data-caption="${i}" value="${E(b.caption||"")}" placeholder="Billedtekst (valgfri)"></div>`;
  if(b.type==="divider")return `<div class="s71-block" data-i="${i}">${actions(i)}<hr class="s71-divider"></div>`;
  if(b.type==="video"){
   const chosen=lib.find(x=>x.key===b.clipKey);const title=b.title||chosen?.title||"Video";const url=b.url||chosen?.url||"";const meta=chosen?`${chosen.project} · ${fmt(chosen.startSec)}–${fmt(chosen.endSec)}`:(url?"Eksternt videolink":"Vælg klip eller indsæt link");
   return `<div class="s71-block" data-i="${i}">${actions(i)}<div class="s71-video-card"><div class="s71-video-icon">▶</div><div><b>${E(title)}</b><small>${E(meta)}</small></div>${url?`<a href="${E(url)}" target="_blank" rel="noopener">ÅBN ↗</a>`:""}</div><div class="s71-video-edit"><input data-vtitle="${i}" value="${E(b.title||"")}" placeholder="Videotitel"><select data-vclip="${i}"><option value="">Vælg fra Videobibliotek…</option>${lib.map(x=>`<option value="${E(x.key)}" ${x.key===b.clipKey?"selected":""}>${E(x.project+" · "+x.title)}</option>`).join("")}</select><input data-vurl="${i}" value="${E(b.url||"")}" placeholder="Eller indsæt videolink"></div></div>`;
  }
  return "";
 }).join("");
 bindBlocks();
}
function saveField(i,k,v){const b=data()[i];if(!b)return;b[k]=v;touch()}
function bindBlocks(){
 q("#s71Doc")?.querySelectorAll("[data-text]").forEach(el=>el.oninput=()=>saveField(+el.dataset.text,"text",el.innerText));
 q("#s71Doc")?.querySelectorAll("[data-caption]").forEach(el=>el.oninput=()=>saveField(+el.dataset.caption,"caption",el.value));
 q("#s71Doc")?.querySelectorAll("[data-vtitle]").forEach(el=>el.oninput=()=>saveField(+el.dataset.vtitle,"title",el.value));
 q("#s71Doc")?.querySelectorAll("[data-vurl]").forEach(el=>el.onchange=()=>{saveField(+el.dataset.vurl,"url",el.value.trim());render()});
 q("#s71Doc")?.querySelectorAll("[data-vclip]").forEach(el=>el.onchange=()=>{const i=+el.dataset.vclip,b=data()[i];if(b){b.clipKey=el.value;const c=clips().find(x=>x.key===el.value);if(c&&!b.title)b.title=c.title;touch();render()}});
 q("#s71Doc")?.querySelectorAll("[data-del]").forEach(el=>el.onclick=()=>{data().splice(+el.dataset.del,1);touch();render()});
 q("#s71Doc")?.querySelectorAll("[data-up]").forEach(el=>el.onclick=()=>{const i=+el.dataset.up;if(i<1)return;const a=data();[a[i-1],a[i]]=[a[i],a[i-1]];touch();render()});
 q("#s71Doc")?.querySelectorAll("[data-down]").forEach(el=>el.onclick=()=>{const i=+el.dataset.down,a=data();if(i>=a.length-1)return;[a[i+1],a[i]]=[a[i],a[i+1]];touch();render()});
}
function add(type,extra={}){data().push({id:id(),type,text:"",...extra});touch();render();setTimeout(()=>q(`#s71Doc .s71-block:last-child .s71-edit`)?.focus(),0)}
function imageUpload(){const inp=document.createElement("input");inp.type="file";inp.accept="image/*";inp.onchange=()=>{const f=inp.files?.[0];if(!f)return;const im=new Image(),u=URL.createObjectURL(f);im.onload=()=>{const max=1600,scale=Math.min(1,max/Math.max(im.width,im.height)),cv=document.createElement("canvas");cv.width=Math.round(im.width*scale);cv.height=Math.round(im.height*scale);cv.getContext("2d").drawImage(im,0,0,cv.width,cv.height);URL.revokeObjectURL(u);add("image",{src:cv.toDataURL("image/jpeg",.86),caption:""})};im.src=u};inp.click()}
function install(){
 css();const modal=q("#matchplanModal .matchplan-modal")||q("#matchplanModal .modal-content")||q("#matchplanModal");
 if(!modal||q("#s71EditorSection"))return;
 migrate();
 const legacyIds=["practicalInfo","matchProgram","teamWithBall","teamWithoutBall","coachMessage"];
 legacyIds.forEach(x=>q("#"+x)?.closest(".form-section")?.classList.add("s71-hiddenLegacy"));
 const section=document.createElement("div");section.id="s71EditorSection";section.className="form-section";
 section.innerHTML=`<div class="s71-head"><div><h3>📝 KAMPDOKUMENT</h3><p>Byg kampplanen frit – som et dokument. Intet indhold er obligatorisk.</p></div></div><div class="s71-toolbar"><button data-add="h1">+ STOR OVERSKRIFT</button><button data-add="h2">+ OVERSKRIFT</button><button data-add="text">+ TEKST</button><button id="s71Image">+ BILLEDE</button><button data-add="video">+ VIDEO</button><button data-add="divider">+ SKILLELINJE</button></div><div id="s71Doc"></div>`;
 const save=q("#saveMatchplan")||q(".save-matchplan");
 const anchor=q("#coachMessage")?.closest(".form-section")||q("#coachMessage")?.parentElement;
 if(anchor?.parentNode)anchor.insertAdjacentElement("afterend",section);
 else if(save?.parentNode)save.parentNode.insertBefore(section,save);
 else modal.appendChild(section);
 section.querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>add(b.dataset.add));q("#s71Image").onclick=imageUpload;render();
}

/* Keep editor in sync whenever KAMPPLAN opens. */
const oldOpen=typeof åbnKampplan==="function"?åbnKampplan:null;
if(oldOpen){åbnKampplan=function(){const r=oldOpen.apply(this,arguments);install();migrate();render();return r}}
const oldSave=typeof gemKampplan==="function"?gemKampplan:null;
if(oldSave){gemKampplan=function(){touch();return oldSave.apply(this,arguments)}}

/* Replace only the rigid content pages in the existing PDF. Cover, lineup,
   player pages and later tactical-situation PDF extensions stay intact. */

const begin=()=>{install();migrate()};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(begin,100),{once:true});else setTimeout(begin,100);
new MutationObserver(()=>{if(q("#matchplanModal")&&!q("#s71EditorSection"))install()}).observe(document.documentElement,{childList:true,subtree:true});
window.START11_BUILD="V71-FREEFORM-MATCH-DOCUMENT";
console.info("START11 loaded:",window.START11_BUILD);
})();

window.START11_BUILD="V72-DIRECT-FREEFORM-PDF";
console.info("START11 loaded:",window.START11_BUILD);



/* =========================================================
   START11 V73 – A4 KAMPPLAN BUILDER
   A4 editor + shared document/PDF page model.
========================================================= */
(function start11V73A4Builder(){
"use strict";
if(window.__START11_V73_A4_BUILDER__)return;
window.__START11_V73_A4_BUILDER__=true;

const Q=s=>document.querySelector(s);
const esc=v=>typeof escapeHTML==="function"?escapeHTML(String(v??"")):String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const uid=()=>`v73_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`;
const blocks=()=>{if(!Array.isArray(kampplan.documentBlocks))kampplan.documentBlocks=[];return kampplan.documentBlocks};
const save=()=>{try{if(typeof gemAlt==="function")gemAlt()}catch(_){}};

function clips(){
 try{
  const ps=typeof s13Data!=="undefined"&&Array.isArray(s13Data?.videoProjects)?s13Data.videoProjects:[];
  return ps.flatMap(p=>(p.clips||[]).map(c=>({
   key:String(p.id)+"::"+String(c.id),title:c.title||"Klip",project:p.title||"Kampanalyse",
   url:c.url||p.videoUrl||p.url||"",thumb:c.thumbnail||c.thumbnailUrl||p.thumbnail||p.thumbnailUrl||"",
   startSec:Number(c.startSec)||0,endSec:Number(c.endSec)||0
  })));
 }catch(_){return[]}
}
function fmt(sec){sec=Math.max(0,Number(sec)||0);return `${String(Math.floor(sec/60)).padStart(2,"0")}:${String(Math.floor(sec%60)).padStart(2,"0")}`}

function pages(){
 const out=[[]];
 blocks().forEach(b=>{
  if(b.type==="pagebreak"){if(out[out.length-1].length)out.push([]);return}
  out[out.length-1].push(b);
 });
 return out.length?out:[[]];
}
function blockHtml(b,editor=false){
 const lib=clips();
 if(b.type==="h1")return `<div class="v73-block v73-h1" data-id="${esc(b.id)}"><div class="v73-edit" ${editor?'contenteditable="true"':""} data-field="text">${esc(b.text||"")}</div></div>`;
 if(b.type==="h2")return `<div class="v73-block v73-h2" data-id="${esc(b.id)}"><div class="v73-edit" ${editor?'contenteditable="true"':""} data-field="text">${esc(b.text||"")}</div></div>`;
 if(b.type==="text")return `<div class="v73-block v73-text" data-id="${esc(b.id)}"><div class="v73-edit" ${editor?'contenteditable="true"':""} data-field="text">${esc(b.text||"").replace(/\n/g,"<br>")}</div></div>`;
 if(b.type==="divider")return `<div class="v73-block v73-divider" data-id="${esc(b.id)}"><hr></div>`;
 if(b.type==="image")return `<figure class="v73-block v73-image" data-id="${esc(b.id)}"><img src="${esc(b.src||"")}" alt=""><figcaption ${editor?'contenteditable="true"':""} data-field="caption">${esc(b.caption||"")}</figcaption></figure>`;
 if(b.type==="video"){
  const c=lib.find(x=>x.key===b.clipKey), title=b.title||c?.title||"Video", url=b.url||c?.url||"", thumb=b.thumb||c?.thumb||"";
  return `<div class="v73-block v73-video" data-id="${esc(b.id)}">${thumb?`<img src="${esc(thumb)}" alt="">`:`<div class="v73-video-ph">▶</div>`}<div><b>${esc(title)}</b><small>${c?esc(c.project+" · "+fmt(c.startSec)+"–"+fmt(c.endSec)):"VIDEO"}</small>${url?`<a href="${esc(url)}" target="_blank" rel="noopener">${esc(url)}</a>`:""}</div></div>`;
 }
 if(b.type==="situation"){
  if(typeof window.s73RenderSituationBlock==="function")return `<div class="v73-block v73-situation" data-id="${esc(b.id)}">${window.s73RenderSituationBlock(b.situationId,editor?"editor":"pdf")}</div>`;
  return `<div class="v73-block v73-missing" data-id="${esc(b.id)}">Kampsituation kan ikke indlæses endnu.</div>`;
 }
 return "";
}
function pageHtml(list,index,editor=false){
 const controls=editor?`<div class="v73-page-label">SIDE ${index+3}</div>`:"";
 return `<section class="${editor?"v73-a4 is-editor":"pdf-page v24-page v73-a4 is-pdf"}" data-page="${index}"><div class="v73-top-rule"></div>${controls}<div class="v73-watermark">START11</div><div class="v73-page-body">${list.map(b=>editor?editorBlock(b):blockHtml(b,false)).join("")}</div><div class="v73-footer"><span>START11 · KAMPDOKUMENT</span><span>${String(index+3).padStart(2,"0")}</span></div></section>`;
}
function editorBlock(b){
 return `<div class="v73-editwrap" data-wrap="${esc(b.id)}">${blockHtml(b,true)}<div class="v73-actions"><button data-up="${esc(b.id)}">↑</button><button data-down="${esc(b.id)}">↓</button><button data-del="${esc(b.id)}">×</button></div></div>`;
}
function styles(){
 if(Q("#v73styles"))return;
 const st=document.createElement("style");st.id="v73styles";st.textContent=`
 #s71EditorSection{display:none!important}
 #v73EditorSection{margin:14px 0;padding:12px;border:1px solid #294a31;border-radius:10px;background:#061008;color:#fff}
 .v73-head{display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:10px}.v73-head h3{margin:0}.v73-head small{display:block;color:#819087;margin-top:3px}
 .v73-toolbar{position:sticky;top:0;z-index:30;display:flex;gap:6px;flex-wrap:wrap;padding:8px;border:1px solid #294a31;border-radius:8px;background:#09150c;margin-bottom:14px}
 .v73-toolbar button,.v73-toggle{padding:7px 9px;border:1px solid #31563a;border-radius:6px;background:#0c1a10;color:#edf3ee;font:inherit;font-size:9px;font-weight:900}.v73-toolbar button{cursor:pointer}.v73-toolbar button:hover{border-color:var(--s11-primary,#82ff54)}
 .v73-toggle{margin-left:auto;display:flex;align-items:center;gap:6px}
 #v73Pages{display:grid;gap:20px;justify-items:center;padding:12px;background:#030805;border-radius:9px}
 .v73-a4{--v73-accent:var(--s11-primary,#82ff54);position:relative;box-sizing:border-box;width:min(100%,794px);aspect-ratio:210/297;overflow:hidden;background:radial-gradient(circle at 88% 12%,color-mix(in srgb,var(--v73-accent) 11%,transparent),transparent 30%),linear-gradient(145deg,#071009 0%,#0a140d 52%,#050a07 100%);color:#fff}
 .v73-a4.is-editor{box-shadow:0 12px 38px #0009;border:1px solid #233b29}
 .v73-top-rule{position:absolute;left:0;right:0;top:0;height:5px;background:var(--v73-accent)}
 .v73-watermark{position:absolute;right:-30px;top:95px;transform:rotate(90deg);font-size:56px;font-weight:950;letter-spacing:10px;color:#fff;opacity:.018;pointer-events:none}
 .v73-page-label{position:absolute;right:18px;top:16px;color:#718078;font-size:9px;font-weight:950;letter-spacing:1px}
 .v73-page-body{position:absolute;inset:42px 52px 48px;overflow:hidden}
 .v73-footer{position:absolute;left:52px;right:52px;bottom:20px;display:flex;justify-content:space-between;border-top:1px solid #26362b;padding-top:8px;color:#738078;font-size:8px;font-weight:900;letter-spacing:.8px}
 .v73-editwrap{position:relative;margin:0 0 7px;padding-right:34px;border:1px solid transparent;border-radius:7px}.v73-editwrap:hover,.v73-editwrap:focus-within{border-color:#294a31;background:#0b160e}
 .v73-actions{position:absolute;right:3px;top:3px;display:none;gap:2px}.v73-editwrap:hover .v73-actions,.v73-editwrap:focus-within .v73-actions{display:grid}
 .v73-actions button{width:26px;height:22px;border:1px solid #31563a;background:#071009;color:#a8b3aa;border-radius:4px;cursor:pointer}
 .v73-block{position:relative}.v73-edit{outline:0;white-space:pre-wrap}
 .v73-h1{font-size:30px;font-weight:950;line-height:1.08;margin:0 0 14px}.v73-h2{font-size:18px;font-weight:900;color:var(--v73-accent);margin:14px 0 7px}.v73-text{font-size:12px;line-height:1.55;color:#e7eee8;margin:0 0 9px}
 .v73-divider hr{border:0;border-top:1px solid #36533c;margin:14px 0}
 .v73-image{margin:10px 0;text-align:center}.v73-image img{max-width:100%;max-height:360px;object-fit:contain;border-radius:7px}.v73-image figcaption{outline:0;color:#8d9a90;font-size:9px;margin-top:5px}
 .v73-video{display:grid;grid-template-columns:120px 1fr;gap:12px;align-items:center;padding:10px;border:1px solid #31523a;border-radius:8px;background:#0b170e;margin:9px 0}.v73-video img,.v73-video-ph{width:120px;height:68px;object-fit:cover;border-radius:6px;background:#102a17;display:grid;place-items:center;color:var(--v73-accent);font-size:24px}.v73-video b{display:block}.v73-video small,.v73-video a{display:block;margin-top:4px;font-size:9px;color:#87958b;overflow-wrap:anywhere}.v73-video a{color:var(--v73-accent)}
 .v73-situation{margin:10px 0}.v73-missing{padding:12px;border:1px dashed #7b4b4b;color:#c99}
 .v73-overflow .v73-page-body{outline:2px solid #ff5d5d}.v73-overflow:after{content:"SIDEN ER FOR FULD";position:absolute;right:16px;bottom:50px;color:#ff7777;font-size:9px;font-weight:950}
 .v73-situation-picker{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;background:#000c;padding:18px}.v73-picker-card{width:min(620px,95vw);max-height:80vh;overflow:auto;background:#071009;border:1px solid #31563a;border-radius:10px;padding:12px}.v73-picker-row{display:flex;justify-content:space-between;gap:8px;align-items:center;padding:9px;border-bottom:1px solid #1f3324}
 @media(max-width:700px){.v73-page-body{inset:34px 28px 42px}.v73-footer{left:28px;right:28px}.v73-toggle{margin-left:0}.v73-video{grid-template-columns:80px 1fr}.v73-video img,.v73-video-ph{width:80px;height:48px}}
 `;document.head.appendChild(st);
}
function findBlock(id){return blocks().find(x=>String(x.id)===String(id))}
function touchAndRender(){save();render()}
function bind(){
 const root=Q("#v73Pages");if(!root)return;
 root.querySelectorAll("[data-field]").forEach(el=>el.oninput=()=>{const b=findBlock(el.closest("[data-id]")?.dataset.id);if(!b)return;b[el.dataset.field]=el.innerText;save();checkOverflow()});
 root.querySelectorAll("[data-del]").forEach(x=>x.onclick=()=>{const a=blocks(),i=a.findIndex(b=>String(b.id)===String(x.dataset.del));if(i>=0){a.splice(i,1);touchAndRender()}});
 root.querySelectorAll("[data-up]").forEach(x=>x.onclick=()=>move(x.dataset.up,-1));
 root.querySelectorAll("[data-down]").forEach(x=>x.onclick=()=>move(x.dataset.down,1));
}
function move(id,dir){const a=blocks(),i=a.findIndex(b=>String(b.id)===String(id)),j=i+dir;if(i<0||j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];touchAndRender()}
function add(type,extra={}){
 const a=blocks();
 if(type==="pagebreak" && (!a.length||a[a.length-1]?.type==="pagebreak"))return;
 a.push({id:uid(),type,text:"",...extra});touchAndRender();
}
function uploadImage(){const i=document.createElement("input");i.type="file";i.accept="image/*";i.onchange=()=>{const f=i.files?.[0];if(!f)return;const im=new Image(),u=URL.createObjectURL(f);im.onload=()=>{const max=1800,s=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext("2d").drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);add("image",{src:c.toDataURL("image/jpeg",.88),caption:""})};im.src=u};i.click()}
function addVideo(){const lib=clips(),a=blocks();const opts=lib.map((x,i)=>`${i+1}. ${x.project} · ${x.title}`).join("\n");const n=opts?prompt("Vælg videoklip med nummer, eller tryk Annuller for eksternt link:\n\n"+opts,"1"):null;if(n!==null&&lib[Number(n)-1]){const c=lib[Number(n)-1];add("video",{clipKey:c.key,title:c.title,url:c.url,thumb:c.thumb});return}const url=prompt("Videolink:","");if(url?.trim())add("video",{title:prompt("Titel:","Video")||"Video",url:url.trim(),thumb:""})}
function pickSituation(){
 const list=typeof window.s73GetMatchSituations==="function"?window.s73GetMatchSituations():[];
 if(!list.length){if(typeof visNotification==="function")visNotification("Opret først en kampsituation.");return}
 Q("#v73SituationPicker")?.remove();const ov=document.createElement("div");ov.id="v73SituationPicker";ov.className="v73-situation-picker";
 ov.innerHTML=`<div class="v73-picker-card"><div style="display:flex;justify-content:space-between;align-items:center"><b>VÆLG KAMPSITUATION</b><button class="s13btn" data-close>LUK</button></div>${list.map(s=>`<div class="v73-picker-row"><div><b>${esc(s.title)}</b><small style="display:block;color:#7f8d83">${esc(s.focus||"")}</small></div><button class="s13btn primary" data-sit="${esc(s.id)}">INDSÆT</button></div>`).join("")}</div>`;
 document.body.appendChild(ov);ov.querySelector("[data-close]").onclick=()=>ov.remove();ov.querySelectorAll("[data-sit]").forEach(b=>b.onclick=()=>{add("situation",{situationId:b.dataset.sit});ov.remove()});
}
function checkOverflow(){
 Q("#v73Pages")?.querySelectorAll(".v73-a4").forEach(p=>{const body=p.querySelector(".v73-page-body");p.classList.toggle("v73-overflow",body.scrollHeight>body.clientHeight+2)});
}
function render(){
 const host=Q("#v73Pages");if(!host)return;host.innerHTML=pages().map((p,i)=>pageHtml(p,i,true)).join("");bind();requestAnimationFrame(checkOverflow)
}
function install(){
 styles();const modal=Q("#matchplanModal .matchplan-modal")||Q("#matchplanModal .modal-content")||Q("#matchplanModal");if(!modal)return;
 Q("#s71EditorSection")?.classList.add("s71-hiddenLegacy");
 let sec=Q("#v73EditorSection");
 if(!sec){
  sec=document.createElement("section");sec.id="v73EditorSection";
  sec.innerHTML=`<div class="v73-head"><div><h3>KAMPPLAN BUILDER</h3><small>Side 1 er forsiden · Side 2 er startopstillingen · byg side 3+ her.</small></div></div>
  <div class="v73-toolbar"><button data-add="h1">+ STOR OVERSKRIFT</button><button data-add="h2">+ OVERSKRIFT</button><button data-add="text">+ TEKST</button><button data-image>+ BILLEDE</button><button data-video>+ VIDEO</button><button data-situation>+ KAMPSITUATION</button><button data-add="divider">+ SKILLELINJE</button><button data-add="pagebreak">+ SIDESKIFT</button><label class="v73-toggle"><input type="checkbox" id="v73Players"> MEDTAG SPILLERPLANER</label></div><div id="v73Pages"></div>`;
  const saveBtn=Q("#saveMatchplan")||Q(".save-matchplan");if(saveBtn?.parentNode)saveBtn.parentNode.insertBefore(sec,saveBtn);else modal.appendChild(sec);
  sec.querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>add(b.dataset.add));sec.querySelector("[data-image]").onclick=uploadImage;sec.querySelector("[data-video]").onclick=addVideo;sec.querySelector("[data-situation]").onclick=pickSituation;
  sec.querySelector("#v73Players").checked=kampplan.includePlayerPlans!==false;sec.querySelector("#v73Players").onchange=e=>{kampplan.includePlayerPlans=e.target.checked;save()};
 }
 render();
}
window.start11V73RenderDocumentPages=()=>pages().map((p,i)=>pageHtml(p,i,false)).join("");
const begin=()=>setTimeout(install,40);
document.addEventListener("click",e=>{if(e.target.closest?.("#openCurrentMatchButton,#editMatchPlanShortcut,#editMatchInfoBottom,#editTacticsBottom,#s19MatchPlanButton"))begin()},true);
new MutationObserver(()=>{
 const m=Q("#matchplanModal");
 if(m && getComputedStyle(m).display!=="none" && !Q("#v73EditorSection")) install();
}).observe(document.documentElement,{subtree:true,childList:true});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",begin,{once:true});else begin();
window.START11_BUILD="V73.2-A4-PDF-VISUAL-FIX";
console.info("START11 loaded:",window.START11_BUILD);
})();

