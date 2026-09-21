    modal.className =
        "modal start11-account-modal start11-v8-club-modal";


    modal.innerHTML = `
        <div class="modal-content start11-account-panel start11-v8-club-team-panel">

            <button
                type="button"
                class="close-button"
                id="start11CloseClubTeamModalV8"
            >×</button>

            <div class="start11-modal-heading">
                <div>
                    <span
                        class="start11-eyebrow"
                        id="start11ClubTeamEyebrowV8"
                    >
                        START11
                    </span>

                    <h2
                        id="start11ClubTeamTitleV8"
                    >
                        TILFØJ KLUB
                    </h2>

                    <p
                        id="start11ClubTeamDescriptionV8"
                    >
                        Organisér dine hold under deres klub.
                    </p>
                </div>
            </div>

            <div
                class="start11-v8-form-grid"
                id="start11ClubFormV8"
            >
                <label>
                    <span>KLUBNAVN</span>

                    <input
                        id="start11NewClubNameV8"
                        type="text"
                        maxlength="70"
                        placeholder="F.eks. FC Thy"
                        autocomplete="off"
                    >
                </label>
            </div>

            <div
                class="start11-v8-form-grid"
                id="start11TeamFormV8"
                style="display:none;"
            >
                <label>
                    <span>KLUB</span>

                    <select
                        id="start11NewTeamClubV8"
                    ></select>
                </label>

                <label>
                    <span>HOLD / ÅRGANG</span>

                    <input
                        id="start11NewTeamNameV8"
                        type="text"
                        maxlength="50"
                        placeholder="F.eks. U14"
                        autocomplete="off"
                    >
                </label>
            </div>

            <div class="start11-v8-modal-actions">
                <button
                    type="button"
                    class="start11-secondary-button"
                    id="start11CancelClubTeamV8"
                >
                    ANNULLER
                </button>

                <button
                    type="button"
                    class="start11-primary-button"
                    id="start11SaveClubTeamV8"
                >
                    OPRET
                </button>
            </div>

        </div>
    `;


    document.body.appendChild(
        modal
    );


    const close =
        () =>
            start11V8CloseClubTeamModal();


    document
        .getElementById(
            "start11CloseClubTeamModalV8"
        )
        ?.addEventListener(
            "click",
            close
        );


    document
        .getElementById(
            "start11CancelClubTeamV8"
        )
        ?.addEventListener(
            "click",
            close
        );


    modal.addEventListener(
        "mousedown",
        event => {

            if (
                event.target ===
                modal
            ) {

                close();

            }

        }
    );


    document
        .getElementById(
            "start11SaveClubTeamV8"
        )
        ?.addEventListener(
            "click",
            start11V8SubmitClubTeamModal
        );

}


let start11V8ModalMode =
    "club";


function start11V8FillClubSelect(
    selectedClubName = ""
) {

    const select =
        document.getElementById(
            "start11NewTeamClubV8"
        );


    if (!select) {

        return;

    }


    const clubs =
        start11V8GetAllClubs();


    select.innerHTML =
        "";


    clubs.forEach(
        club => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                club.name;

            option.textContent =
                club.name;


            if (
                club.name.toLowerCase() ===
                String(
                    selectedClubName || ""
                )
                    .toLowerCase()
            ) {

                option.selected =
                    true;

            }


            select.appendChild(
                option
            );

        }
    );

}


function start11V8OpenClubModal() {

    start11V8EnsureClubTeamModal();


    start11V8ModalMode =
        "club";


    const modal =
        document.getElementById(
            "start11ClubTeamModalV8"
        );


    const clubForm =
        document.getElementById(
            "start11ClubFormV8"
        );


    const teamForm =
        document.getElementById(
            "start11TeamFormV8"
        );


    const title =
        document.getElementById(
            "start11ClubTeamTitleV8"
        );


    const description =
        document.getElementById(
            "start11ClubTeamDescriptionV8"
        );


    const save =
        document.getElementById(
            "start11SaveClubTeamV8"
        );


    const input =
        document.getElementById(
            "start11NewClubNameV8"
        );


    if (clubForm) {

        clubForm.style.display =
            "grid";

    }


    if (teamForm) {

        teamForm.style.display =
            "none";

    }


    if (title) {

        title.textContent =
            "TILFØJ KLUB";

    }


    if (description) {

        description.textContent =
            "Opret klubben først. Derefter kan du tilføje flere hold og årgange under den.";

    }


    if (save) {

        save.textContent =
            "+ OPRET KLUB";

    }


    if (input) {

        input.value =
            "";

    }


    if (modal) {

        modal.classList.add(
            "open"
        );

        modal.style.display =
            "flex";

    }


    setTimeout(
        () =>
            input?.focus(),
        50
    );

}


function start11V8OpenTeamModal(
    clubName = ""
) {

    start11V8EnsureClubTeamModal();


    start11V8ModalMode =
        "team";


    const modal =
        document.getElementById(
            "start11ClubTeamModalV8"
        );


    const clubForm =
        document.getElementById(
            "start11ClubFormV8"
        );


    const teamForm =
        document.getElementById(
            "start11TeamFormV8"
        );


    const title =
        document.getElementById(
            "start11ClubTeamTitleV8"
        );


    const description =
        document.getElementById(
            "start11ClubTeamDescriptionV8"
        );


    const save =
        document.getElementById(
            "start11SaveClubTeamV8"
        );


    const teamInput =
        document.getElementById(
            "start11NewTeamNameV8"
        );


    if (clubForm) {

        clubForm.style.display =
            "none";

    }


    if (teamForm) {

        teamForm.style.display =
            "grid";

    }


    if (title) {

        title.textContent =
            "TILFØJ HOLD";

    }


    if (description) {

        description.textContent =
            "Holdet får sin egen spillertrup, DBU-forbindelse, kalender, kampplan og opstilling.";

    }


    if (save) {

        save.textContent =
            "+ OPRET HOLD";

    }


    start11V8FillClubSelect(
        clubName ||
        start11V8GetActiveMeta()
            .clubName
    );


    if (teamInput) {

        teamInput.value =
            "";

    }


    if (modal) {

        modal.classList.add(
            "open"
        );

        modal.style.display =
            "flex";

    }


    setTimeout(
        () =>
            teamInput?.focus(),
        50
    );

}


function start11V8CloseClubTeamModal() {

    const modal =
        document.getElementById(
            "start11ClubTeamModalV8"
        );


    if (!modal) {

        return;

    }


    modal.classList.remove(
        "open"
    );

    modal.style.display =
        "none";

}


async function start11V8SubmitClubTeamModal() {

    if (
        start11V8ModalMode ===
        "club"
    ) {

        const input =
            document.getElementById(
                "start11NewClubNameV8"
            );


        const name =
            input?.value?.trim();


        if (!name) {

            input?.focus();

            return;

        }


        const club =
            start11V8CreateClub(
                name
            );


        start11V8CloseClubTeamModal();


        /*
            Når klubben er oprettet, åbner vi straks
            "Tilføj hold", så flowet bliver hurtigt.
        */
        setTimeout(
            () =>
                start11V8OpenTeamModal(
                    club?.name ||
                    name
                ),
            120
        );


        return;

    }


    const clubSelect =
        document.getElementById(
            "start11NewTeamClubV8"
        );


    const teamInput =
        document.getElementById(
            "start11NewTeamNameV8"
        );


    const clubName =
        clubSelect?.value?.trim();


    const teamName =
        teamInput?.value?.trim();


    if (
        !clubName ||
        !teamName
    ) {

        teamInput?.focus();

        return;

    }


    const duplicate =
        cloudTeams.some(
            team => {

                const meta =
                    start11V8GetTeamMeta(
                        team
                    );


                return (
                    meta.clubName
                        .toLowerCase() ===
                    clubName
                        .toLowerCase() &&
                    meta.teamName
                        .toLowerCase() ===
                    teamName
                        .toLowerCase()
                );

            }
        );


    if (duplicate) {

        visNotification(
            "Det hold findes allerede under klubben."
        );

        return;

    }


    const save =
        document.getElementById(
            "start11SaveClubTeamV8"
        );


    if (save) {

        save.disabled =
            true;

        save.textContent =
            "OPRETTER...";

    }


    await start11V8CreateBlankTeam(
        clubName,
        teamName
    );


    if (save) {

        save.disabled =
            false;

        save.textContent =
            "+ OPRET HOLD";

    }


    start11V8CloseClubTeamModal();

}


/* =========================================================
   NY TOPBAR KLUB / HOLD SELECTOR
========================================================= */

function start11V8EnsureClubTeamSelector() {

    const controls =
        document.getElementById(
            "teamControls"
        );


    const oldSelector =
        document.getElementById(
            "teamSelector"
        );


    if (
        !controls ||
        !oldSelector
    ) {

        return;

    }


    oldSelector.style.display =
        "none";


    if (
        document.getElementById(
            "start11ClubTeamSwitcherV8"
        )
    ) {

        return;

    }


    const shell =
        document.createElement(
            "div"
        );


    shell.id =
        "start11ClubTeamSwitcherV8";

    shell.className =
        "start11-v8-switcher";


    shell.innerHTML = `
        <button
            type="button"
            class="start11-v8-switcher-button"
            id="start11ClubTeamSwitcherButtonV8"
            aria-haspopup="true"
            aria-expanded="false"
        >
            <span class="start11-v8-switcher-club">
                KLUB
            </span>

            <span class="start11-v8-switcher-divider">
                /
            </span>

            <strong class="start11-v8-switcher-team">
                HOLD
            </strong>

            <span class="start11-v8-switcher-chevron">
                ▾
            </span>
        </button>

        <div
            class="start11-v8-switcher-menu"
            id="start11ClubTeamSwitcherMenuV8"
        ></div>
    `;


    controls.insertBefore(
        shell,
        oldSelector
    );


    document
        .getElementById(
            "start11ClubTeamSwitcherButtonV8"
        )
        ?.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                start11V8ToggleClubTeamMenu();

            }
        );


    document.addEventListener(
        "click",
        event => {

            if (
                !shell.contains(
                    event.target
                )
            ) {

                start11V8CloseClubTeamMenu();

            }

        }
    );


    /*
        Erstat + HOLD-knappen, så den ikke bruger
        den gamle "kopiér det aktive hold"-funktion.
    */
    const oldNewTeam =
        document.getElementById(
            "newTeamButton"
        );


    if (
        oldNewTeam &&
        oldNewTeam.dataset.v8Replaced !==
            "1"
    ) {

        const clone =
            oldNewTeam.cloneNode(
                true
            );


        clone.dataset.v8Replaced =
            "1";

        clone.textContent =
            "+ HOLD";


        oldNewTeam.replaceWith(
            clone
        );


        clone.addEventListener(
            "click",
            () => {

                const meta =
                    start11V8GetActiveMeta();


                start11V8OpenTeamModal(
                    meta.clubName
                );

            }
        );

    }

}


function start11V8RenderClubTeamSelector() {

    start11V8EnsureClubTeamSelector();


    const active =
        start11V8GetActiveMeta();


    const button =
        document.getElementById(
            "start11ClubTeamSwitcherButtonV8"
        );


    if (button) {

        const club =
            button.querySelector(
                ".start11-v8-switcher-club"
            );


        const team =
            button.querySelector(
                ".start11-v8-switcher-team"
            );


        if (club) {

            club.textContent =
                active.clubName;

        }


        if (team) {

            team.textContent =
                active.teamName;

        }

    }


    const menu =
        document.getElementById(
            "start11ClubTeamSwitcherMenuV8"
        );


    if (!menu) {

        return;

    }


    menu.innerHTML =
        "";


    const clubs =
        start11V8GetAllClubs();


    clubs.forEach(
        club => {

            const group =
                document.createElement(
                    "div"
                );


            group.className =
                "start11-v8-menu-club";


            const heading =
                document.createElement(
                    "div"
                );


            heading.className =
                "start11-v8-menu-club-heading";


            heading.innerHTML = `
                <strong>
                    ${start11Escape(
                        club.name
                    )}
                </strong>

                <button
                    type="button"
                    class="start11-v8-inline-add"
                    aria-label="Tilføj hold"
                >
                    + HOLD
                </button>
            `;


            heading
                .querySelector(
                    ".start11-v8-inline-add"
                )
                ?.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();

                        start11V8CloseClubTeamMenu();

                        start11V8OpenTeamModal(
                            club.name
                        );

                    }
                );


            group.appendChild(
                heading
            );


            const teams =
                start11V8TeamsForClub(
                    club.name
                );


            if (!teams.length) {

                const empty =
                    document.createElement(
                        "div"
                    );


                empty.className =
                    "start11-v8-menu-empty";

                empty.textContent =
                    "Ingen hold endnu";


                group.appendChild(
                    empty
                );

            }


            teams.forEach(
                team => {

                    const meta =
                        start11V8GetTeamMeta(
                            team
                        );


                    const item =
                        document.createElement(
                            "button"
                        );


                    item.type =
                        "button";

                    item.className =
                        "start11-v8-menu-team" +
                        (
                            team.id ===
                            activeTeamId
                                ? " active"
                                : ""
                        );


                    item.innerHTML = `
                        <span
                            class="start11-v8-menu-check"
                        >
                            ${
                                team.id ===
                                activeTeamId
                                    ? "✓"
                                    : ""
                            }
                        </span>

                        <span>
                            ${start11Escape(
                                meta.teamName
                            )}
                        </span>
                    `;


                    item.addEventListener(
                        "click",
                        async () => {

                            start11V8CloseClubTeamMenu();


                            if (
                                team.id !==
                                activeTeamId
                            ) {

                                await changeTeam(
                                    team.id
                                );

                            }


                            start11V8RenderClubTeamSelector();

                        }
                    );


                    group.appendChild(
                        item
                    );

                }
            );


            menu.appendChild(
                group
            );

        }
    );


    const addClub =
        document.createElement(
            "button"
        );


    addClub.type =
        "button";

    addClub.className =
        "start11-v8-add-club-menu";

    addClub.textContent =
        "+ TILFØJ KLUB";


    addClub.addEventListener(
        "click",
        () => {

            start11V8CloseClubTeamMenu();

            start11V8OpenClubModal();

        }
    );


    menu.appendChild(
        addClub
    );

}


function start11V8ToggleClubTeamMenu() {

    const menu =
        document.getElementById(
            "start11ClubTeamSwitcherMenuV8"
        );


    const button =
        document.getElementById(
            "start11ClubTeamSwitcherButtonV8"
        );


    if (
        !menu ||
        !button
    ) {

        return;

    }


    const isOpen =
        menu.classList.toggle(
            "open"
        );


    button.setAttribute(
        "aria-expanded",
        isOpen
            ? "true"
            : "false"
    );

}


function start11V8CloseClubTeamMenu() {

    const menu =
        document.getElementById(
            "start11ClubTeamSwitcherMenuV8"
        );


    const button =
        document.getElementById(
            "start11ClubTeamSwitcherButtonV8"
        );


    menu?.classList.remove(
        "open"
    );


    button?.setAttribute(
        "aria-expanded",
        "false"
    );

}


/* =========================================================
   UPDATE EXISTING SELECTOR / HOLD-SKIFT
========================================================= */

if (
    typeof updateTeamSelector ===
    "function"
) {

    const updateTeamSelectorBeforeV8 =
        updateTeamSelector;


    updateTeamSelector =
        function (...args) {

            const result =
                updateTeamSelectorBeforeV8(
                    ...args
                );


            start11V8RenderClubTeamSelector();


            return result;

        };

}


if (
    typeof changeTeam ===
    "function"
) {

    const changeTeamBeforeV8 =
        changeTeam;


    changeTeam =
        async function (
            teamId
        ) {

            const result =
                await changeTeamBeforeV8(
                    teamId
                );


            /*
                V7 har allerede skiftet DBU/kalender.
                V8 opdaterer nu klub-/holdvælger og sikrer
                at hele truppen er det nye holds trup.
            */
            const team =
                start11V8GetActiveTeam();


            if (team) {

                applyTeamData(
                    team.data || {}
                );

            }


            start11V8RenderClubTeamSelector();

            renderTeamsDashboard();

            start11V8RenderLatestMatch();


            return result;

        };

}


/* =========================================================
   "MINE HOLD" BLIVER KLUBBER & HOLD
========================================================= */

renderTeamsDashboard =
    function () {

        const list =
            document.getElementById(
                "teamsDashboardList"
            );


        if (!list) {

            return;

        }


        const heading =
            document.querySelector(
                "#myTeamsModal .start11-modal-heading h2"
            );


        const description =
            document.querySelector(
                "#myTeamsModal .start11-modal-heading p"
            );


        if (heading) {

            heading.textContent =
                "KLUBBER & HOLD";

        }


        if (description) {

            description.textContent =
                "Organisér dine hold efter klub. Hvert hold har sin egen trup, DBU-forbindelse, kalender og kampplan.";

        }


        const oldCreateCard =
            document.querySelector(
                "#myTeamsModal .create-team-card"
            );


        if (oldCreateCard) {

            oldCreateCard.style.display =
                "none";

        }


        list.innerHTML =
            "";


        const clubs =
            start11V8GetAllClubs();


        clubs.forEach(
            club => {

                const section =
                    document.createElement(
                        "section"
                    );


                section.className =
                    "start11-v8-club-section";


                const header =
                    document.createElement(
                        "div"
                    );


                header.className =
                    "start11-v8-club-section-header";


                header.innerHTML = `
                    <div>
                        <span>
                            KLUB
                        </span>

                        <h3>
                            ${start11Escape(
                                club.name
                            )}
                        </h3>
                    </div>

                    <button
                        type="button"
                        class="start11-v8-club-add-team"
                    >
                        + TILFØJ HOLD
                    </button>
                `;


                header
                    .querySelector(
                        ".start11-v8-club-add-team"
                    )
                    ?.addEventListener(
                        "click",
                        () =>
                            start11V8OpenTeamModal(
                                club.name
                            )
                    );


                section.appendChild(
                    header
                );


                const teams =
                    start11V8TeamsForClub(
                        club.name
                    );


                const teamList =
                    document.createElement(
                        "div"
                    );


                teamList.className =
                    "start11-v8-club-team-list";


                if (!teams.length) {

                    teamList.innerHTML = `
                        <div class="start11-v8-empty-club">
                            Ingen hold under klubben endnu.
                        </div>
                    `;

                }


                teams.forEach(
                    team => {

                        const meta =
                            start11V8GetTeamMeta(
                                team
                            );


                        const row =
                            document.createElement(
                                "div"
                            );


                        row.className =
                            "start11-v8-team-card" +
                            (
                                team.id ===
                                activeTeamId
                                    ? " active"
                                    : ""
                            );


                        row.innerHTML = `
                            <button
                                type="button"
                                class="start11-v8-team-main"
                            >
                                <span
                                    class="start11-v8-team-icon"
                                >
                                    ${
                                        team.id ===
                                        activeTeamId
                                            ? "✓"
                                            : "⚽"
                                    }
                                </span>

                                <span
                                    class="start11-v8-team-copy"
                                >
                                    <strong>
                                        ${start11Escape(
                                            meta.teamName
                                        )}
                                    </strong>

                                    <small>
                                        ${
                                            team.id ===
                                            activeTeamId
                                                ? "Aktivt hold"
                                                : "Skift til hold"
                                        }
                                    </small>
                                </span>
                            </button>

                            <div
                                class="start11-v8-team-actions"
                            >
                                <button
                                    type="button"
                                    class="start11-v8-icon-button start11-v8-rename"
                                    title="Omdøb hold"
                                >
                                    ✎
                                </button>

                                <button
                                    type="button"
                                    class="start11-v8-icon-button delete start11-v8-delete"
                                    title="Slet hold"
                                >
                                    ×
                                </button>
                            </div>
                        `;


                        row
                            .querySelector(
                                ".start11-v8-team-main"
                            )
                            ?.addEventListener(
                                "click",
                                async () => {

                                    if (
                                        team.id !==
                                        activeTeamId
                                    ) {

                                        await changeTeam(
                                            team.id
                                        );

                                    }

                                    renderTeamsDashboard();

                                }
                            );


                        row
                            .querySelector(
                                ".start11-v8-rename"
                            )
                            ?.addEventListener(
                                "click",
                                async () => {

                                    const newName =
                                        prompt(
                                            "Nyt holdnavn / årgang:",
                                            meta.teamName
                                        );


                                    if (
                                        !newName ||
                                        !newName.trim()
                                    ) {

                                        return;

                                    }


                                    await start11V8RenameTeam(
                                        team,
                                        newName
                                    );

                                }
                            );


                        row
                            .querySelector(
                                ".start11-v8-delete"
                            )
                            ?.addEventListener(
                                "click",
                                async () => {

                                    await deleteTeamFromDashboard(
                                        team.id
                                    );


                                    start11V8RenderClubTeamSelector();

                                    renderTeamsDashboard();

                                }
                            );


                        teamList.appendChild(
                            row
                        );

                    }
                );


                section.appendChild(
                    teamList
                );


                list.appendChild(
                    section
                );

            }
        );


        const addClubButton =
            document.createElement(
                "button"
            );


        addClubButton.type =
            "button";

        addClubButton.className =
            "start11-v8-large-add-club";

        addClubButton.innerHTML = `
            <strong>
                + TILFØJ KLUB
            </strong>

            <span>
                F.eks. FC Thy eller Thisted FC
            </span>
        `;


        addClubButton.addEventListener(
            "click",
            start11V8OpenClubModal
        );


        list.appendChild(
            addClubButton
        );

    };


/* =========================================================
   SENESTE KAMP
========================================================= */

function start11V8FindLatestMatch() {

    let matches = [];


    if (
        typeof start11CalendarV3SortedMatches ===
        "function"
    ) {

        matches =
            start11CalendarV3SortedMatches();

    } else if (
        typeof start11CalendarAllMatches ===
        "function"
    ) {

        matches =
            start11CalendarAllMatches();

    }


    const now =
        new Date();


    return (
        (Array.isArray(matches)
            ? matches
            : [])
            .map(
                match =>
                    start11CalendarNormalizeMatch(
                        match
                    )
            )
            .filter(
                match => {

                    const date =
                        start11CalendarDateObject(
                            match
                        );


                    return (
                        date &&
                        date.getTime() <
                        now.getTime()
                    );

                }
            )
            .sort(
                (a, b) => {

                    const da =
                        start11CalendarDateObject(
                            a
                        );

                    const db =
                        start11CalendarDateObject(
                            b
                        );


                    return (
                        (db?.getTime() || 0) -
                        (da?.getTime() || 0)
                    );

                }
            )[0] ||
        null
    );

}


function start11V8ResultText(
    match
) {

    const raw =
        String(
            match?.result || ""
        )
            .trim()
            .replace(/\s+/g, " ");


    if (!raw) {

        return "—";

    }


    /*
        Behold DBU's resultat, men gør almindelige
        score-formater lidt mere læsevenlige.
    */
    const score =
        raw.match(
            /(\d+)\s*[-–:]\s*(\d+)/
        );


    if (score) {

        return (
            score[1] +
            " – " +
            score[2]
        );

    }


    return raw;

}


function start11V8EnsureLatestMatchCard() {

    const nextCard =
        document.querySelector(
            ".next-match-card"
        );


    const upcomingCard =
        document.querySelector(
            ".upcoming-card"
        );


    if (
        !nextCard ||
        !upcomingCard
    ) {

        return null;

    }


    let card =
        document.getElementById(
            "start11LatestMatchCardV8"
        );


    if (card) {

        return card;

    }


    card =
        document.createElement(
            "section"
        );


    card.id =
        "start11LatestMatchCardV8";

    card.className =
        "start11-card start11-v8-latest-card";


    upcomingCard.parentNode.insertBefore(
        card,
        upcomingCard
    );


    return card;

}


function start11V8RenderLatestMatch() {

    const card =
        start11V8EnsureLatestMatchCard();


    if (!card) {

        return;

    }


    const match =
        start11V8FindLatestMatch();


    if (!match) {

        card.style.display =
            "none";

        return;

    }


    card.style.display =
        "block";


    const normalized =
        start11CalendarNormalizeMatch(
            match
        );


    const dateText =
        start11CalendarFormatShortDate(
            normalized.date
        );


    const homeLogo =
        normalized.homeLogo ||
        "";

    const awayLogo =
        normalized.awayLogo ||
        "";


    card.innerHTML = `
        <div class="start11-v8-latest-heading">

            <div>
                <span class="start11-v8-latest-eyebrow">
                    SENESTE KAMP
                </span>

                <small>
                    ${start11Escape(
                        dateText
                    )}
                </small>
            </div>

            <button
                type="button"
                class="start11-v8-latest-calendar"
            >
                Kalender →
            </button>

        </div>

        <div class="start11-v8-latest-result-row">

            <div class="start11-v8-latest-team">
                ${
                    typeof start11V5LogoMarkup ===
                    "function"
                        ? start11V5LogoMarkup(
                            homeLogo,
                            normalized.home,
                            "latest"
                        )
                        : ""
                }

                <span>
                    ${start11Escape(
                        normalized.home ||
                        "Hjemmehold"
                    )}
                </span>
            </div>

            <strong class="start11-v8-latest-score">
                ${start11Escape(
                    start11V8ResultText(
                        normalized
                    )
                )}
            </strong>

            <div class="start11-v8-latest-team away">
                ${
                    typeof start11V5LogoMarkup ===
                    "function"
                        ? start11V5LogoMarkup(
                            awayLogo,
                            normalized.away,
                            "latest"
                        )
                        : ""
                }

                <span>
                    ${start11Escape(
                        normalized.away ||
                        "Udehold"
                    )}
                </span>
            </div>

        </div>
    `;


    if (
        typeof start11V5BindLogoFallbacks ===
        "function"
    ) {

        start11V5BindLogoFallbacks(
            card
        );

    }


    card
        .querySelector(
            ".start11-v8-latest-calendar"
        )
        ?.addEventListener(
            "click",
            () => {

                if (
                    typeof start11CalendarOpen ===
                    "function"
                ) {

                    start11CalendarOpen(
                        normalized.date
                    );

                    return;

                }


                const calendarButton =
                    document.getElementById(
                        "start11CalendarHeaderButton"
                    );


                calendarButton?.click();

            }
        );

}


/* =========================================================
   V8 STYLES
========================================================= */

function start11V8InstallStyles() {

    if (
        document.getElementById(
            "start11V8ClubStyles"
        )
    ) {

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "start11V8ClubStyles";


    style.textContent = `

        /* ==========================================
           TOPBAR KLUB / HOLD SWITCHER
        ========================================== */

        .start11-v8-switcher {
            position: relative;
            min-width: 190px;
        }

        .start11-v8-switcher-button {
            width: 100%;
            min-height: 40px;
            display: flex;
            align-items: center;
            gap: 7px;
            padding: 0 12px;
            border: 1px solid rgba(176,255,122,.32);
            border-radius: 7px;
            background:
                linear-gradient(
                    180deg,
                    rgba(9,20,11,.98),
                    rgba(4,11,6,.98)
                );
            color: #fff;
            cursor: pointer;
            font: inherit;
            text-align: left;
        }

        .start11-v8-switcher-button:hover,
        .start11-v8-switcher-button[aria-expanded="true"] {
            border-color: rgba(130,255,76,.68);
            background:
                linear-gradient(
                    180deg,
                    rgba(13,31,16,.98),
                    rgba(5,14,7,.98)
                );
        }

        .start11-v8-switcher-club {
            max-width: 95px;
            overflow: hidden;
            color: #cbd5cc;
            font-size: 9px;
            font-weight: 800;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .start11-v8-switcher-divider {
            color: rgba(255,255,255,.28);
            font-size: 11px;
        }

        .start11-v8-switcher-team {
            min-width: 0;
            flex: 1;
            overflow: hidden;
            color: #fff;
            font-size: 10px;
            font-weight: 900;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .start11-v8-switcher-chevron {
            color: #82ff54;
            font-size: 9px;
        }

        .start11-v8-switcher-menu {
            position: absolute;
            top: calc(100% + 8px);
            right: 0;
            z-index: 9000;
            width: 260px;
            max-height: min(70vh,540px);
            overflow-y: auto;
            padding: 7px;
            border: 1px solid rgba(130,255,84,.26);
            border-radius: 10px;
            background:
                linear-gradient(
                    180deg,
                    rgba(8,18,10,.995),
                    rgba(3,9,5,.995)
                );
            box-shadow:
                0 24px 60px rgba(0,0,0,.55);
            display: none;
        }

        .start11-v8-switcher-menu.open {
            display: block;
        }

        .start11-v8-menu-club {
            padding: 5px 4px 8px;
        }

        .start11-v8-menu-club + .start11-v8-menu-club {
            border-top:
                1px solid rgba(255,255,255,.075);
        }

        .start11-v8-menu-club-heading {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            padding: 6px 7px;
        }

        .start11-v8-menu-club-heading strong {
            overflow: hidden;
            color: #8ff35c;
            font-size: 9px;
            font-weight: 950;
            letter-spacing: .4px;
            text-transform: uppercase;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .start11-v8-inline-add {
            padding: 2px 4px;
            border: 0;
            background: transparent;
            color: rgba(255,255,255,.5);
            font-size: 7px;
            font-weight: 900;
            cursor: pointer;
        }

        .start11-v8-inline-add:hover {
            color: #8ff35c;
        }

        .start11-v8-menu-team {
            width: 100%;
            display: grid;
            grid-template-columns: 18px minmax(0,1fr);
            align-items: center;
            gap: 5px;
            min-height: 34px;
            padding: 6px 8px;
            border: 0;
            border-radius: 6px;
            background: transparent;
            color: #dce6dd;
            font: inherit;
            font-size: 9px;
            font-weight: 800;
            text-align: left;
            cursor: pointer;
        }

        .start11-v8-menu-team:hover {
            background: rgba(129,255,74,.065);
        }

        .start11-v8-menu-team.active {
            background: rgba(129,255,74,.11);
            color: #8ff35c;
        }

        .start11-v8-menu-check {
            color: #82ff54;
            text-align: center;
        }

        .start11-v8-menu-empty {
            padding: 7px 9px 10px 31px;
            color: rgba(255,255,255,.35);
            font-size: 8px;
        }

        .start11-v8-add-club-menu {
            width: 100%;
            margin-top: 5px;
            padding: 10px;
            border: 1px dashed rgba(132,255,81,.38);
            border-radius: 7px;
            background: rgba(132,255,81,.025);
            color: #8ff35c;
            font-size: 8px;
            font-weight: 950;
            cursor: pointer;
        }


        /* ==========================================
           KLUB / HOLD MODAL
        ========================================== */

        .start11-v8-club-team-panel {
            width: min(520px,calc(100vw - 32px));
        }

        .start11-v8-form-grid {
            display: grid;
            gap: 14px;
            margin-top: 22px;
        }

        .start11-v8-form-grid label {
            display: grid;
            gap: 7px;
        }

        .start11-v8-form-grid label > span {
            color: #aeb9af;
            font-size: 9px;
            font-weight: 900;
            letter-spacing: .25px;
        }

        .start11-v8-form-grid input,
        .start11-v8-form-grid select {
            width: 100%;
            min-height: 44px;
            padding: 0 13px;
            border: 1px solid rgba(255,255,255,.15);
            border-radius: 7px;
            outline: none;
            background: #0a100b;
            color: #fff;
            font: inherit;
            font-size: 11px;
        }

        .start11-v8-form-grid input:focus,
        .start11-v8-form-grid select:focus {
            border-color: rgba(130,255,84,.62);
        }

        .start11-v8-modal-actions {
            display: flex;
            justify-content: flex-end;
            gap: 9px;
            margin-top: 20px;
        }


        /* ==========================================
           MINE HOLD → KLUBBER & HOLD
        ========================================== */

        #teamsDashboardList {
            display: grid;
            gap: 14px;
        }

        .start11-v8-club-section {
            overflow: hidden;
            border: 1px solid rgba(131,255,77,.17);
            border-radius: 10px;
            background:
                linear-gradient(
                    180deg,
                    rgba(7,18,9,.86),
                    rgba(4,11,6,.86)
                );
        }

        .start11-v8-club-section-header {
            min-height: 58px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            padding: 12px 14px;
            border-bottom:
                1px solid rgba(255,255,255,.065);
        }

        .start11-v8-club-section-header span {
            display: block;
            margin-bottom: 3px;
            color: #75df4d;
            font-size: 7px;
            font-weight: 900;
            letter-spacing: .7px;
        }

        .start11-v8-club-section-header h3 {
            margin: 0;
            color: #fff;
            font-size: 14px;
            font-weight: 950;
        }

        .start11-v8-club-add-team {
            padding: 7px 9px;
            border: 1px solid rgba(129,255,73,.36);
            border-radius: 6px;
            background: rgba(129,255,73,.045);
            color: #89f653;
            font-size: 8px;
            font-weight: 900;
            cursor: pointer;
        }

        .start11-v8-club-team-list {
            display: grid;
        }

        .start11-v8-team-card {
            min-height: 54px;
            display: grid;
            grid-template-columns: minmax(0,1fr) auto;
            align-items: center;
            gap: 8px;
            padding: 7px 9px;
            border-bottom:
                1px solid rgba(255,255,255,.05);
        }

        .start11-v8-team-card:last-child {
            border-bottom: 0;
        }

        .start11-v8-team-card.active {
            background:
                linear-gradient(
                    90deg,
                    rgba(128,255,72,.105),
                    transparent
                );
        }

        .start11-v8-team-main {
            min-width: 0;
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 6px;
            border: 0;
            background: transparent;
            color: inherit;
            font: inherit;
            text-align: left;
            cursor: pointer;
        }

        .start11-v8-team-icon {
            width: 29px;
            height: 29px;
            display: grid;
            place-items: center;
            flex: 0 0 29px;
            border: 1px solid rgba(255,255,255,.11);
            border-radius: 7px;
            background: rgba(255,255,255,.025);
            color: #8ff35c;
            font-size: 11px;
        }

        .start11-v8-team-copy {
            min-width: 0;
            display: grid;
            gap: 3px;
        }

        .start11-v8-team-copy strong {
            overflow: hidden;
            color: #fff;
            font-size: 11px;
            font-weight: 900;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .start11-v8-team-copy small {
            color: rgba(255,255,255,.42);
            font-size: 8px;
        }

        .start11-v8-team-actions {
            display: flex;
            gap: 5px;
        }

        .start11-v8-icon-button {
            width: 30px;
            height: 30px;
            display: grid;
            place-items: center;
            border: 1px solid rgba(255,255,255,.11);
            border-radius: 6px;
            background: rgba(255,255,255,.025);
            color: #bac4bb;
            cursor: pointer;
        }

        .start11-v8-icon-button:hover {
            border-color: rgba(128,255,72,.42);
            color: #8ff35c;
        }

        .start11-v8-icon-button.delete:hover {
            border-color: rgba(255,84,84,.45);
            color: #ff6f6f;
        }

        .start11-v8-empty-club {
            padding: 14px;
            color: rgba(255,255,255,.38);
            font-size: 9px;
        }

        .start11-v8-large-add-club {
            width: 100%;
            min-height: 60px;
            display: grid;
            gap: 4px;
            place-items: center;
            border: 1px dashed rgba(128,255,72,.36);
            border-radius: 9px;
            background: rgba(128,255,72,.025);
            color: #8ff35c;
            cursor: pointer;
        }

        .start11-v8-large-add-club strong {
            font-size: 9px;
        }

        .start11-v8-large-add-club span {
            color: rgba(255,255,255,.42);
            font-size: 8px;
        }


        /* ==========================================
           SENESTE KAMP – KOMPAKT
        ========================================== */

        .start11-v8-latest-card {
            margin-top: 12px;
            padding: 13px 14px !important;
            border: 1px solid rgba(129,255,73,.22) !important;
            border-radius: 10px !important;
            background:
                linear-gradient(
                    180deg,
                    rgba(7,18,9,.96),
                    rgba(4,11,6,.96)
                ) !important;
        }

        .start11-v8-latest-heading {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            margin-bottom: 10px;
        }

        .start11-v8-latest-heading > div {
            display: flex;
            align-items: baseline;
            gap: 8px;
        }

        .start11-v8-latest-eyebrow {
            color: #fff;
            font-size: 11px;
            font-weight: 950;
            letter-spacing: .2px;
        }

        .start11-v8-latest-heading small {
            color: rgba(255,255,255,.43);
            font-size: 7px;
            font-weight: 700;
        }

        .start11-v8-latest-calendar {
            padding: 0;
            border: 0;
            background: transparent;
            color: #87ee54;
            font-size: 7px;
            font-weight: 900;
            cursor: pointer;
        }

        .start11-v8-latest-result-row {
            display: grid;
            grid-template-columns:
                minmax(0,1fr)
                auto
                minmax(0,1fr);
            align-items: center;
            gap: 8px;
        }

        .start11-v8-latest-team {
            min-width: 0;
            display: flex;
            align-items: center;
            gap: 7px;
        }

        .start11-v8-latest-team.away {
            flex-direction: row-reverse;
            text-align: right;
        }

        .start11-v8-latest-team .start11-v5-row-logo {
            width: 30px !important;
            height: 30px !important;
            min-width: 30px !important;
        }

        .start11-v8-latest-team > span:last-child {
            min-width: 0;
            overflow: hidden;
            color: #e8eee9;
            font-size: 8px;
            font-weight: 800;
            line-height: 1.2;
            text-overflow: ellipsis;
        }

        .start11-v8-latest-score {
            min-width: 54px;
            padding: 7px 9px;
            border: 1px solid rgba(255,255,255,.13);
            border-radius: 6px;
            background: rgba(255,255,255,.025);
            color: #fff;
            font-size: 16px;
            font-weight: 950;
            text-align: center;
            white-space: nowrap;
        }


        @media (max-width: 900px) {

            .start11-v8-switcher {
                min-width: 150px;
            }

            .start11-v8-switcher-club {
                max-width: 68px;
            }

        }

    `;


    document.head.appendChild(
        style
    );

}


/* =========================================================
   INIT
========================================================= */

async function start11InitClubTeamsV8() {

    start11V8InstallStyles();

    start11V8EnsureClubTeamModal();

    start11V8EnsureClubTeamSelector();


    /*
        Login/cloud kan stadig være ved at initialisere.
    */
    if (
        !session ||
        !activeTeamId ||
        !Array.isArray(
            cloudTeams
        ) ||
        !cloudTeams.length
    ) {

        setTimeout(
            start11InitClubTeamsV8,
            350
        );

        return;

    }


    await start11V8EnsureMetadataForAllTeams();


    /*
        Aktivt holds fulde trup skal indlæses én gang,
        også hvis applyTeamData nåede at køre før V8-patchen
        blev registreret.
    */
    const current =
        start11V8GetActiveTeam();


    if (current) {

        applyTeamData(
            current.data || {}
        );

    }


    start11V8RenderClubTeamSelector();

    renderTeamsDashboard();

    start11V8RenderLatestMatch();


    /*
        DBU-sync kan ændre resultatet på den seneste kamp.
    */
    const syncButton =
        document.getElementById(
            "syncDbuMatchesButton"
        );


    if (
        syncButton &&
        syncButton.dataset.latestV8 !==
            "1"
    ) {

        syncButton.dataset.latestV8 =
            "1";


        syncButton.addEventListener(
            "click",
            () => {

                [900, 2200, 4200]
                    .forEach(
                        delay => {

                            setTimeout(
                                start11V8RenderLatestMatch,
                                delay
                            );

                        }
                    );

            }
        );

    }


    /*
        Tegn det kompakte seneste-kamp-kort igen efter
        dashboardets andre init-rutiner.
    */
    setTimeout(
        start11V8RenderLatestMatch,
        1200
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
                start11InitClubTeamsV8,
                1100
            )
    );

} else {

    setTimeout(
        start11InitClubTeamsV8,
        1100
    );

}


/* =========================================================
   START11 – DESIGN & FARVER + AUTO DBU KLUBLOGO V9
   ---------------------------------------------------------
   Bygger oven på V8.

   Nyt:
   - Design gemmes separat pr. hold.
   - Primær og sekundær hjemmesidefarve.
   - Markspillertrøje + nummerfarve.
   - Målmandstrøje + nummerfarve.
   - Navnepladefarver.
   - Live preview inden GEM DESIGN.
   - Automatisk klublogo udledes af DBU-kampprogrammet.
   - Klublogo vises i KLUB / HOLD-vælgeren i topbaren.
========================================================= */


const START11_V9_DEFAULT_THEME = {
    primaryColor:
        "#82FF54",

    secondaryColor:
        "#54D92F",

    surfaceAccent:
        "#08130B",

    playerShirtColor:
        "#C8FF00",

    playerShirtTextColor:
        "#071008",

    goalkeeperShirtColor:
        "#E31D1D",

    goalkeeperShirtTextColor:
        "#FFFFFF",

    nameplateColor:
        "#071008",

    nameplateTextColor:
        "#FFFFFF",

    logo:
        "",

    logoSource:
        ""
};


let start11V9CurrentTheme = {
    ...START11_V9_DEFAULT_THEME
};


let start11V9PreviewOriginalTheme =
    null;


/* =========================================================
   FARVE HELPERS
========================================================= */

function start11V9NormalizeHex(
    value,
    fallback
) {

    let hex =
        String(
            value || ""
        )
            .trim()
            .toUpperCase();


    if (
        /^[0-9A-F]{6}$/.test(
            hex
        )
    ) {

        hex =
            "#" + hex;

    }


    if (
        /^[0-9A-F]{3}$/.test(
            hex
        )
    ) {

        hex =
            "#" +
            hex
                .split("")
                .map(
                    char =>
                        char + char
                )
                .join("");

    }


    if (
        /^#[0-9A-F]{6}$/.test(
            hex
        )
    ) {

        return hex;

    }


    return fallback;

}


function start11V9ReadableTextColor(
    hex
) {

    const safe =
        start11V9NormalizeHex(
            hex,
            "#000000"
        )
            .slice(1);


    const r =
        parseInt(
            safe.slice(0, 2),
            16
        );

    const g =
        parseInt(
            safe.slice(2, 4),
            16
        );

    const b =
        parseInt(
            safe.slice(4, 6),
            16
        );


    const luminance =
        (
            0.299 * r +
            0.587 * g +
            0.114 * b
        ) / 255;


    return (
        luminance > 0.58
            ? "#071008"
            : "#FFFFFF"
    );

}


function start11V9SanitizeTheme(
    input
) {

    const raw =
        input &&
        typeof input === "object"
            ? input
            : {};


    return {
        primaryColor:
            start11V9NormalizeHex(
                raw.primaryColor,
                START11_V9_DEFAULT_THEME
                    .primaryColor
            ),

        secondaryColor:
            start11V9NormalizeHex(
                raw.secondaryColor,
                START11_V9_DEFAULT_THEME
                    .secondaryColor
            ),

        surfaceAccent:
            start11V9NormalizeHex(
                raw.surfaceAccent,
                START11_V9_DEFAULT_THEME
                    .surfaceAccent
            ),

        playerShirtColor:
            start11V9NormalizeHex(
                raw.playerShirtColor,
                START11_V9_DEFAULT_THEME
                    .playerShirtColor
            ),

        playerShirtTextColor:
            start11V9NormalizeHex(
                raw.playerShirtTextColor,
                START11_V9_DEFAULT_THEME
                    .playerShirtTextColor
            ),

        goalkeeperShirtColor:
            start11V9NormalizeHex(
                raw.goalkeeperShirtColor,
                START11_V9_DEFAULT_THEME
                    .goalkeeperShirtColor
            ),

        goalkeeperShirtTextColor:
            start11V9NormalizeHex(
                raw.goalkeeperShirtTextColor,
                START11_V9_DEFAULT_THEME
                    .goalkeeperShirtTextColor
            ),

        nameplateColor:
            start11V9NormalizeHex(
                raw.nameplateColor,
                START11_V9_DEFAULT_THEME
                    .nameplateColor
            ),

        nameplateTextColor:
            start11V9NormalizeHex(
                raw.nameplateTextColor,
                START11_V9_DEFAULT_THEME
                    .nameplateTextColor
            ),

        logo:
            String(
                raw.logo || ""
            ).trim(),

        logoSource:
            String(
                raw.logoSource || ""
            ).trim()
    };

}


/* =========================================================
   GEM DESIGN I DET AKTIVE HOLDS CLOUD DATA
========================================================= */

function start11V9GetActiveTheme() {

    const team =
        typeof start11V8GetActiveTeam ===
            "function"
            ? start11V8GetActiveTeam()
            : cloudTeams.find(
                item =>
                    item.id ===
                    activeTeamId
            );


    return start11V9SanitizeTheme(
        team?.data?.start11Theme ||
        START11_V9_DEFAULT_THEME
    );

}


function start11V9SetThemeOnActiveTeam(
    theme,
    saveCloud = true
) {

    const clean =
        start11V9SanitizeTheme(
            theme
        );


    start11V9CurrentTheme = {
        ...clean
    };


    const team =
        typeof start11V8GetActiveTeam ===
            "function"
            ? start11V8GetActiveTeam()
            : cloudTeams.find(
                item =>
                    item.id ===
                    activeTeamId
            );


    if (team) {

        team.data = {
            ...(team.data || {}),

            start11Theme: {
                ...clean
            }
        };

    }


    start11V9ApplyTheme(
        clean
    );


    if (
        saveCloud &&
        typeof scheduleCloudSave ===
            "function"
    ) {

        scheduleCloudSave();

    }

}


/*
    collectTeamData er allerede blevet udvidet i V8.
    V9 lægger temaet ovenpå, så det følger holdet i Supabase.
*/
if (
    typeof collectTeamData ===
    "function"
) {

    const collectTeamDataBeforeV9 =
        collectTeamData;


    collectTeamData =
        function () {

            const data =
                collectTeamDataBeforeV9();


            return {
                ...data,

                start11Theme:
                    start11V9SanitizeTheme(
                        start11V9CurrentTheme
                    )
            };

        };

}


/*
    Når et andet hold vælges, indlæses dets eget design.
*/
if (
    typeof applyTeamData ===
    "function"
) {

    const applyTeamDataBeforeV9 =
        applyTeamData;


    applyTeamData =
        function (
            data
        ) {

            applyTeamDataBeforeV9(
                data
            );


            start11V9CurrentTheme =
                start11V9SanitizeTheme(
                    data?.start11Theme ||
                    START11_V9_DEFAULT_THEME
                );


            start11V9ApplyTheme(
                start11V9CurrentTheme
            );


            start11V9RefreshSwitcherLogo();

        };

}


/* =========================================================
   CSS VARIABLES / LIVE THEME
========================================================= */

function start11V9ApplyTheme(
    theme
) {

    const clean =
        start11V9SanitizeTheme(
            theme
        );


    const root =
        document.documentElement;


    root.style.setProperty(
        "--s11-primary",
        clean.primaryColor
    );

    root.style.setProperty(
        "--s11-secondary",
        clean.secondaryColor
    );

    root.style.setProperty(
        "--s11-accent-bg",
        clean.surfaceAccent
    );

    root.style.setProperty(
        "--s11-shirt",
        clean.playerShirtColor
    );

    root.style.setProperty(
        "--s11-shirt-text",
        clean.playerShirtTextColor
    );

    root.style.setProperty(
        "--s11-gk-shirt",
        clean.goalkeeperShirtColor
    );

    root.style.setProperty(
        "--s11-gk-shirt-text",
        clean.goalkeeperShirtTextColor
    );

    root.style.setProperty(
        "--s11-nameplate",
        clean.nameplateColor
    );

    root.style.setProperty(
        "--s11-nameplate-text",
        clean.nameplateTextColor
    );


    /*
        Browser UI accent, så inputs/checkboxes også følger temaet.
    */
    root.style.accentColor =
        clean.primaryColor;


    start11V9UpdateThemePreview();

}


/* =========================================================
   TEMA CSS
========================================================= */

function start11V9InstallThemeStyles() {

    if (
        document.getElementById(
            "start11V9ThemeStyles"
        )
    ) {

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "start11V9ThemeStyles";


    style.textContent = `

        :root {
            --s11-primary: #82FF54;
            --s11-secondary: #54D92F;
            --s11-accent-bg: #08130B;

            --s11-shirt: #C8FF00;
            --s11-shirt-text: #071008;

            --s11-gk-shirt: #E31D1D;
            --s11-gk-shirt-text: #FFFFFF;

            --s11-nameplate: #071008;
            --s11-nameplate-text: #FFFFFF;
        }


        /* ==========================================
           HJEMMESIDENS ACCENTFARVE
        ========================================== */

        .start11-main-nav .start11-nav-item.active,
        .start11-main-nav .start11-nav-item:hover,
        .start11-v8-switcher-chevron,
        .start11-v8-menu-club-heading strong,
        .start11-v8-menu-check,
        .start11-v8-inline-add:hover,
        .start11-v8-add-club-menu,
        .start11-v8-club-section-header span,
        .start11-v8-club-add-team,
        .start11-v8-team-card.active .start11-v8-team-icon,
        .start11-v8-large-add-club,
        .start11-v8-latest-calendar,
        .start11-v5-date,
        .start11-v5-time {
            color: var(--s11-primary) !important;
        }

        .start11-main-nav .start11-nav-item.active::after {
            background: var(--s11-primary) !important;
        }

        .start11-primary-action,
        .start11-primary-button,
        #saveButton,
        #saveAccountProfileButton,
        #saveSquadPlayerButton,
        #syncDbuMatchesButton,
        .start11-v9-save-theme {
            border-color:
                color-mix(
                    in srgb,
                    var(--s11-primary) 80%,
                    transparent
                ) !important;

            background:
                linear-gradient(
                    90deg,
                    var(--s11-primary),
                    var(--s11-secondary)
                ) !important;

            color:
                var(--s11-primary-text,#071008) !important;
        }

        .start11-v8-switcher-button:hover,
        .start11-v8-switcher-button[aria-expanded="true"],
        .start11-upcoming-v5-row.current,
        .start11-v8-latest-card,
        .start11-v8-club-section,
        .start11-v8-team-card.active,
        .start11-card {
            border-color:
                color-mix(
                    in srgb,
                    var(--s11-primary) 27%,
                    transparent
                ) !important;
        }

        .start11-upcoming-v5-row.current {
            border-color:
                color-mix(
                    in srgb,
                    var(--s11-primary) 76%,
                    transparent
                ) !important;

            background:
                linear-gradient(
                    90deg,
                    color-mix(
                        in srgb,
                        var(--s11-primary) 8%,
                        transparent
                    ),
                    transparent
                ) !important;
        }

        .start11-v8-menu-team.active {
            color: var(--s11-primary) !important;

            background:
                color-mix(
                    in srgb,
                    var(--s11-primary) 11%,
                    transparent
                ) !important;
        }

        .start11-v8-switcher-button,
        .start11-v8-switcher-menu,
        .next-match-card,
        .upcoming-card,
        .start11-v8-latest-card {
            background:
                radial-gradient(
                    circle at 50% 0%,
                    color-mix(
                        in srgb,
                        var(--s11-primary) 7%,
                        transparent
                    ),
                    transparent 48%
                ),
                linear-gradient(
                    180deg,
                    color-mix(
                        in srgb,
                        var(--s11-accent-bg) 92%,
                        #060906
                    ),
                    #050905
                ) !important;
        }


        /* ==========================================
           MARKSPILLERTRØJER
        ========================================== */

        .player-slot:not(.goalkeeper) .shirt,
        .details-shirt:not(.goalkeeper),
        .substitute:not(.start11-v9-gk-substitute)
            .sub-shirt {
            background-color:
                var(--s11-shirt) !important;

            color:
                var(--s11-shirt-text) !important;
        }


        /* ==========================================
           MÅLMANDSTRØJER
        ========================================== */

        .player-slot.goalkeeper .shirt,
        .details-shirt.goalkeeper,
        .substitute.start11-v9-gk-substitute
            .sub-shirt {
            background-color:
                var(--s11-gk-shirt) !important;

            color:
                var(--s11-gk-shirt-text) !important;
        }


        /* ==========================================
           NAVNEPLADER
        ========================================== */

        .player-name,
        .details-name,
        .substitute-name {
            color:
                var(--s11-nameplate-text) !important;
        }

        .player-slot .player-name {
            background:
                var(--s11-nameplate) !important;

            color:
                var(--s11-nameplate-text) !important;
        }


        /* ==========================================
           TOPBAR AUTO LOGO
        ========================================== */

        .start11-v9-switcher-logo {
            position: relative;
            width: 24px;
            height: 24px;
            min-width: 24px;
            display: grid;
            place-items: center;
            overflow: hidden;
            border:
                1px solid
                color-mix(
                    in srgb,
                    var(--s11-primary) 35%,
                    rgba(255,255,255,.08)
                );
            border-radius: 50%;
            background: #0A100B;
        }

        .start11-v9-switcher-logo img {
            width: 82%;
            height: 82%;
            display: block;
            object-fit: contain;
        }

        .start11-v9-switcher-logo span {
            color: var(--s11-primary);
            font-size: 7px;
            font-weight: 950;
        }


        /* ==========================================
           ACCOUNT MENU – DESIGN & FARVER
        ========================================== */

        #designColorsMenuButtonV9
        .start11-v9-design-icon {
            width: 18px;
            height: 18px;
            display: grid;
            place-items: center;
            border-radius: 50%;
            background:
                linear-gradient(
                    135deg,
                    var(--s11-primary) 0 50%,
                    var(--s11-secondary) 50% 100%
                );
            box-shadow:
                inset 0 0 0 2px
                rgba(255,255,255,.12);
        }


        /* ==========================================
           DESIGN MODAL
        ========================================== */

        .start11-v9-theme-panel {
            width:
                min(
                    720px,
                    calc(100vw - 30px)
                );
            max-height: 92vh;
            overflow-y: auto;
        }

        .start11-v9-theme-intro {
            margin-top: 3px;
            color: #99A39B;
            font-size: 10px;
            line-height: 1.5;
        }

        .start11-v9-theme-identity {
            display: flex;
            align-items: center;
            gap: 13px;
            margin: 20px 0 8px;
            padding: 13px;
            border: 1px solid rgba(255,255,255,.09);
            border-radius: 9px;
            background: rgba(255,255,255,.018);
        }

        .start11-v9-theme-logo {
            width: 52px;
            height: 52px;
            display: grid;
            place-items: center;
            overflow: hidden;
            flex: 0 0 52px;
            border:
                1px solid
                color-mix(
                    in srgb,
                    var(--s11-primary) 42%,
                    rgba(255,255,255,.1)
                );
            border-radius: 50%;
            background: #080E09;
        }

        .start11-v9-theme-logo img {
            width: 84%;
            height: 84%;
            object-fit: contain;
        }

        .start11-v9-theme-logo span {
            color: var(--s11-primary);
            font-size: 12px;
            font-weight: 950;
        }

        .start11-v9-theme-identity-copy {
            min-width: 0;
            display: grid;
            gap: 4px;
        }

        .start11-v9-theme-identity-copy strong {
            color: #fff;
            font-size: 14px;
            font-weight: 950;
        }

        .start11-v9-theme-identity-copy span {
            color: #99A39B;
            font-size: 9px;
        }

        .start11-v9-theme-section {
            margin-top: 20px;
            padding-top: 17px;
            border-top: 1px solid rgba(255,255,255,.085);
        }

        .start11-v9-theme-section-title {
            margin-bottom: 12px;
            color: #fff;
            font-size: 10px;
            font-weight: 950;
            letter-spacing: .25px;
            text-transform: uppercase;
        }

        .start11-v9-color-grid {
            display: grid;
            grid-template-columns:
                repeat(
                    2,
                    minmax(0,1fr)
                );
            gap: 11px;
        }

        .start11-v9-color-field {
            display: grid;
            grid-template-columns:
                minmax(0,1fr)
                39px
                96px;
            align-items: center;
            gap: 8px;
            min-height: 42px;
            padding: 7px 9px;
            border: 1px solid rgba(255,255,255,.085);
            border-radius: 7px;
            background: rgba(255,255,255,.016);
        }

        .start11-v9-color-field label {
            color: #C5CEC6;
            font-size: 9px;
            font-weight: 800;
        }

        .start11-v9-color-field input[type="color"] {
            width: 34px;
            height: 30px;
            padding: 2px;
            border: 1px solid rgba(255,255,255,.14);
            border-radius: 6px;
            background: #0B110C;
            cursor: pointer;
        }

        .start11-v9-color-field input[type="text"] {
            width: 100%;
            min-width: 0;
            height: 30px;
            padding: 0 8px;
            border: 1px solid rgba(255,255,255,.12);
            border-radius: 5px;
            outline: none;
            background: #0B110C;
            color: #fff;
            font: inherit;
            font-size: 8px;
            text-transform: uppercase;
        }

        .start11-v9-color-field
        input[type="text"]:focus {
            border-color:
                color-mix(
                    in srgb,
                    var(--s11-primary) 60%,
                    transparent
                );
        }

        .start11-v9-kit-preview-wrap {
            display: grid;
            grid-template-columns:
                minmax(0,1fr)
                150px;
            gap: 14px;
            align-items: stretch;
        }

        .start11-v9-kit-preview {
            min-height: 165px;
            display: grid;
            place-items: center;
            padding: 16px;
            border: 1px solid rgba(255,255,255,.085);
            border-radius: 9px;
            background:
                radial-gradient(
                    circle at center,
                    color-mix(
                        in srgb,
                        var(--s11-primary) 8%,
                        transparent
                    ),
                    transparent 62%
                ),
                #070C08;
        }

        .start11-v9-preview-player {
            display: grid;
            justify-items: center;
            gap: 7px;
        }

        .start11-v9-preview-shirt {
            width: 72px;
            height: 66px;
            display: grid;
            place-items: center;
            clip-path:
                polygon(
                    20% 11%,
                    36% 0,
                    64% 0,
                    80% 11%,
                    100% 23%,
                    87% 42%,
                    76% 34%,
                    76% 100%,
                    24% 100%,
                    24% 34%,
                    13% 42%,
                    0 23%
                );
            background:
                var(--s11-shirt);
            color:
                var(--s11-shirt-text);
            font-size: 22px;
            font-weight: 950;
        }

        .start11-v9-preview-name {
            min-width: 88px;
            padding: 6px 10px;
            border-radius: 4px;
            background:
                var(--s11-nameplate);
            color:
                var(--s11-nameplate-text);
            font-size: 9px;
            font-weight: 900;
            text-align: center;
        }

        .start11-v9-theme-actions {
            display: flex;
            justify-content: flex-end;
            gap: 9px;
            margin-top: 21px;
        }

        .start11-v9-reset-theme,
        .start11-v9-cancel-theme {
            min-height: 39px;
            padding: 0 15px;
            border: 1px solid rgba(255,255,255,.14);
            border-radius: 7px;
            background:
                linear-gradient(
                    180deg,
                    #171C18,
                    #0E120F
                );
            color: #BCC6BD;
            font: inherit;
            font-size: 9px;
            font-weight: 900;
            cursor: pointer;
        }

        .start11-v9-save-theme {
            min-height: 39px;
            padding: 0 20px;
            border: 1px solid var(--s11-primary);
            border-radius: 7px;
            font: inherit;
            font-size: 9px;
            font-weight: 950;
            cursor: pointer;
        }


        @media (max-width: 720px) {

            .start11-v9-color-grid {
                grid-template-columns: 1fr;
            }

            .start11-v9-kit-preview-wrap {
                grid-template-columns: 1fr;
            }

            .start11-v9-theme-actions {
                flex-wrap: wrap;
            }

        }

    `;


    document.head.appendChild(
        style
    );

}


/* =========================================================
   MÅLMANDSKLASSE PÅ UDSKIFTERE
========================================================= */

function start11V9MarkSubstituteKeepers() {

    document
        .querySelectorAll(
            "#substituteList .substitute"
        )
        .forEach(
            row => {

                const index =
                    Number(
                        row.dataset.index
                    );


                const player =
                    Array.isArray(
                        udskiftere
                    )
                        ? udskiftere[
                            index
                        ]
                        : null;


                row.classList.toggle(
                    "start11-v9-gk-substitute",
                    player?.position ===
                        "GK"
                );

            }
        );

}


if (
    typeof opdaterUdskiftere ===
    "function"
) {

    const opdaterUdskiftereBeforeV9 =
        opdaterUdskiftere;


    opdaterUdskiftere =
        function (...args) {

            const result =
                opdaterUdskiftereBeforeV9(
                    ...args
                );


            start11V9MarkSubstituteKeepers();


            return result;

        };

}


/* =========================================================
   AUTOMATISK KLUBLOGO FRA DBU
========================================================= */

function start11V9ReadMatches() {

    try {

        const parsed =
            JSON.parse(
                localStorage.getItem(
                    START11_MATCHES_KEY
                ) ||
                "[]"
            );


        return Array.isArray(parsed)
            ? parsed
            : [];

    } catch {

        return [];

    }

}


function start11V9IsUsableLogo(
    value
) {

    const logo =
        String(
            value || ""
        ).trim();


    if (!logo) {

        return false;

    }


    if (
        typeof start11V5IsGenericDbuLogo ===
        "function" &&
        start11V5IsGenericDbuLogo(
            logo
        )
    ) {

        return false;

    }


    const lower =
        logo.toLowerCase();


    return !(
        lower.includes(
            "dbu-logo"
        ) ||
        lower.includes(
            "favicon"
        ) ||
        lower.includes(
            "apple-touch-icon"
        )
    );

}


/*
    DBU-holdet er det holdnavn, der går igen flest gange
    i det hentede kampprogram.

    Det virker både når START11-holdet spiller hjemme og ude,
    og kræver ikke at brugeren kalder holdet præcis det samme
    som DBU gør.
*/
function start11V9InferTrackedDbuTeam() {

    const matches =
        start11V9ReadMatches();


    if (!matches.length) {

        return null;

    }


    const counts =
        new Map();


    const logos =
        new Map();


    const add =
        (
            name,
            logo
        ) => {

            const cleanName =
                String(
                    name || ""
                ).trim();


            if (!cleanName) {

                return;

            }


            const key =
                typeof start11V5NormalizeTeamKey ===
                    "function"
                    ? start11V5NormalizeTeamKey(
                        cleanName
                    )
                    : cleanName
                        .toLowerCase();


            counts.set(
                key,
                {
                    name:
                        cleanName,
                    count:
                        (
                            counts.get(
                                key
                            )?.count ||
                            0
                        ) +
                        1
                }
            );


            if (
                start11V9IsUsableLogo(
                    logo
                ) &&
                !logos.has(
                    key
                )
            ) {

                logos.set(
                    key,
                    logo
                );

            }

        };


    matches.forEach(
        rawMatch => {

            let match =
                rawMatch;


            if (
                typeof start11CalendarNormalizeMatch ===
                "function"
            ) {

                match =
                    start11CalendarNormalizeMatch(
                        rawMatch
                    );

            }


            add(
                match.home ||
                match.homeTeam,
                match.homeLogo
            );


            add(
                match.away ||
                match.awayTeam,
                match.awayLogo
            );

        }
    );


    const sorted =
        [...counts.entries()]
            .sort(
                (a, b) =>
                    b[1].count -
                    a[1].count
            );


    if (!sorted.length) {

        return null;

    }


    const [
        key,
        info
    ] =
        sorted[0];


    return {
        name:
            info.name,

        logo:
            logos.get(
                key
            ) ||
            ""
    };

}


function start11V9SyncLogoFromDbu(
    persist = true
) {

    const dbuTeam =
        start11V9InferTrackedDbuTeam();


    if (
        !dbuTeam ||
        !start11V9IsUsableLogo(
            dbuTeam.logo
        )
    ) {

        start11V9RefreshSwitcherLogo();

        return "";

    }


    const current =
        start11V9GetActiveTheme();


    /*
        DBU-logo må gerne opdateres automatisk.
        Et eventuelt fremtidigt manuelt logo kan markeres
        med logoSource = "manual" og bliver så ikke overskrevet.
    */
    if (
        current.logoSource ===
        "manual"
    ) {

        start11V9RefreshSwitcherLogo();

        return current.logo;

    }


    if (
        current.logo !==
            dbuTeam.logo ||
        current.logoSource !==
            "dbu"
    ) {

        current.logo =
            dbuTeam.logo;

        current.logoSource =
            "dbu";


        start11V9SetThemeOnActiveTeam(
            current,
            persist
        );

    } else {

        start11V9RefreshSwitcherLogo();

    }


    return current.logo;

}


/* =========================================================
   LOGO I KLUB / HOLD SWITCHER
========================================================= */

function start11V9EnsureSwitcherLogo() {

    const button =
        document.getElementById(
            "start11ClubTeamSwitcherButtonV8"
        );


    if (!button) {

        return null;

    }


    let wrapper =
        button.querySelector(
            ".start11-v9-switcher-logo"
        );


    if (!wrapper) {

        wrapper =
            document.createElement(
                "span"
            );


        wrapper.className =
            "start11-v9-switcher-logo";


        const clubText =
            button.querySelector(
                ".start11-v8-switcher-club"
            );


        button.insertBefore(
            wrapper,
            clubText ||
            button.firstChild
        );

    }


    return wrapper;

}


function start11V9ClubInitials() {

    const meta =
        typeof start11V8GetActiveMeta ===
            "function"
            ? start11V8GetActiveMeta()
            : {
                clubName:
                    "S11"
            };


    const words =
        String(
            meta.clubName ||
            "S11"
        )
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (!words.length) {

        return "S11";

    }


    if (
        words.length === 1
    ) {

        return words[0]
            .slice(0, 2)
            .toUpperCase();

    }


    return (
        words[0][0] +
        words[1][0]
    ).toUpperCase();

}


function start11V9RefreshSwitcherLogo() {

    const wrapper =
        start11V9EnsureSwitcherLogo();


    if (!wrapper) {

        return;

    }


    const theme =
        start11V9GetActiveTheme();


    const logo =
        start11V9IsUsableLogo(
            theme.logo
        )
            ? theme.logo
            : "";


    wrapper.innerHTML =
        "";


    if (logo) {

        const image =
            document.createElement(
                "img"
            );


        image.alt =
            "";

        image.src =
            logo;


        image.addEventListener(
            "error",
            () => {

                wrapper.innerHTML =
                    `<span>${
                        start11Escape(
                            start11V9ClubInitials()
                        )
                    }</span>`;

            },
            {
                once: true
            }
        );


        wrapper.appendChild(
            image
        );

    } else {

        wrapper.innerHTML =
            `<span>${
                start11Escape(
                    start11V9ClubInitials()
                )
            }</span>`;

    }

}


/*
    V8 renderer topbaren igen ved holdskift.
    V9 lægger logoet tilbage efter hver rendering.
*/
if (
    typeof start11V8RenderClubTeamSelector ===
    "function"
) {

    const start11V8RenderClubTeamSelectorBeforeV9 =
        start11V8RenderClubTeamSelector;


    start11V8RenderClubTeamSelector =
        function (...args) {

            const result =
                start11V8RenderClubTeamSelectorBeforeV9(
                    ...args
                );


            start11V9RefreshSwitcherLogo();


            return result;

        };

}


/* =========================================================
   ACCOUNT DROPDOWN: DESIGN & FARVER
========================================================= */

function start11V9InstallDesignMenuItem() {

    if (
        document.getElementById(
            "designColorsMenuButtonV9"
        )
    ) {

        return;

    }


    const reference =
        document.getElementById(
            "accountSettingsMenuButton"
        ) ||
        document.getElementById(
            "helpSupportMenuButton"
        );


    const menu =
        reference?.parentElement;


    if (
        !reference ||
        !menu
    ) {

        return;

    }


    const button =
        document.createElement(
            "button"
        );


    button.id =
        "designColorsMenuButtonV9";

    button.type =
        "button";

    button.className =
        "account-dropdown-item";


    button.innerHTML = `
        <span
            class="account-dropdown-icon start11-v9-design-icon"
        ></span>

        <span>
            Design & farver
        </span>

        <span
            class="account-dropdown-arrow"
        >
            ›
        </span>
    `;


    menu.insertBefore(
        button,
        reference
    );


    button.addEventListener(
        "click",
        () => {

            if (
                typeof closeAccountDropdown ===
                "function"
            ) {

                closeAccountDropdown();

            }


            start11V9OpenThemeModal();

        }
    );

}


/* =========================================================
   DESIGN MODAL
========================================================= */

function start11V9EnsureThemeModal() {

    if (
        document.getElementById(
            "start11ThemeModalV9"
        )
    ) {

        return;

    }


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "start11ThemeModalV9";

    modal.className =
        "modal start11-account-modal";


    modal.innerHTML = `
        <div
            class="
                modal-content
                start11-account-panel
                start11-v9-theme-panel
            "
        >

            <button
                type="button"
                class="close-button"
                id="start11ThemeCloseV9"
            >
                ×
            </button>

            <div class="start11-modal-heading">
                <div>
                    <span class="start11-eyebrow">
                        START11
                    </span>

                    <h2>
                        DESIGN & FARVER
                    </h2>

                    <p class="start11-v9-theme-intro">
                        Tilpas START11 til dette hold.
                        Farver og trøjer gemmes kun på
                        det aktive hold.
                    </p>
                </div>
            </div>

            <div class="start11-v9-theme-identity">

                <div
                    class="start11-v9-theme-logo"
                    id="start11ThemeLogoPreviewV9"
                ></div>

                <div
                    class="start11-v9-theme-identity-copy"
                >
                    <strong
                        id="start11ThemeClubV9"
                    >
                        KLUB
                    </strong>

                    <span
                        id="start11ThemeTeamV9"
                    >
                        HOLD
                    </span>
                </div>

            </div>


            <section class="start11-v9-theme-section">

                <div class="start11-v9-theme-section-title">
                    Farvetema for hjemmesiden
                </div>

                <div class="start11-v9-color-grid">

                    ${start11V9ColorFieldMarkup(
                        "Primær farve",
                        "primaryColor"
                    )}

                    ${start11V9ColorFieldMarkup(
                        "Sekundær farve",
                        "secondaryColor"
                    )}

                    ${start11V9ColorFieldMarkup(
                        "Baggrund / accent",
                        "surfaceAccent"
                    )}

                </div>

            </section>


            <section class="start11-v9-theme-section">

                <div class="start11-v9-theme-section-title">
                    Markspillertrøje
                </div>

                <div class="start11-v9-kit-preview-wrap">

                    <div class="start11-v9-color-grid">

                        ${start11V9ColorFieldMarkup(
                            "Trøjefarve",
                            "playerShirtColor"
                        )}

                        ${start11V9ColorFieldMarkup(
                            "Nummerfarve",
                            "playerShirtTextColor"
                        )}

                        ${start11V9ColorFieldMarkup(
                            "Navneplade",
                            "nameplateColor"
                        )}

                        ${start11V9ColorFieldMarkup(
                            "Navnetekst",
                            "nameplateTextColor"
                        )}

                    </div>

                    <div class="start11-v9-kit-preview">

                        <div class="start11-v9-preview-player">

                            <div
                                class="start11-v9-preview-shirt"
                            >
                                10
                            </div>

                            <div
                                class="start11-v9-preview-name"
                            >
                                HANSEN
                            </div>

                        </div>

                    </div>

                </div>

            </section>


            <section class="start11-v9-theme-section">

                <div class="start11-v9-theme-section-title">
                    Målmand
                </div>

                <div class="start11-v9-color-grid">

                    ${start11V9ColorFieldMarkup(
                        "Målmandstrøje",
                        "goalkeeperShirtColor"
                    )}

                    ${start11V9ColorFieldMarkup(
                        "Nummerfarve",
                        "goalkeeperShirtTextColor"
                    )}

                </div>

            </section>


            <div class="start11-v9-theme-actions">

                <button
                    type="button"
                    class="start11-v9-reset-theme"
                    id="start11ThemeResetV9"
                >
                    NULSTIL
                </button>

                <button
                    type="button"
                    class="start11-v9-cancel-theme"
                    id="start11ThemeCancelV9"
                >
                    ANNULLER
                </button>

                <button
                    type="button"
                    class="start11-v9-save-theme"
                    id="start11ThemeSaveV9"
                >
                    GEM DESIGN
                </button>

            </div>

        </div>
    `;


    document.body.appendChild(
        modal
    );


    modal
        .querySelectorAll(
            "[data-theme-key]"
        )
        .forEach(
            input => {

                input.addEventListener(
                    "input",
                    event => {

                        start11V9SyncThemeFieldPair(
                            event.target
                        );

                        start11V9PreviewThemeFromModal();

                    }
                );


                input.addEventListener(
                    "change",
                    event => {

                        start11V9SyncThemeFieldPair(
                            event.target
                        );

                        start11V9PreviewThemeFromModal();

                    }
                );

            }
        );


    document
        .getElementById(
            "start11ThemeCloseV9"
        )
        ?.addEventListener(
            "click",
            start11V9CancelThemeModal
        );


    document
        .getElementById(
            "start11ThemeCancelV9"
        )
        ?.addEventListener(
            "click",
            start11V9CancelThemeModal
        );


    document
        .getElementById(
            "start11ThemeResetV9"
        )
        ?.addEventListener(
            "click",
            () => {

                start11V9FillThemeModal(
                    {
                        ...START11_V9_DEFAULT_THEME,
                        logo:
                            start11V9GetActiveTheme()
                                .logo,
                        logoSource:
                            start11V9GetActiveTheme()
                                .logoSource
                    }
                );


                start11V9PreviewThemeFromModal();

            }
        );


    document
        .getElementById(
            "start11ThemeSaveV9"
        )
        ?.addEventListener(
            "click",
            start11V9SaveThemeModal
        );


    modal.addEventListener(
        "mousedown",
        event => {

            if (
                event.target ===
                modal
            ) {

                start11V9CancelThemeModal();

            }

        }
    );

}


function start11V9ColorFieldMarkup(
    label,
    key
) {

    return `
        <div
            class="start11-v9-color-field"
        >
            <label
                for="start11Theme_${key}_hex"
            >
                ${label}
            </label>

            <input
                type="color"
                id="start11Theme_${key}_picker"
                data-theme-key="${key}"
                data-theme-input="picker"
            >

            <input
                type="text"
                id="start11Theme_${key}_hex"
                data-theme-key="${key}"
                data-theme-input="hex"
                maxlength="7"
                spellcheck="false"
            >
        </div>
    `;

}


function start11V9SyncThemeFieldPair(
    source
) {

    const key =
        source?.dataset
            ?.themeKey;


    if (!key) {

        return;

    }


    const picker =
        document.getElementById(
            `start11Theme_${key}_picker`
        );


    const hex =
        document.getElementById(
            `start11Theme_${key}_hex`
        );


    if (
        source.dataset
            .themeInput ===
        "picker"
    ) {

        if (hex) {

            hex.value =
                String(
                    source.value ||
                    ""
                ).toUpperCase();

        }

    } else {

        const clean =
            start11V9NormalizeHex(
                source.value,
                picker?.value ||
                "#000000"
            );


        source.value =
            clean;


        if (picker) {

            picker.value =
                clean;

        }

    }

}


function start11V9FillThemeModal(
    theme
) {

    const clean =
        start11V9SanitizeTheme(
            theme
        );


    [
        "primaryColor",
        "secondaryColor",
        "surfaceAccent",
        "playerShirtColor",
        "playerShirtTextColor",
        "goalkeeperShirtColor",
        "goalkeeperShirtTextColor",
        "nameplateColor",
        "nameplateTextColor"
    ]
        .forEach(
            key => {

                const picker =
                    document.getElementById(
                        `start11Theme_${key}_picker`
                    );


                const hex =
                    document.getElementById(
                        `start11Theme_${key}_hex`
                    );


                if (picker) {

                    picker.value =
                        clean[key];

                }


                if (hex) {

                    hex.value =
                        clean[key];

                }

            }
        );


    start11V9UpdateThemeIdentity();

}


function start11V9ReadThemeFromModal() {

    const current =
        start11V9GetActiveTheme();


    const output = {
        ...current
    };


    [
        "primaryColor",
        "secondaryColor",
        "surfaceAccent",
        "playerShirtColor",
        "playerShirtTextColor",
        "goalkeeperShirtColor",
        "goalkeeperShirtTextColor",
        "nameplateColor",
        "nameplateTextColor"
    ]
        .forEach(
            key => {

                const field =
                    document.getElementById(
                        `start11Theme_${key}_hex`
                    );


                output[key] =
                    start11V9NormalizeHex(
                        field?.value,
                        current[key]
                    );

            }
        );


    return start11V9SanitizeTheme(
        output
    );

}


function start11V9PreviewThemeFromModal() {

    const preview =
        start11V9ReadThemeFromModal();


    /*
        Primær knaptekst vælges automatisk,
        så en lys blå/gul/lime knap stadig er læsbar.
    */
    document.documentElement
        .style.setProperty(
            "--s11-primary-text",
            start11V9ReadableTextColor(
                preview.primaryColor
            )
        );


    start11V9ApplyTheme(
        preview
    );

}


function start11V9UpdateThemeIdentity() {

    const meta =
        typeof start11V8GetActiveMeta ===
            "function"
            ? start11V8GetActiveMeta()
            : {
                clubName:
                    "KLUB",
                teamName:
                    "HOLD"
            };


    const club =
        document.getElementById(
            "start11ThemeClubV9"
        );


    const team =
        document.getElementById(
            "start11ThemeTeamV9"
        );


    if (club) {

        club.textContent =
            meta.clubName;

    }


    if (team) {

        team.textContent =
            meta.teamName;

    }


    start11V9UpdateThemeLogoPreview();

}


function start11V9UpdateThemeLogoPreview() {

    const wrapper =
        document.getElementById(
            "start11ThemeLogoPreviewV9"
        );


    if (!wrapper) {

        return;

    }


    const theme =
        start11V9GetActiveTheme();


    wrapper.innerHTML =
        "";


    if (
        start11V9IsUsableLogo(
            theme.logo
        )
    ) {

        const image =
            document.createElement(
                "img"
            );


        image.alt =
            "";

        image.src =
            theme.logo;


        image.onerror =
            () => {

                wrapper.innerHTML =
                    `<span>${
                        start11Escape(
                            start11V9ClubInitials()
                        )
                    }</span>`;

            };


        wrapper.appendChild(
            image
        );

    } else {

        wrapper.innerHTML =
            `<span>${
                start11Escape(
                    start11V9ClubInitials()
                )
            }</span>`;

    }

}


function start11V9UpdateThemePreview() {

    const preview =
        document.querySelector(
            ".start11-v9-preview-shirt"
        );


    /*
        CSS variables klarer selve previewet.
        Funktionen findes så vi let kan udvide preview senere.
    */
    if (!preview) {

        return;

    }

}


function start11V9OpenThemeModal() {

    start11V9EnsureThemeModal();


    start11V9SyncLogoFromDbu(
        false
    );


    start11V9PreviewOriginalTheme = {
        ...start11V9GetActiveTheme()
    };


    start11V9FillThemeModal(
        start11V9PreviewOriginalTheme
    );


    start11V9ApplyTheme(
        start11V9PreviewOriginalTheme
    );


    const modal =
        document.getElementById(
            "start11ThemeModalV9"
        );


    if (modal) {

        modal.classList.add(
            "open"
        );

        modal.style.display =
            "flex";

    }

}


function start11V9CloseThemeModal() {

    const modal =
        document.getElementById(
            "start11ThemeModalV9"
        );


    modal?.classList.remove(
        "open"
    );


    if (modal) {

        modal.style.display =
            "none";

    }

}


function start11V9CancelThemeModal() {

    if (
        start11V9PreviewOriginalTheme
    ) {

        start11V9ApplyTheme(
            start11V9PreviewOriginalTheme
        );

    }


    start11V9PreviewOriginalTheme =
        null;


    start11V9CloseThemeModal();

}


function start11V9SaveThemeModal() {

    const theme =
        start11V9ReadThemeFromModal();


    start11V9SetThemeOnActiveTeam(
        theme,
        true
    );


    start11V9PreviewOriginalTheme =
        null;


    start11V9CloseThemeModal();


    visNotification(
        "Designet er gemt på dette hold."
    );

}


/* =========================================================
   DBU SYNC → OPDATÉR KLUBLOGO
========================================================= */

function start11V9InstallDbuLogoSyncHook() {

    const syncButton =
        document.getElementById(
            "syncDbuMatchesButton"
        );


    if (
        !syncButton ||
        syncButton.dataset
            .themeLogoV9 ===
            "1"
    ) {

        return;

    }


    syncButton.dataset
        .themeLogoV9 =
        "1";


    syncButton.addEventListener(
        "click",
        () => {

            /*
                Logoerne kan først findes, når Edge Functionens
                kampe er gemt lokalt.
            */
            [
                900,
                2200,
                4200
            ]
                .forEach(
                    delay => {

                        setTimeout(
                            () => {

                                start11V9SyncLogoFromDbu(
                                    true
                                );

                                start11V9RefreshSwitcherLogo();

                                start11V9UpdateThemeIdentity();

                            },
                            delay
                        );

                    }
                );

        }
    );

}


/* =========================================================
   HOLD-SKIFT → TEMA + LOGO
========================================================= */

if (
    typeof changeTeam ===
    "function"
) {

    const changeTeamBeforeV9 =
        changeTeam;


    changeTeam =
        async function (
            teamId
        ) {

            const result =
                await changeTeamBeforeV9(
                    teamId
                );


            start11V9CurrentTheme =
                start11V9GetActiveTheme();


            start11V9ApplyTheme(
                start11V9CurrentTheme
            );


            /*
                V7 har allerede indlæst det nye holds DBU-data.
            */
            start11V9SyncLogoFromDbu(
                false
            );


            start11V9RefreshSwitcherLogo();


            return result;

        };

}


/* =========================================================
   INIT V9
========================================================= */

function start11InitThemeV9() {

    start11V9InstallThemeStyles();

    start11V9EnsureThemeModal();

    start11V9InstallDesignMenuItem();

    start11V9InstallDbuLogoSyncHook();

    start11V9MarkSubstituteKeepers();


    if (
        !session ||
        !activeTeamId
    ) {

        setTimeout(
            start11InitThemeV9,
            350
        );

        return;

    }


    start11V9CurrentTheme =
        start11V9GetActiveTheme();


    /*
        Forsøg automatisk at finde det aktive holds klublogo
        i allerede gemte DBU-kampe.
    */
    start11V9SyncLogoFromDbu(
        false
    );


    start11V9ApplyTheme(
        start11V9CurrentTheme
    );


    document.documentElement
        .style.setProperty(
            "--s11-primary-text",
            start11V9ReadableTextColor(
                start11V9CurrentTheme
                    .primaryColor
            )
        );


    start11V9RefreshSwitcherLogo();


    /*
        Dropdownen eller DBU-knappen kan være blevet lavet
        efter første init. Prøv en enkelt gang mere.
    */
    setTimeout(
        () => {

            start11V9InstallDesignMenuItem();

            start11V9InstallDbuLogoSyncHook();

            start11V9RefreshSwitcherLogo();

        },
        1300
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
                start11InitThemeV9,
                1450
            )
    );

} else {

    setTimeout(
        start11InitThemeV9,
        1450
    );

}


/* =========================================================
   START11 – TEMA FIX V10
   ---------------------------------------------------------
   V9 ændrede de nye V9-elementer, men den eksisterende
   START11-CSS bruger stadig gamle variabler som:
   --s11-green
   --s11-green-hot
   --s11-border
   --s11-border-strong

   Desuden bruger spillertrøjen `background:` med gradient,
   så `background-color:` fra V9 kunne ikke overtage den.

   V10 forbinder derfor HELE den gamle UI til det aktive tema
   og overskriver de rigtige shirt-selectors.
========================================================= */


function start11V10HexToRgb(
    hex
) {

    const clean =
        start11V9NormalizeHex(
            hex,
            "#82FF54"
        )
            .slice(1);


    return {
        r:
            parseInt(
                clean.slice(0, 2),
                16
            ),

        g:
            parseInt(
                clean.slice(2, 4),
                16
            ),

        b:
            parseInt(
                clean.slice(4, 6),
                16
            )
    };

}


function start11V10ApplyLegacyVariables(
    theme
) {

    const clean =
        start11V9SanitizeTheme(
            theme
        );


    const root =
        document.documentElement;


    const primaryText =
        start11V9ReadableTextColor(
            clean.primaryColor
        );


    const primaryRgb =
        start11V10HexToRgb(
            clean.primaryColor
        );


    const secondaryRgb =
        start11V10HexToRgb(
            clean.secondaryColor
        );


    /*
        V9 variabler
    */
    root.style.setProperty(
        "--s11-primary",
        clean.primaryColor
    );

    root.style.setProperty(
        "--s11-secondary",
        clean.secondaryColor
    );

    root.style.setProperty(
        "--s11-primary-text",
        primaryText
    );


    /*
        GAMLE START11 VARIABLER.
        Det er disse, størstedelen af dashboardets oprindelige
        CSS faktisk bruger.
    */
    root.style.setProperty(
        "--s11-green",
        clean.primaryColor
    );

    root.style.setProperty(
        "--s11-green-hot",
        clean.primaryColor
    );

    root.style.setProperty(
        "--s11-green-dark",
        clean.surfaceAccent
    );


    root.style.setProperty(
        "--s11-border",
        `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, .16)`
    );

    root.style.setProperty(
        "--s11-border-strong",
        `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, .42)`
    );


    root.style.setProperty(
        "--s11-theme-glow",
        `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, .28)`
    );

    root.style.setProperty(
        "--s11-theme-glow-soft",
        `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, .10)`
    );

    root.style.setProperty(
        "--s11-secondary-glow",
        `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, .18)`
    );

}


/*
    Wrap V9's apply-funktion, så både nye og gamle CSS-systemer
    bliver opdateret hver eneste gang temaet ændres eller previewes.
*/
if (
    typeof start11V9ApplyTheme ===
    "function"
) {

    const start11V9ApplyThemeBeforeV10 =
        start11V9ApplyTheme;


    start11V9ApplyTheme =
        function (
            theme
        ) {

            start11V9ApplyThemeBeforeV10(
                theme
            );


            start11V10ApplyLegacyVariables(
                theme
            );


            start11V10RefreshKitClasses();

        };

}


/* =========================================================
   KORREKTE KLASSER PÅ SPILLERNE
========================================================= */

function start11V10RefreshKitClasses() {

    document
        .querySelectorAll(
            "#pitch .player-slot"
        )
        .forEach(
            (
                slot,
                index
            ) => {

                const player =
                    Array.isArray(
                        spillere
                    )
                        ? spillere[index]
                        : null;


                slot.classList.toggle(
                    "start11-v10-outfield",
                    Boolean(
                        player &&
                        player.position !==
                            "GK"
                    )
                );


                slot.classList.toggle(
                    "start11-v10-keeper",
                    player?.position ===
                        "GK"
                );

            }
        );


    document
        .querySelectorAll(
            "#substituteList .substitute"
        )
        .forEach(
            (
                row,
                index
            ) => {

                const player =
                    Array.isArray(
                        udskiftere
                    )
                        ? udskiftere[
                            index
                        ]
                        : null;


                row.classList.toggle(
                    "start11-v10-outfield",
                    Boolean(
                        player &&
                        player.position !==
                            "GK"
                    )
                );


                row.classList.toggle(
                    "start11-v10-keeper",
                    player?.position ===
                        "GK"
                );

            }
        );

}


/*
    Formation-rendereren bygger spillerne igen, så opdatér
    klasser efter hver render.
*/
if (
    typeof opdaterFormation ===
    "function"
) {

    const opdaterFormationBeforeV10 =
        opdaterFormation;


    opdaterFormation =
        function (...args) {

            const result =
                opdaterFormationBeforeV10(
                    ...args
                );


            requestAnimationFrame(
                start11V10RefreshKitClasses
            );


            return result;

        };

}


if (
    typeof opdaterUdskiftere ===
    "function"
) {

    const opdaterUdskiftereBeforeV10 =
        opdaterUdskiftere;


    opdaterUdskiftere =
        function (...args) {

            const result =
                opdaterUdskiftereBeforeV10(
                    ...args
                );


            requestAnimationFrame(
                start11V10RefreshKitClasses
            );


            return result;

        };

}


/* =========================================================
   HELE DASHBOARDET FØLGER TEMAET
========================================================= */

function start11V10InstallFullThemeStyles() {

    if (
        document.getElementById(
            "start11V10FullThemeStyles"
        )
    ) {

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "start11V10FullThemeStyles";


    style.textContent = `

        /* ==========================================
           BRAND / TOPNAV
        ========================================== */

        .start11-brand,
        .start11-brand span,
        .start11-logo,
        .start11-logo span {
            color:
                var(--s11-primary) !important;

            text-shadow:
                0 0 18px
                var(--s11-theme-glow-soft) !important;
        }

        .start11-nav-item.active {
            color:
                var(--s11-primary) !important;
        }

        .start11-nav-item.active::after {
            background:
                var(--s11-primary) !important;

            box-shadow:
                0 0 14px
                var(--s11-theme-glow) !important;
        }


        /* ==========================================
           GENERELLE KORT / PANELER
        ========================================== */

        .start11-card,
        .next-match-card,
        .upcoming-card,
        .dbu-connect-card,
        .match-squad-card,
        .full-squad-card,
        .match-info-card,
        .tactics-card,
        .coach-card,
        .pitch-card,
        .substitutes-card,
        .start11-v8-latest-card {
            border-color:
                var(--s11-border) !important;
        }


        .start11-card-heading h2,
        .start11-card h2 {
            text-shadow:
                0 0 18px
                rgba(0,0,0,.28);
        }


        /* ==========================================
           GRØNNE/LIME TEKSTER → PRIMÆR FARVE
        ========================================== */

        .start11-eyebrow,
        .start11-modal-kicker,
        .start11-count-badge,
        .start11-text-button,
        .start11-secondary-action,
        .start11-outline-action,
        .start11-v8-club-section-header span,
        .start11-v8-club-add-team,
        .start11-v8-large-add-club,
        .start11-v8-inline-add:hover,
        .start11-v8-menu-check,
        .start11-v8-menu-club-heading strong,
        .start11-v8-latest-calendar,
        .start11-v5-date,
        .start11-v5-time,
        #start11CalendarHeaderButton,
        .start11-squad-action.select {
            color:
                var(--s11-primary) !important;
        }


        /* ==========================================
           PRIMÆRE KNAPPER
        ========================================== */

        .start11-primary-action,
        .start11-primary-button,
        #saveButton,
        #saveAccountProfileButton,
        #saveSquadPlayerButton,
        #syncDbuMatchesButton,
        #createTeamFromDashboard,
        .start11-v9-save-theme {
            border-color:
                var(--s11-primary) !important;

            background:
                linear-gradient(
                    90deg,
                    var(--s11-primary),
                    var(--s11-secondary)
                ) !important;

            color:
                var(--s11-primary-text) !important;

            box-shadow:
                0 8px 24px
                var(--s11-theme-glow-soft) !important;
        }


        /* ==========================================
           OUTLINE-KNAPPER
        ========================================== */

        .start11-secondary-action,
        .start11-outline-action,
        .start11-v8-club-add-team,
        .start11-v8-add-club-menu,
        .start11-v8-large-add-club,
        .start11-v8-switcher-button,
        .start11-v8-switcher-menu {
            border-color:
                var(--s11-border-strong) !important;
        }


        /* ==========================================
           TABS
        ========================================== */

        .match-squad-tabs button.active,
        .start11-squad-tab.active,
        [data-squad-tab].active,
        .start11-tab.active {
            background:
                var(--s11-primary) !important;

            color:
                var(--s11-primary-text) !important;

            border-color:
                var(--s11-primary) !important;
        }


        /* ==========================================
           BADGES / STATUS
           Bevarer røde/blå status-typer, men almindelige
           grønne badges følger temaet.
        ========================================== */

        .start11-count-badge,
        .team-active-badge,
        .start11-v8-team-card.active,
        .start11-v8-menu-team.active {
            border-color:
                var(--s11-border-strong) !important;
        }

        .team-active-badge,
        .start11-v8-menu-team.active {
            color:
                var(--s11-primary) !important;
        }


        /* ==========================================
           UPCOMING KAMP – AKTIV RÆKKE
        ========================================== */

        .start11-upcoming-v5-row.current {
            border-color:
                var(--s11-primary) !important;

            background:
                linear-gradient(
                    90deg,
                    var(--s11-theme-glow-soft),
                    transparent
                ) !important;
        }


        /* ==========================================
           INPUT FOCUS
        ========================================== */

        input:focus,
        textarea:focus,
        select:focus {
            border-color:
                var(--s11-primary) !important;
        }


        /* ==========================================
           CHECKBOXES
        ========================================== */

        input[type="checkbox"],
        input[type="radio"] {
            accent-color:
                var(--s11-primary) !important;
        }


        /* ==========================================
           SPILLERTRØJER – VIGTIG FIX
           Den gamle CSS bruger BACKGROUND gradient.
           Derfor skal vi erstatte hele background-property.
        ========================================== */

        #pitch
        .player-slot.start11-v10-outfield
        .shirt,

        #pitch
        .player-slot:not(.goalkeeper):not(.empty-slot)
        .shirt,

        .details-shirt:not(.goalkeeper),

        #substituteList
        .substitute.start11-v10-outfield
        .sub-shirt {
            background:
                linear-gradient(
                    90deg,
                    color-mix(
                        in srgb,
                        var(--s11-shirt) 72%,
                        #000
                    ),
                    var(--s11-shirt) 34%,
                    color-mix(
                        in srgb,
                        var(--s11-shirt) 90%,
                        #fff
                    ) 50%,
                    var(--s11-shirt) 66%,
                    color-mix(
                        in srgb,
                        var(--s11-shirt) 72%,
                        #000
                    )
                ) !important;

            color:
                var(--s11-shirt-text) !important;

            filter:
                drop-shadow(
                    0 12px 12px
                    rgba(0,0,0,.72)
                )
                drop-shadow(
                    0 0 9px
                    var(--s11-theme-glow-soft)
                ) !important;
        }


        #pitch
        .player-slot.start11-v10-outfield
        .shirt::before,

        #pitch
        .player-slot:not(.goalkeeper):not(.empty-slot)
        .shirt::before {
            background:
                color-mix(
                    in srgb,
                    var(--s11-shirt) 64%,
                    #000
                ) !important;
        }


        /* ==========================================
           MÅLMANDSTRØJE
        ========================================== */

        #pitch
        .player-slot.start11-v10-keeper
        .shirt,

        #pitch
        .player-slot.goalkeeper
        .shirt,

        .details-shirt.goalkeeper,

        #substituteList
        .substitute.start11-v10-keeper
        .sub-shirt {
            background:
                linear-gradient(
                    90deg,
                    color-mix(
                        in srgb,
                        var(--s11-gk-shirt) 68%,
                        #000
                    ),
                    var(--s11-gk-shirt) 45%,
                    color-mix(
                        in srgb,
                        var(--s11-gk-shirt) 90%,
                        #fff
                    ) 52%,
                    var(--s11-gk-shirt) 72%,
                    color-mix(
                        in srgb,
                        var(--s11-gk-shirt) 66%,
                        #000
                    )
                ) !important;

            color:
                var(--s11-gk-shirt-text) !important;
        }


        #pitch
        .player-slot.start11-v10-keeper
        .shirt::before,

        #pitch
        .player-slot.goalkeeper
        .shirt::before {
            background:
                color-mix(
                    in srgb,
                    var(--s11-gk-shirt) 60%,
                    #000
                ) !important;
        }


        /* ==========================================
           NAVNEPLADER
        ========================================== */

        #pitch .player-slot .player-name {
            background:
                linear-gradient(
                    180deg,
                    color-mix(
                        in srgb,
                        var(--s11-nameplate) 90%,
                        #fff
                    ),
                    var(--s11-nameplate)
                ) !important;

            color:
                var(--s11-nameplate-text) !important;

            border-color:
                color-mix(
                    in srgb,
                    var(--s11-primary) 24%,
                    transparent
                ) !important;
        }


        /* ==========================================
           TOMME SPILLERPLADSER
           Hold dem neutrale og halvtransparente.
        ========================================== */

        #pitch
        .player-slot.empty-slot
        .shirt {
            background:
                linear-gradient(
                    90deg,
                    rgba(90,100,92,.18),
                    rgba(135,145,137,.25),
                    rgba(90,100,92,.18)
                ) !important;

            color:
                rgba(255,255,255,.34) !important;
        }


        #pitch
        .player-slot.empty-slot
        .shirt::before {
            background:
                rgba(100,110,102,.22) !important;
        }


        /* ==========================================
           TOPBAR GEM-KNAP
        ========================================== */

        .start11-topbar-right
        #saveButton {
            color:
                var(--s11-primary-text) !important;
        }


        /* ==========================================
           TEMA PREVIEW
        ========================================== */

        .start11-v9-preview-shirt {
            background:
                linear-gradient(
                    90deg,
                    color-mix(
                        in srgb,
                        var(--s11-shirt) 72%,
                        #000
                    ),
                    var(--s11-shirt),
                    color-mix(
                        in srgb,
                        var(--s11-shirt) 90%,
                        #fff
                    ),
                    var(--s11-shirt),
                    color-mix(
                        in srgb,
                        var(--s11-shirt) 72%,
                        #000
                    )
                ) !important;

            color:
                var(--s11-shirt-text) !important;
        }

    `;


    document.head.appendChild(
        style
    );

}


/* =========================================================
   INIT V10
========================================================= */

function start11InitFullThemeV10() {

    start11V10InstallFullThemeStyles();


    const theme =
        typeof start11V9GetActiveTheme ===
            "function"
            ? start11V9GetActiveTheme()
            : START11_V9_DEFAULT_THEME;


    start11V10ApplyLegacyVariables(
        theme
    );


    start11V10RefreshKitClasses();


    /*
        DOM kan ændre sig ved holdskift / formation / spillerændring.
        MutationObserver holder kun klasserne korrekte – den ændrer
        ikke data og er derfor billig.
    */
    const pitch =
        document.getElementById(
            "pitch"
        );


    if (
        pitch &&
        pitch.dataset.themeObserverV10 !==
            "1"
    ) {

        pitch.dataset.themeObserverV10 =
            "1";


        const observer =
            new MutationObserver(
                () => {

                    start11V10RefreshKitClasses();

                }
            );


        observer.observe(
            pitch,
            {
                childList: true,
                subtree: true
            }
        );

    }


    setTimeout(
        () => {

            start11V10RefreshKitClasses();

            start11V10ApplyLegacyVariables(
                typeof start11V9GetActiveTheme ===
                    "function"
                    ? start11V9GetActiveTheme()
                    : theme
            );

        },
        1200
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
                start11InitFullThemeV10,
                1750
            )
    );

} else {

    setTimeout(
        start11InitFullThemeV10,
        1750
    );

}


/* =========================================================
   START11 – INDIVIDUEL SPILLERUDVIKLING V11
   Isoleret patch oven på V10. Ingen HTML/CSS-filer kræves.
========================================================= */

const START11_V11_ATTR_DEFAULTS = [
  ['Teknik','Teknisk'],['Førsteberøring','Teknisk'],['Beslutninger','Taktisk'],
  ['Positionering','Taktisk'],['Acceleration','Fysisk'],['Arbejdsindsats','Mentalt']
].map(([name,category],i)=>({id:'a'+i,name,category,rating:50,radar:true}));
let start11V11PlayerId=null, start11V11Tab='attributes', start11V11Draft=null;

function start11V11Esc(v){return String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;')}
function start11V11Id(p='id'){return `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`}
function start11V11Rate(v){v=Math.round(Number(v)||1);return Math.max(1,Math.min(100,v))}
function start11V11Today(){return new Date().toISOString().slice(0,10)}
function start11V11Player(id=start11V11PlayerId){return Array.isArray(start11FullSquad)?start11FullSquad.find(p=>p.id===id):null}
function start11V11Clone(v){return JSON.parse(JSON.stringify(v))}
function start11V11Dev(raw={}){
  const d=raw&&typeof raw==='object'?raw:{};
  return {
    attributes:Array.isArray(d.attributes)?d.attributes.map(a=>({id:String(a.id||start11V11Id('a')),name:String(a.name||'Attribute'),category:String(a.category||'Andet'),rating:start11V11Rate(a.rating),radar:a.radar!==false})):start11V11Clone(START11_V11_ATTR_DEFAULTS),
    evaluations:Array.isArray(d.evaluations)?d.evaluations:[],
    focus:Array.isArray(d.focus)?d.focus:[],
    trainingPlan:Array.isArray(d.trainingPlan)?d.trainingPlan:[],
    videos:Array.isArray(d.videos)?d.videos:[],
    coachNote:String(d.coachNote||''),updatedAt:String(d.updatedAt||new Date().toISOString())
  }
}
function start11V11Overall(d){const a=d?.attributes||[];return a.length?Math.round(a.reduce((s,x)=>s+start11V11Rate(x.rating),0)/a.length):0}
function start11V11Save(){const p=start11V11Player();if(!p||!start11V11Draft)return;start11V11Draft.updatedAt=new Date().toISOString();p.development=start11V11Dev(start11V11Draft);start11SaveFullSquad?.();scheduleCloudSave?.();visNotification?.('Spillerudviklingen er gemt.')}

function start11V11Radar(d,comparison=null,size=330){
  let a=(d?.attributes||[]).filter(x=>x.radar!==false).slice(0,8); if(a.length<3)a=(d?.attributes||[]).slice(0,8);
  if(a.length<3)return '<div class="s11v11-empty">Vælg mindst 3 attributes til radardiagrammet.</div>';
  const c=size/2,r=size*.31,lr=size*.43,n=a.length;
  const pt=(i,f=1,rr=r)=>{const ang=-Math.PI/2+i*Math.PI*2/n;return [c+Math.cos(ang)*rr*f,c+Math.sin(ang)*rr*f]};
  const poly=vals=>vals.map((v,i)=>pt(i,start11V11Rate(v)/100).map(x=>x.toFixed(1)).join(',')).join(' ');
  const rings=[.2,.4,.6,.8,1].map(f=>`<polygon points="${a.map((_,i)=>pt(i,f).map(x=>x.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="rgba(255,255,255,.13)"/>`).join('');
  const axes=a.map((_,i)=>{const [x,y]=pt(i);return `<line x1="${c}" y1="${c}" x2="${x}" y2="${y}" stroke="rgba(255,255,255,.13)"/>`}).join('');
  let old=''; if(comparison){const vals=a.map(x=>(comparison.find(o=>o.id===x.id)||comparison.find(o=>o.name===x.name))?.rating||0);old=`<polygon points="${poly(vals)}" fill="rgba(255,255,255,.03)" stroke="rgba(255,255,255,.45)" stroke-width="2" stroke-dasharray="5 5"/>`}
  const labels=a.map((x,i)=>{const [lx,ly]=pt(i,1,lr),anc=lx<c-8?'end':lx>c+8?'start':'middle';return `<text x="${lx}" y="${ly}" text-anchor="${anc}" class="s11v11-rlabel">${start11V11Esc(x.name)}</text><text x="${lx}" y="${ly+14}" text-anchor="${anc}" class="s11v11-rval">${start11V11Rate(x.rating)}</text>`}).join('');
  return `<svg class="s11v11-radar" viewBox="0 0 ${size} ${size}">${rings}${axes}${old}<polygon points="${poly(a.map(x=>x.rating))}" fill="color-mix(in srgb,var(--s11-primary) 20%,transparent)" stroke="var(--s11-primary)" stroke-width="3"/>${a.map((x,i)=>{const [px,py]=pt(i,start11V11Rate(x.rating)/100);return `<circle cx="${px}" cy="${py}" r="4" fill="var(--s11-primary)"/>`}).join('')}${labels}</svg>`
}

function start11V11Styles(){if(document.getElementById('s11v11css'))return;const s=document.createElement('style');s.id='s11v11css';s.textContent=`
#start11PlayerDevelopmentModalV11{z-index:10050}.s11v11-shell{width:min(1380px,calc(100vw - 28px));height:min(900px,calc(100vh - 28px));max-width:none!important;padding:0!important;overflow:hidden;border:1px solid var(--s11-border-strong);border-radius:12px;background:#071009;color:#fff}.s11v11-top{min-height:104px;display:flex;justify-content:space-between;align-items:center;gap:20px;padding:18px 24px;border-bottom:1px solid rgba(255,255,255,.09);background:linear-gradient(90deg,color-mix(in srgb,var(--s11-primary) 9%,transparent),transparent 48%)}.s11v11-title{display:flex;gap:15px;align-items:center}.s11v11-num{min-width:58px;font-size:50px;font-weight:950;color:color-mix(in srgb,var(--s11-primary) 52%,transparent);text-align:center}.s11v11-title h2{margin:0 0 5px;font-size:25px}.s11v11-title p{margin:0;color:#92a096;font-size:10px}.s11v11-ovr{display:flex;align-items:center;gap:10px}.s11v11-ovrbox{min-width:70px;padding:9px;border:1px solid var(--s11-border-strong);border-radius:7px;text-align:center}.s11v11-ovrbox span{display:block;color:#8d998f;font-size:8px}.s11v11-ovrbox strong{color:var(--s11-primary);font-size:28px}.s11v11-btn{min-height:37px;padding:0 13px;border:1px solid var(--s11-border-strong);border-radius:6px;background:#0a120c;color:#dbe2dc;font:inherit;font-size:9px;font-weight:900;cursor:pointer}.s11v11-btn.primary{background:linear-gradient(90deg,var(--s11-primary),var(--s11-secondary));color:var(--s11-primary-text);border-color:var(--s11-primary)}.s11v11-tabs{display:flex;min-height:46px;overflow-x:auto;border-bottom:1px solid rgba(255,255,255,.08)}.s11v11-tab{min-width:130px;border:0;border-bottom:2px solid transparent;background:transparent;color:#919c93;font:inherit;font-size:9px;font-weight:900;cursor:pointer}.s11v11-tab.active{color:#fff;border-bottom-color:var(--s11-primary);background:color-mix(in srgb,var(--s11-primary) 7%,transparent)}.s11v11-main{height:calc(100% - 150px);display:grid;grid-template-columns:minmax(0,1fr) 370px}.s11v11-content,.s11v11-side{overflow-y:auto;padding:18px}.s11v11-side{border-left:1px solid rgba(255,255,255,.08)}.s11v11-panel{padding:14px;border:1px solid rgba(255,255,255,.085);border-radius:8px;background:rgba(255,255,255,.016)}.s11v11-panel+.s11v11-panel{margin-top:12px}.s11v11-head{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:12px}.s11v11-head strong{font-size:10px}.s11v11-muted{color:#849087;font-size:8px;line-height:1.5}.s11v11-attrs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.s11v11-attr{display:grid;grid-template-columns:minmax(0,1fr) 92px 58px 31px;align-items:center;gap:7px;padding:8px;border:1px solid rgba(255,255,255,.075);border-radius:7px;background:#08100a}.s11v11-input,.s11v11-select,.s11v11-text{box-sizing:border-box;width:100%;border:1px solid rgba(255,255,255,.12);border-radius:5px;outline:none;background:#050a06;color:#fff;font:inherit;font-size:9px}.s11v11-input,.s11v11-select{height:32px;padding:0 8px}.s11v11-text{min-height:80px;padding:9px;resize:vertical}.s11v11-rating{display:grid;place-items:center;height:31px;border:1px solid var(--s11-border);border-radius:5px;color:var(--s11-primary);font-size:12px;font-weight:950}.s11v11-del{width:31px;height:31px;border:1px solid rgba(255,255,255,.1);border-radius:5px;background:transparent;color:#89958b;cursor:pointer}.s11v11-radar{width:100%;overflow:visible}.s11v11-rlabel{fill:#dce3dd;font-size:10px;font-weight:800}.s11v11-rval{fill:var(--s11-primary);font-size:10px;font-weight:950}.s11v11-empty{min-height:220px;display:grid;place-items:center;color:#7f8b82;font-size:9px}.s11v11-stack{display:grid;gap:9px}.s11v11-item{padding:11px;border:1px solid rgba(255,255,255,.075);border-radius:7px;background:#08100a}.s11v11-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) 34px;gap:8px}.s11v11-grid.four{grid-template-columns:1.2fr .7fr .8fr 34px}.s11v11-grid.video{grid-template-columns:1fr 1fr 90px 34px}.s11v11-item .s11v11-text,.s11v11-item>.s11v11-input{margin-top:8px}.s11v11-eval{display:grid;grid-template-columns:95px 1fr 34px;gap:10px;align-items:center;padding:11px;border:1px solid rgba(255,255,255,.075);border-radius:7px;background:#08100a}.s11v11-eval strong{color:var(--s11-primary)}#start11DevelopmentButtonV11{color:var(--s11-primary)!important;border-color:var(--s11-border-strong)!important}#start11PlayerPdfV11{display:none}.s11v11-pdf{width:210mm;margin:auto;background:#fff;color:#111;font-family:Arial,sans-serif}.s11v11-page{width:210mm;min-height:297mm;box-sizing:border-box;padding:14mm;page-break-after:always}.s11v11-page:last-child{page-break-after:auto}.s11v11-phead{display:flex;justify-content:space-between;border-bottom:2px solid #111;padding-bottom:6mm}.s11v11-phead h1{margin:2px 0;font-size:24px}.s11v11-plogo{width:22mm;height:22mm;object-fit:contain}.s11v11-pgrid{display:grid;grid-template-columns:1fr 1fr;gap:7mm;margin-top:7mm}.s11v11-pcard{padding:5mm;border:1px solid #ddd;border-radius:3mm}.s11v11-pcard h2{font-size:13px;margin:0 0 4mm}.s11v11-pcard p,.s11v11-pcard li{font-size:9.5px;line-height:1.45}.s11v11-ptable{width:100%;border-collapse:collapse;font-size:9px}.s11v11-ptable th,.s11v11-ptable td{padding:2.5mm;border-bottom:1px solid #ddd;text-align:left;vertical-align:top}.s11v11-pcard .s11v11-rlabel,.s11v11-pcard .s11v11-rval{fill:#111}.s11v11-pcard .s11v11-radar polygon,.s11v11-pcard .s11v11-radar line{stroke:#bbb}@media(max-width:980px){.s11v11-main{grid-template-columns:1fr;height:auto}.s11v11-side{border-left:0;border-top:1px solid rgba(255,255,255,.08)}.s11v11-shell{overflow:auto}.s11v11-attrs{grid-template-columns:1fr}}@media print{body>*{display:none!important}#start11PlayerPdfV11{display:block!important;position:absolute;inset:0;width:100%}@page{size:A4 portrait;margin:0}}
`;document.head.appendChild(s)}

function start11V11Entry(){const save=document.getElementById('saveSquadPlayerButton');if(!save||document.getElementById('start11DevelopmentButtonV11'))return;const b=document.createElement('button');b.id='start11DevelopmentButtonV11';b.type='button';b.className='start11-secondary-button';b.textContent='SPILLERUDVIKLING';b.style.display='none';b.onclick=()=>{if(!start11EditingSquadPlayerId)return visNotification?.('Gem spilleren først.');const id=start11EditingSquadPlayerId;start11CloseSquadPlayerModal?.();start11V11Open(id)};save.parentElement?.insertBefore(b,save)}
function start11V11Modal(){if(document.getElementById('start11PlayerDevelopmentModalV11'))return;const m=document.createElement('div');m.id='start11PlayerDevelopmentModalV11';m.className='modal';m.innerHTML='<div class="modal-content s11v11-shell"><div id="s11v11top" class="s11v11-top"></div><div id="s11v11tabs" class="s11v11-tabs"></div><div class="s11v11-main"><main id="s11v11content" class="s11v11-content"></main><aside id="s11v11side" class="s11v11-side"></aside></div></div>';m.onmousedown=e=>{if(e.target===m)start11V11Close()};document.body.appendChild(m)}
function start11V11Open(id){const p=start11V11Player(id);if(!p)return;start11V11PlayerId=id;start11V11Draft=start11V11Dev(p.development);start11V11Tab='attributes';start11V11Modal();start11V11Render();document.getElementById('start11PlayerDevelopmentModalV11').style.display='flex'}
function start11V11Close(){const m=document.getElementById('start11PlayerDevelopmentModalV11');if(m)m.style.display='none';start11V11PlayerId=null;start11V11Draft=null}
function start11V11LastEval(){return [...(start11V11Draft?.evaluations||[])].sort((a,b)=>String(b.date).localeCompare(String(a.date)))[0]||null}
function start11V11Render(){const p=start11V11Player();if(!p||!start11V11Draft)return;document.getElementById('s11v11top').innerHTML=`<div class="s11v11-title"><div class="s11v11-num">${start11V11Esc(p.number||'—')}</div><div><h2>${start11V11Esc(p.name)}</h2><p>${start11V11Esc(p.position||'—')} · Individuel spillerudvikling</p></div></div><div class="s11v11-ovr"><div class="s11v11-ovrbox"><span>OVR</span><strong>${start11V11Overall(start11V11Draft)}</strong></div><button id="s11v11pdf" class="s11v11-btn">GENERER PDF</button><button id="s11v11save" class="s11v11-btn primary">GEM</button><button id="s11v11close" class="s11v11-btn">LUK</button></div>`;document.getElementById('s11v11save').onclick=()=>{start11V11Save();start11V11Render()};document.getElementById('s11v11pdf').onclick=start11V11Pdf;document.getElementById('s11v11close').onclick=start11V11Close;start11V11Tabs();start11V11Content();start11V11Side()}
function start11V11Tabs(){const tabs=[['attributes','ATTRIBUTES'],['focus','SPILLERFOKUS'],['training','TRÆNINGSPLAN'],['videos','VIDEO'],['evaluations','EVALUERINGER'],['notes','NOTER']];const t=document.getElementById('s11v11tabs');t.innerHTML=tabs.map(([id,l])=>`<button class="s11v11-tab ${start11V11Tab===id?'active':''}" data-t="${id}">${l}</button>`).join('');t.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{start11V11Tab=b.dataset.t;start11V11Tabs();start11V11Content()})}
function start11V11Side(){const t=document.getElementById('s11v11side'),e=start11V11LastEval();t.innerHTML=`<section class="s11v11-panel"><div class="s11v11-head"><strong>RADARDIAGRAM</strong><span class="s11v11-muted">Maks. 8</span></div>${start11V11Radar(start11V11Draft,e?.attributes||null)}</section><section class="s11v11-panel"><div class="s11v11-head"><strong>STATUS</strong></div><div class="s11v11-stack"><div class="s11v11-item"><span class="s11v11-muted">Samlet rating</span><strong style="display:block;color:var(--s11-primary);font-size:24px">${start11V11Overall(start11V11Draft)}</strong></div><div class="s11v11-item"><span class="s11v11-muted">Aktive fokuspunkter</span><strong style="display:block;font-size:18px">${start11V11Draft.focus.filter(x=>x.status!=='Afsluttet').length}</strong></div><div class="s11v11-item"><span class="s11v11-muted">Evalueringer</span><strong style="display:block;font-size:18px">${start11V11Draft.evaluations.length}</strong></div></div></section>`}
function start11V11Content(){const t=document.getElementById('s11v11content');if(start11V11Tab==='attributes')return start11V11Attributes(t);if(start11V11Tab==='focus')return start11V11Focus(t);if(start11V11Tab==='training')return start11V11Training(t);if(start11V11Tab==='videos')return start11V11Videos(t);if(start11V11Tab==='evaluations')return start11V11Evals(t);start11V11Notes(t)}

function start11V11Attributes(t){t.innerHTML=`<section class="s11v11-panel"><div class="s11v11-head"><div><strong>ATTRIBUTES 1–100</strong><div class="s11v11-muted">Opret dine egne attributes. Vælg op til 8 til radar.</div></div><button id="s11v11addattr" class="s11v11-btn">+ ATTRIBUTE</button></div><div id="s11v11attrs" class="s11v11-attrs"></div></section>`;const l=document.getElementById('s11v11attrs');l.innerHTML=start11V11Draft.attributes.map(a=>`<div class="s11v11-attr" data-id="${start11V11Esc(a.id)}"><div><input class="s11v11-input" data-f="name" value="${start11V11Esc(a.name)}"><select class="s11v11-select" data-f="category">${['Teknisk','Taktisk','Fysisk','Mentalt','Målmand','Andet'].map(c=>`<option ${a.category===c?'selected':''}>${c}</option>`).join('')}</select></div><div><input data-f="rating" type="range" min="1" max="100" value="${a.rating}" style="width:100%;accent-color:var(--s11-primary)"><label class="s11v11-muted"><input data-f="radar" type="checkbox" ${a.radar!==false?'checked':''}> På radar</label></div><div class="s11v11-rating">${a.rating}</div><button class="s11v11-del" data-del>×</button></div>`).join('');l.querySelectorAll('[data-id]').forEach(r=>{const id=r.dataset.id,get=()=>start11V11Draft.attributes.find(a=>a.id===id);r.querySelectorAll('[data-f]').forEach(i=>{const f=i.dataset.f;i.oninput=i.onchange=()=>{const a=get();if(!a)return;if(f==='rating'){a.rating=start11V11Rate(i.value);r.querySelector('.s11v11-rating').textContent=a.rating}else if(f==='radar'){if(i.checked&&start11V11Draft.attributes.filter(x=>x.radar!==false).length>=8){i.checked=false;return visNotification?.('Der kan vises maks. 8 attributes på radardiagrammet.')}a.radar=i.checked}else a[f]=i.value;start11V11Side();document.querySelector('.s11v11-ovrbox strong').textContent=start11V11Overall(start11V11Draft)}});r.querySelector('[data-del]').onclick=()=>{start11V11Draft.attributes=start11V11Draft.attributes.filter(a=>a.id!==id);start11V11Attributes(t);start11V11Side()}});document.getElementById('s11v11addattr').onclick=()=>{start11V11Draft.attributes.push({id:start11V11Id('a'),name:'Nyt attribute',category:'Teknisk',rating:50,radar:start11V11Draft.attributes.filter(x=>x.radar!==false).length<8});start11V11Attributes(t);start11V11Side()}}

function start11V11BindList(root,key,prefix){root.querySelectorAll(`[data-${prefix}]`).forEach(r=>{const id=r.dataset[prefix],get=()=>start11V11Draft[key].find(x=>x.id===id);r.querySelectorAll('[data-f]').forEach(i=>{i.oninput=i.onchange=()=>{const x=get();if(x)x[i.dataset.f]=i.value;if(key==='focus')start11V11Side()}});r.querySelector('[data-del]')?.addEventListener('click',()=>{start11V11Draft[key]=start11V11Draft[key].filter(x=>x.id!==id);start11V11Content();start11V11Side()})})}
function start11V11Focus(t){t.innerHTML=`<section class="s11v11-panel"><div class="s11v11-head"><div><strong>SPILLERFOKUS</strong><div class="s11v11-muted">Konkrete udviklingsmål for spilleren.</div></div><button id="s11v11addfocus" class="s11v11-btn">+ FOKUSPUNKT</button></div><div id="s11v11focus" class="s11v11-stack">${start11V11Draft.focus.length?start11V11Draft.focus.map(x=>`<div class="s11v11-item" data-focus="${x.id}"><div class="s11v11-grid"><input class="s11v11-input" data-f="title" value="${start11V11Esc(x.title||'')}" placeholder="Fokusområde"><select class="s11v11-select" data-f="status">${['Aktiv','På vej','Afsluttet'].map(s=>`<option ${x.status===s?'selected':''}>${s}</option>`).join('')}</select><button class="s11v11-del" data-del>×</button></div><textarea class="s11v11-text" data-f="description" placeholder="Hvad skal udvikles?">${start11V11Esc(x.description||'')}</textarea><textarea class="s11v11-text" data-f="target" placeholder="Konkret mål/adfærd">${start11V11Esc(x.target||'')}</textarea></div>`).join(''):'<div class="s11v11-muted">Ingen fokuspunkter endnu.</div>'}</div></section>`;start11V11BindList(document.getElementById('s11v11focus'),'focus','focus');document.getElementById('s11v11addfocus').onclick=()=>{start11V11Draft.focus.push({id:start11V11Id('f'),title:'',description:'',target:'',status:'Aktiv'});start11V11Focus(t);start11V11Side()}}
function start11V11Training(t){t.innerHTML=`<section class="s11v11-panel"><div class="s11v11-head"><div><strong>INDIVIDUEL TRÆNINGSPLAN</strong><div class="s11v11-muted">Øvelser, hyppighed og udviklingsmål.</div></div><button id="s11v11addtraining" class="s11v11-btn">+ TRÆNING</button></div><div id="s11v11training" class="s11v11-stack">${start11V11Draft.trainingPlan.length?start11V11Draft.trainingPlan.map(x=>`<div class="s11v11-item" data-training="${x.id}"><div class="s11v11-grid four"><input class="s11v11-input" data-f="exercise" value="${start11V11Esc(x.exercise||'')}" placeholder="Øvelse"><input class="s11v11-input" data-f="frequency" value="${start11V11Esc(x.frequency||'')}" placeholder="Fx 2x ugentligt"><select class="s11v11-select" data-f="status">${['Planlagt','I gang','Gennemført'].map(s=>`<option ${x.status===s?'selected':''}>${s}</option>`).join('')}</select><button class="s11v11-del" data-del>×</button></div><textarea class="s11v11-text" data-f="goal" placeholder="Mål med træningen">${start11V11Esc(x.goal||'')}</textarea></div>`).join(''):'<div class="s11v11-muted">Ingen træningsplan endnu.</div>'}</div></section>`;start11V11BindList(document.getElementById('s11v11training'),'trainingPlan','training');document.getElementById('s11v11addtraining').onclick=()=>{start11V11Draft.trainingPlan.push({id:start11V11Id('tr'),exercise:'',frequency:'',goal:'',status:'Planlagt'});start11V11Training(t)}}
function start11V11Videos(t){t.innerHTML=`<section class="s11v11-panel"><div class="s11v11-head"><div><strong>VIDEO FRA KAMPE</strong><div class="s11v11-muted">Link, kamp, tidspunkt og analyse-note.</div></div><button id="s11v11addvideo" class="s11v11-btn">+ VIDEO</button></div><div id="s11v11videos" class="s11v11-stack">${start11V11Draft.videos.length?start11V11Draft.videos.map(x=>`<div class="s11v11-item" data-video="${x.id}"><div class="s11v11-grid video"><input class="s11v11-input" data-f="title" value="${start11V11Esc(x.title||'')}" placeholder="Titel"><input class="s11v11-input" data-f="match" value="${start11V11Esc(x.match||'')}" placeholder="Fx vs AGF"><input class="s11v11-input" data-f="timestamp" value="${start11V11Esc(x.timestamp||'')}" placeholder="34:20"><button class="s11v11-del" data-del>×</button></div><input class="s11v11-input" data-f="url" value="${start11V11Esc(x.url||'')}" placeholder="https://..."><textarea class="s11v11-text" data-f="note" placeholder="Hvad skal spilleren se?">${start11V11Esc(x.note||'')}</textarea></div>`).join(''):'<div class="s11v11-muted">Ingen videoer endnu.</div>'}</div></section>`;start11V11BindList(document.getElementById('s11v11videos'),'videos','video');document.getElementById('s11v11addvideo').onclick=()=>{start11V11Draft.videos.push({id:start11V11Id('v'),title:'',match:'',timestamp:'',url:'',note:''});start11V11Videos(t)}}
function start11V11Evals(t){const e=[...start11V11Draft.evaluations].sort((a,b)=>String(b.date).localeCompare(String(a.date)));t.innerHTML=`<section class="s11v11-panel"><div class="s11v11-head"><div><strong>EVALUERINGSHISTORIK</strong><div class="s11v11-muted">Gem et snapshot af de nuværende ratings.</div></div><button id="s11v11addeval" class="s11v11-btn primary">+ NY EVALUERING</button></div><div class="s11v11-stack">${e.length?e.map(x=>`<div class="s11v11-eval" data-eval="${x.id}"><strong>${start11V11Esc(x.date||'')}</strong><div><b>${start11V11Esc(x.title||'Evaluering')} · OVR ${start11V11Overall({attributes:x.attributes||[]})}</b><div class="s11v11-muted">${start11V11Esc(x.note||'Ingen note.')}</div></div><button class="s11v11-del" data-del>×</button></div>`).join(''):'<div class="s11v11-muted">Ingen evalueringer endnu.</div>'}</div></section>`;t.querySelectorAll('[data-eval]').forEach(r=>r.querySelector('[data-del]').onclick=()=>{start11V11Draft.evaluations=start11V11Draft.evaluations.filter(x=>x.id!==r.dataset.eval);start11V11Evals(t);start11V11Side()});document.getElementById('s11v11addeval').onclick=()=>{const title=prompt('Titel på evalueringen:','Status '+new Date().toLocaleDateString('da-DK'));if(title===null)return;const note=prompt('Kort note:','')||'';start11V11Draft.evaluations.push({id:start11V11Id('ev'),date:start11V11Today(),title:title||'Evaluering',note,attributes:start11V11Clone(start11V11Draft.attributes)});start11V11Evals(t);start11V11Side()}}
function start11V11Notes(t){t.innerHTML=`<section class="s11v11-panel"><div class="s11v11-head"><div><strong>TRÆNERNOTER</strong><div class="s11v11-muted">Samlet vurdering til udviklingsplanen og PDF'en.</div></div></div><textarea id="s11v11note" class="s11v11-text" style="min-height:220px" placeholder="Skriv samlet vurdering...">${start11V11Esc(start11V11Draft.coachNote)}</textarea></section>`;document.getElementById('s11v11note').oninput=e=>start11V11Draft.coachNote=e.target.value}

function start11V11Pdf(){start11V11Save();const p=start11V11Player(),d=start11V11Draft;if(!p||!d)return;const meta=typeof start11V8GetActiveMeta==='function'?start11V8GetActiveMeta():{clubName:'START11',teamName:''};const theme=typeof start11V9GetActiveTheme==='function'?start11V9GetActiveTheme():{};const logo=theme?.logo||'';const head=title=>`<header class="s11v11-phead"><div><b>START11 · ${start11V11Esc(meta.clubName||'')}</b><h1>${title}</h1><div>${start11V11Esc(p.name)} · #${start11V11Esc(p.number||'—')} · ${start11V11Esc(p.position||'—')} · ${start11V11Esc(meta.teamName||'')}</div></div>${logo?`<img class="s11v11-plogo" src="${start11V11Esc(logo)}">`:''}</header>`;const attr=d.attributes.map(a=>`<tr><td>${start11V11Esc(a.name)}</td><td>${start11V11Esc(a.category)}</td><td><b>${a.rating}</b></td></tr>`).join('');const focus=d.focus.length?`<ol>${d.focus.map(x=>`<li><b>${start11V11Esc(x.title||'Fokus')}</b>${x.description?' — '+start11V11Esc(x.description):''}${x.target?'<br><i>Mål: '+start11V11Esc(x.target)+'</i>':''}</li>`).join('')}</ol>`:'<p>Ingen fokuspunkter registreret.</p>';const train=d.trainingPlan.map(x=>`<tr><td>${start11V11Esc(x.exercise)}</td><td>${start11V11Esc(x.frequency)}</td><td>${start11V11Esc(x.goal)}</td><td>${start11V11Esc(x.status)}</td></tr>`).join('')||'<tr><td colspan="4">Ingen træningsplan.</td></tr>';const videos=d.videos.map(x=>`<div style="margin-bottom:4mm;padding:3mm;border:1px solid #ddd"><b>${start11V11Esc(x.title||'Videoklip')}</b><p>${start11V11Esc(x.match||'')} ${x.timestamp?'· '+start11V11Esc(x.timestamp):''}</p><p>${start11V11Esc(x.note||'')}</p>${x.url?`<a href="${start11V11Esc(x.url)}">${start11V11Esc(x.url)}</a>`:''}</div>`).join('')||'<p>Ingen videoklip.</p>';const evals=d.evaluations.map(x=>`<tr><td>${start11V11Esc(x.date||'')}</td><td>${start11V11Esc(x.title||'')}</td><td>${start11V11Overall({attributes:x.attributes||[]})}</td><td>${start11V11Esc(x.note||'')}</td></tr>`).join('')||'<tr><td colspan="4">Ingen tidligere evalueringer.</td></tr>';let out=document.getElementById('start11PlayerPdfV11');if(!out){out=document.createElement('div');out.id='start11PlayerPdfV11';document.body.appendChild(out)}out.innerHTML=`<div class="s11v11-pdf"><section class="s11v11-page">${head('Individuel spillerudvikling')}<div class="s11v11-pgrid"><div class="s11v11-pcard"><h2>Spillerprofil</h2><p><b>Samlet rating:</b> ${start11V11Overall(d)}</p><p><b>Position:</b> ${start11V11Esc(p.position||'—')}</p><h2>Trænerens vurdering</h2><p>${start11V11Esc(d.coachNote||'Ingen samlet vurdering endnu.')}</p></div><div class="s11v11-pcard"><h2>Radardiagram</h2>${start11V11Radar(d,start11V11LastEval()?.attributes||null,360)}</div></div><div class="s11v11-pcard" style="margin-top:7mm"><h2>Attributes</h2><table class="s11v11-ptable"><thead><tr><th>Attribute</th><th>Kategori</th><th>Rating</th></tr></thead><tbody>${attr}</tbody></table></div></section><section class="s11v11-page">${head('Fokus & træningsplan')}<div class="s11v11-pcard"><h2>Spillerfokus</h2>${focus}</div><div class="s11v11-pcard" style="margin-top:7mm"><h2>Individuel træningsplan</h2><table class="s11v11-ptable"><thead><tr><th>Øvelse</th><th>Hyppighed</th><th>Mål</th><th>Status</th></tr></thead><tbody>${train}</tbody></table></div></section><section class="s11v11-page">${head('Video & evaluering')}<div class="s11v11-pcard"><h2>Videoklip fra kampe</h2>${videos}</div><div class="s11v11-pcard" style="margin-top:7mm"><h2>Evalueringshistorik</h2><table class="s11v11-ptable"><thead><tr><th>Dato</th><th>Evaluering</th><th>OVR</th><th>Note</th></tr></thead><tbody>${evals}</tbody></table></div></section></div>`;const old=document.title;document.title=`${p.name||'Spiller'} - Individuel udviklingsplan`;setTimeout(()=>{window.print();setTimeout(()=>document.title=old,700)},250)}

if(typeof start11OpenSquadPlayerModal==='function'){const oldStart11OpenSquadPlayerModal=start11OpenSquadPlayerModal;start11OpenSquadPlayerModal=function(id=null){const r=oldStart11OpenSquadPlayerModal(id);start11V11Entry();const b=document.getElementById('start11DevelopmentButtonV11');if(b)b.style.display=id?'inline-flex':'none';return r}}
function start11V11Init(){start11V11Styles();start11V11Modal();start11V11Entry();[800,1800,3500].forEach(ms=>setTimeout(start11V11Entry,ms))}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(start11V11Init,1200));else setTimeout(start11V11Init,1200);



/* =========================================================
   START11 – SAMLET SPILLERPROFIL V12
   ---------------------------------------------------------
   Bygger oven på V11.

   V12 samler:
   - Tilføj spiller
   - Rediger spiller
   - Basisprofil
   - Styrker / udviklingsområder
   - Fokus med/uden bold
   - Attributes
   - Radar
   - Individuel træningsplan
   - Video
   - Evalueringer
   - Noter
   - PDF

   Desuden:
   - Klik på spiller i startopstillingen viser radar i
     den eksisterende spiller-detaljeboks.
   - "Rediger spiller" fra detaljeboksen åbner den SAMME
     samlede spillerprofil.
   - "Tilføj ny spiller" og "Rediger spiller" åbner nu
     samme V12-menu.
========================================================= */


let start11V12PlayerId =
    null;

let start11V12IsNew =
    false;

let start11V12ProfileDraft =
    null;

let start11V12DevelopmentDraft =
    null;

let start11V12Tab =
    "profile";


/* =========================================================
   HELPERS
========================================================= */

function start11V12Clone(
    value
) {

    return JSON.parse(
        JSON.stringify(
            value
        )
    );

}


function start11V12Escape(
    value
) {

    return String(
        value ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


function start11V12MakeId() {

    if (
        typeof start11MakeId ===
        "function"
    ) {

        return start11MakeId();

    }


    return (
        "player_" +
        Date.now().toString(36) +
        "_" +
        Math.random()
            .toString(36)
            .slice(2, 8)
    );

}


function start11V12DefaultProfile() {

    return {
        id:
            start11V12MakeId(),

        name:
            "",

        number:
            "",

        position:
            "CM",

        status:
            "available",

        selected:
            false,

        strengths:
            "",

        weaknesses:
            "",

        focusWithBall:
            "",

        focusWithoutBall:
            "",

        video:
            "",

        development:
            typeof start11V11Dev ===
                "function"
                ? start11V11Dev()
                : {
                    attributes: [],
                    evaluations: [],
                    focus: [],
                    trainingPlan: [],
                    videos: [],
                    coachNote: ""
                }
    };

}


function start11V12FindFullSquadPlayerFromMatchPlayer(
    matchPlayer
) {

    if (!matchPlayer) {

        return null;

    }


    if (
        matchPlayer.squadId
    ) {

        const byId =
            start11FullSquad.find(
                item =>
                    item.id ===
                    matchPlayer.squadId
            );


        if (byId) {

            return byId;

        }

    }


    if (
        typeof start11SamePlayer ===
        "function"
    ) {

        const same =
            start11FullSquad.find(
                item =>
                    start11SamePlayer(
                        item,
                        matchPlayer
                    )
            );


        if (same) {

            return same;

        }

    }


    const name =
        String(
            matchPlayer.name ||
            ""
        )
            .trim()
            .toLowerCase();


    const number =
        String(
            matchPlayer.number ||
            ""
        )
            .trim();


    return start11FullSquad.find(
        item => {

            const sameName =
                String(
                    item.name ||
                    ""
                )
                    .trim()
                    .toLowerCase() ===
                    name;


            const sameNumber =
                !number ||
                !item.number ||
                String(
                    item.number
                ).trim() ===
                number;


            return (
                sameName &&
                sameNumber
            );

        }
    ) || null;

}


function start11V12GetActivePlayer() {

    if (
        start11V12IsNew
    ) {

        return start11V12ProfileDraft;

    }


    return start11FullSquad.find(
        player =>
            player.id ===
            start11V12PlayerId
    ) || null;

}


function start11V12NormalizeDevelopment(
    raw
) {

    if (
        typeof start11V11Dev ===
        "function"
    ) {

        return start11V11Dev(
            raw
        );

    }


    return start11V12Clone(
        raw || {
            attributes: [],
            evaluations: [],
            focus: [],
            trainingPlan: [],
            videos: [],
            coachNote: ""
        }
    );

}


function start11V12Overall() {

    if (
        typeof start11V11Overall ===
        "function"
    ) {

        return start11V11Overall(
            start11V12DevelopmentDraft
        );

    }


    const attributes =
        start11V12DevelopmentDraft
            ?.attributes ||
        [];


    if (!attributes.length) {

        return 0;

    }


    return Math.round(
        attributes.reduce(
            (
                sum,
                item
            ) =>
                sum +
                Number(
                    item.rating ||
                    0
                ),
            0
        ) /
        attributes.length
    );

}


function start11V12LastEvaluation() {

    const evaluations =
        start11V12DevelopmentDraft
            ?.evaluations ||
        [];


    return [
        ...evaluations
    ]
        .sort(
            (
                a,
                b
            ) =>
                String(
                    b.date ||
                    ""
                )
                    .localeCompare(
                        String(
                            a.date ||
                            ""
                        )
                    )
        )[0] || null;

}


function start11V12Radar(
    development =
        start11V12DevelopmentDraft,
    size = 330
) {

    if (
        typeof start11V11Radar ===
        "function"
    ) {

        return start11V11Radar(
            development,
            start11V12LastEvaluation()
                ?.attributes ||
            null,
            size
        );

    }


    return `
        <div class="s11v12-empty">
            Radardiagram er ikke tilgængeligt.
        </div>
    `;

}


/* =========================================================
   STYLES
========================================================= */

function start11V12InstallStyles() {

    if (
        document.getElementById(
            "start11V12Styles"
        )
    ) {

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "start11V12Styles";


    style.textContent = `

        #start11UnifiedPlayerModalV12 {
            z-index: 10120;
        }


        .s11v12-shell {
            width:
                min(
                    1450px,
                    calc(100vw - 26px)
                );

            height:
                min(
                    920px,
                    calc(100vh - 26px)
                );

            max-width: none !important;
            padding: 0 !important;
            overflow: hidden;

            border:
                1px solid
                var(--s11-border-strong);

            border-radius: 12px;

            background:
                radial-gradient(
                    circle at 68% 0%,
                    var(--s11-theme-glow-soft),
                    transparent 42%
                ),
                #071009;

            color: #fff;
        }


        .s11v12-top {
            min-height: 104px;

            display: grid;
            grid-template-columns:
                minmax(0, 1fr)
                auto;

            align-items: center;

            gap: 18px;

            padding: 18px 22px;

            border-bottom:
                1px solid
                rgba(255,255,255,.085);

            background:
                linear-gradient(
                    90deg,
                    color-mix(
                        in srgb,
                        var(--s11-primary) 8%,
                        transparent
                    ),
                    transparent 48%
                );
        }


        .s11v12-title {
            display: flex;
            align-items: center;
            gap: 16px;
            min-width: 0;
        }


        .s11v12-number {
            min-width: 62px;

            color:
                color-mix(
                    in srgb,
                    var(--s11-primary) 52%,
                    transparent
                );

            font-size: 54px;
            line-height: .9;
            font-weight: 950;
            text-align: center;
        }


        .s11v12-title h2 {
            margin: 0 0 5px;

            color: #fff;

            font-size: 25px;
            font-weight: 950;
        }


        .s11v12-title p {
            margin: 0;

            color: #94A097;

            font-size: 9px;
        }


        .s11v12-top-right {
            display: flex;
            align-items: center;
            gap: 9px;
        }


        .s11v12-ovr {
            min-width: 69px;

            padding: 9px 11px;

            border:
                1px solid
                var(--s11-border-strong);

            border-radius: 7px;

            background:
                rgba(255,255,255,.025);

            text-align: center;
        }


        .s11v12-ovr span {
            display: block;

            margin-bottom: 3px;

            color: #859288;

            font-size: 7px;
            font-weight: 900;
        }


        .s11v12-ovr strong {
            color:
                var(--s11-primary);

            font-size: 27px;
            line-height: 1;
        }


        .s11v12-btn {
            min-height: 37px;

            padding: 0 13px;

            border:
                1px solid
                var(--s11-border-strong);

            border-radius: 6px;

            background: #0A120C;

            color: #D8E0D9;

            font: inherit;
            font-size: 8px;
            font-weight: 950;

            cursor: pointer;
        }


        .s11v12-btn:hover {
            border-color:
                var(--s11-primary);

            color: #fff;
        }


        .s11v12-btn.primary {
            border-color:
                var(--s11-primary);

            background:
                linear-gradient(
                    90deg,
                    var(--s11-primary),
                    var(--s11-secondary)
                );

            color:
                var(--s11-primary-text);
        }


        .s11v12-btn.danger {
            border-color:
                rgba(231,75,75,.42);

            color: #FF7777;
        }


        .s11v12-tabs {
            min-height: 46px;

            display: flex;

            overflow-x: auto;

            border-bottom:
                1px solid
                rgba(255,255,255,.075);

            background:
                rgba(0,0,0,.16);
        }


        .s11v12-tab {
            min-width: 128px;

            padding: 0 14px;

            border: 0;
            border-right:
                1px solid
                rgba(255,255,255,.05);
            border-bottom:
                2px solid transparent;

            background:
                transparent;

            color: #89968D;

            font: inherit;
            font-size: 8px;
            font-weight: 950;

            cursor: pointer;
        }


        .s11v12-tab.active {
            border-bottom-color:
                var(--s11-primary);

            background:
                color-mix(
                    in srgb,
                    var(--s11-primary) 6%,
                    transparent
                );

            color: #fff;
        }


        .s11v12-main {
            height:
                calc(
                    100% - 150px
                );

            display: grid;
            grid-template-columns:
                minmax(0,1fr)
                385px;

            overflow: hidden;
        }


        .s11v12-content {
            min-width: 0;
            overflow-y: auto;
            padding: 18px 20px 30px;
        }


        .s11v12-side {
            overflow-y: auto;

            padding: 18px;

            border-left:
                1px solid
                rgba(255,255,255,.075);

            background:
                rgba(0,0,0,.12);
        }


        .s11v12-panel {
            padding: 14px;

            border:
                1px solid
                rgba(255,255,255,.08);

            border-radius: 8px;

            background:
                rgba(255,255,255,.016);
        }


        .s11v12-panel + .s11v12-panel {
            margin-top: 12px;
        }


        .s11v12-panel-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;

            margin-bottom: 13px;
        }


        .s11v12-panel-head strong {
            font-size: 10px;
            font-weight: 950;
        }


        .s11v12-muted {
            color: #839087;
            font-size: 8px;
            line-height: 1.5;
        }


        .s11v12-profile-grid {
            display: grid;
            grid-template-columns:
                repeat(
                    2,
                    minmax(0,1fr)
                );
            gap: 11px;
        }


        .s11v12-field {
            display: grid;
            gap: 6px;

            color: #9DA89F;

            font-size: 8px;
            font-weight: 900;
        }


        .s11v12-field.wide {
            grid-column: 1 / -1;
        }


        .s11v12-input,
        .s11v12-select,
        .s11v12-textarea {
            width: 100%;
            min-width: 0;

            box-sizing: border-box;

            border:
                1px solid
                rgba(255,255,255,.12);

            border-radius: 5px;

            outline: none;

            background: #050A06;

            color: #fff;

            font: inherit;
            font-size: 9px;
        }


        .s11v12-input,
        .s11v12-select {
            height: 34px;
            padding: 0 9px;
        }


        .s11v12-textarea {
            min-height: 91px;
            padding: 9px;

            resize: vertical;
            line-height: 1.5;
        }


        .s11v12-input:focus,
        .s11v12-select:focus,
        .s11v12-textarea:focus {
            border-color:
                var(--s11-primary) !important;
        }


        .s11v12-check {
            min-height: 34px;

            display: flex;
            align-items: center;
            gap: 8px;

            color: #D4DCD5;

            font-size: 9px;
        }


        .s11v12-check input {
            accent-color:
                var(--s11-primary);
        }


        .s11v12-attrs {
            display: grid;
            grid-template-columns:
                repeat(
                    2,
                    minmax(0,1fr)
                );

            gap: 9px;
        }


        .s11v12-attr {
            display: grid;
            grid-template-columns:
                minmax(0,1fr)
                100px
                52px
                31px;

            align-items: center;
            gap: 7px;

            padding: 8px;

            border:
                1px solid
                rgba(255,255,255,.07);

            border-radius: 7px;

            background: #08100A;
        }


        .s11v12-attr-main {
            min-width: 0;
        }


        .s11v12-attr-main
        .s11v12-input {
            margin-bottom: 5px;
        }


        .s11v12-range {
            width: 100%;
            accent-color:
                var(--s11-primary);
        }


        .s11v12-rating {
            height: 31px;

            display: grid;
            place-items: center;

            border:
                1px solid
                var(--s11-border);

            border-radius: 5px;

            color:
                var(--s11-primary);

            font-size: 12px;
            font-weight: 950;
        }


        .s11v12-del {
            width: 30px;
            height: 30px;

            display: grid;
            place-items: center;

            padding: 0;

            border:
                1px solid
                rgba(255,255,255,.1);

            border-radius: 5px;

            background: transparent;

            color: #8F9A91;

            font: inherit;
            cursor: pointer;
        }


        .s11v12-del:hover {
            border-color:
                #D95050;

            color: #FF7777;
        }


        .s11v12-stack {
            display: grid;
            gap: 9px;
        }


        .s11v12-item {
            padding: 10px;

            border:
                1px solid
                rgba(255,255,255,.075);

            border-radius: 7px;

            background: #08100A;
        }


        .s11v12-row3 {
            display: grid;
            grid-template-columns:
                minmax(0,1fr)
                minmax(0,1fr)
                31px;

            gap: 7px;
        }


        .s11v12-row4 {
            display: grid;
            grid-template-columns:
                minmax(0,1.2fr)
                minmax(0,.8fr)
                minmax(0,1fr)
                31px;

            gap: 7px;
        }


        .s11v12-rowvideo {
            display: grid;
            grid-template-columns:
                minmax(0,1fr)
                minmax(0,1fr)
                88px
                31px;

            gap: 7px;
        }


        .s11v12-item
        .s11v12-textarea {
            margin-top: 7px;
        }


        .s11v12-empty {
            min-height: 120px;

            display: grid;
            place-items: center;

            color: #748078;

            font-size: 8px;
            text-align: center;
        }


        .s11v12-radar-card {
            min-height: 340px;
        }


        .s11v12-radar-card svg {
            width: 100%;
            height: auto;
            display: block;
        }


        .s11v12-summary {
            display: grid;
            grid-template-columns:
                repeat(
                    2,
                    minmax(0,1fr)
                );

            gap: 8px;
        }


        .s11v12-summary-item {
            padding: 10px;

            border:
                1px solid
                rgba(255,255,255,.075);

            border-radius: 7px;

            background: #08100A;
        }


        .s11v12-summary-item span {
            display: block;

            color: #7E8B81;

            font-size: 7px;
            font-weight: 850;
        }


        .s11v12-summary-item strong {
            display: block;

            margin-top: 4px;

            color: #fff;

            font-size: 16px;
        }


        .s11v12-detail-radar {
            grid-column: 1 / -1;

            display: grid;
            grid-template-columns:
                minmax(0,1fr)
                310px;

            gap: 16px;

            padding: 15px;

            border-top:
                1px solid
                rgba(255,255,255,.1);
        }


        .s11v12-detail-radar-copy h3 {
            margin:
                0 0 8px;

            color:
                var(--s11-primary);

            font-size: 10px;
        }


        .s11v12-detail-radar-copy p {
            margin:
                0 0 7px;

            color: #A6B0A8;

            font-size: 9px;
            line-height: 1.5;
        }


        .s11v12-detail-radar
        svg {
            width: 100%;
            height: auto;
        }


        @media (
            max-width: 1000px
        ) {

            .s11v12-main {
                grid-template-columns:
                    1fr;

                overflow-y: auto;
            }


            .s11v12-side {
                border-left: 0;
                border-top:
                    1px solid
                    rgba(255,255,255,.075);
            }


            .s11v12-shell {
                overflow-y: auto;
            }


            .s11v12-main {
                height: auto;
            }


            .s11v12-profile-grid,
            .s11v12-attrs {
                grid-template-columns:
                    1fr;
            }

        }

    `;


    document.head.appendChild(
        style
    );

}


/* =========================================================
   MODAL
========================================================= */

function start11V12EnsureModal() {

    if (
        document.getElementById(
            "start11UnifiedPlayerModalV12"
        )
    ) {

        return;

    }


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "start11UnifiedPlayerModalV12";

    modal.className =
        "modal";


    modal.innerHTML = `
        <div
            class="
                modal-content
                s11v12-shell
            "
        >

            <header
                id="s11v12Top"
                class="s11v12-top"
            ></header>

            <nav
                id="s11v12Tabs"
                class="s11v12-tabs"
            ></nav>

            <div class="s11v12-main">

                <main
                    id="s11v12Content"
                    class="s11v12-content"
                ></main>

                <aside
                    id="s11v12Side"
                    class="s11v12-side"
                ></aside>

            </div>

        </div>
    `;


    document.body.appendChild(
        modal
    );


    modal.addEventListener(
        "mousedown",
        event => {

            if (
                event.target ===
                modal
            ) {

                start11V12Close();

            }

        }
    );

}


/* =========================================================
   OPEN / CLOSE
========================================================= */

function start11V12Open(
    playerId = null
) {

    start11V12EnsureModal();


    start11V12IsNew =
        !playerId;


    if (
        playerId
    ) {

        const player =
            start11FullSquad.find(
                item =>
                    item.id ===
                    playerId
            );


        if (!player) {

            return;

        }


        start11V12PlayerId =
            player.id;


        start11V12ProfileDraft =
            start11V12Clone(
                player
            );


        start11V12DevelopmentDraft =
            start11V12NormalizeDevelopment(
                player.development
            );

    } else {

        const fresh =
            start11V12DefaultProfile();


        start11V12PlayerId =
            fresh.id;


        start11V12ProfileDraft =
            start11V12Clone(
                fresh
            );


        start11V12DevelopmentDraft =
            start11V12NormalizeDevelopment(
                fresh.development
            );

    }


    start11V12Tab =
        "profile";


    start11V12Render();


    document.getElementById(
        "start11UnifiedPlayerModalV12"
    )
        .style.display =
        "flex";

}


function start11V12Close() {

    const modal =
        document.getElementById(
            "start11UnifiedPlayerModalV12"
        );


    if (modal) {

        modal.style.display =
            "none";

    }


    start11V12PlayerId =
        null;

    start11V12ProfileDraft =
        null;

    start11V12DevelopmentDraft =
        null;

    start11V12IsNew =
        false;

}


/* =========================================================
   MATCH SYNC AFTER PROFILE EDIT
========================================================= */

function start11V12SyncEditedProfileToMatch(
    savedPlayer
) {

    const sync =
        matchPlayer => {

            if (!matchPlayer) {

                return;

            }


            const same =
                matchPlayer.squadId ===
                    savedPlayer.id ||
                (
                    typeof start11SamePlayer ===
                        "function" &&
                    start11SamePlayer(
                        matchPlayer,
                        savedPlayer
                    )
                );


            if (!same) {

                return;

            }


            matchPlayer.squadId =
                savedPlayer.id;

            matchPlayer.name =
                savedPlayer.name;

            matchPlayer.number =
                savedPlayer.number;

            matchPlayer.position =
                savedPlayer.position;

            matchPlayer.strengths =
                savedPlayer.strengths ||
                "";

            matchPlayer.weaknesses =
                savedPlayer.weaknesses ||
                "";

            matchPlayer.focusWithBall =
                savedPlayer.focusWithBall ||
                "";

            matchPlayer.focusWithoutBall =
                savedPlayer.focusWithoutBall ||
                "";

            matchPlayer.video =
                savedPlayer.video ||
                "";

        };


    if (
        Array.isArray(
            spillere
        )
    ) {

        spillere.forEach(
            sync
        );

    }


    if (
        Array.isArray(
            udskiftere
        )
    ) {

        udskiftere.forEach(
            sync
        );

    }


    if (
        typeof gemAlt ===
        "function"
    ) {

        gemAlt();

    }


    if (
        typeof tegnOpstilling ===
        "function"
    ) {

        tegnOpstilling();

    }


    if (
        typeof opdaterUdskiftere ===
        "function"
    ) {

        opdaterUdskiftere();

    }

}


/* =========================================================
   SAVE / DELETE
========================================================= */

function start11V12Save(
    closeAfter = false
) {

    const name =
        String(
            start11V12ProfileDraft
                ?.name ||
            ""
        ).trim();


    if (!name) {

        if (
            typeof visNotification ===
            "function"
        ) {

            visNotification(
                "Indtast spillerens navn."
            );

        }


        start11V12Tab =
            "profile";

        start11V12Render();

        return false;

    }


    start11V12ProfileDraft.name =
        name;

    start11V12ProfileDraft.development =
        start11V12NormalizeDevelopment(
            start11V12DevelopmentDraft
        );


    let savedPlayer;


    if (
        start11V12IsNew
    ) {

        savedPlayer =
            start11V12Clone(
                start11V12ProfileDraft
            );


        start11FullSquad.push(
            savedPlayer
        );


        start11V12IsNew =
            false;

        start11V12PlayerId =
            savedPlayer.id;

    } else {

        const index =
            start11FullSquad.findIndex(
                item =>
                    item.id ===
                    start11V12PlayerId
            );


        if (
            index === -1
        ) {

            return false;

        }


        const old =
            start11FullSquad[
                index
            ];


        savedPlayer = {
            ...old,
            ...start11V12Clone(
                start11V12ProfileDraft
            ),

            development:
                start11V12NormalizeDevelopment(
                    start11V12DevelopmentDraft
                )
        };


        if (
            savedPlayer.status !==
            "available"
        ) {

            savedPlayer.selected =
                false;

        }


        start11FullSquad[
            index
        ] =
            savedPlayer;

    }


    start11V12ProfileDraft =
        start11V12Clone(
            savedPlayer
        );


    start11V12DevelopmentDraft =
        start11V12NormalizeDevelopment(
            savedPlayer.development
        );


    if (
        typeof start11SaveFullSquad ===
        "function"
    ) {

        start11SaveFullSquad();

    }


    start11V12SyncEditedProfileToMatch(
        savedPlayer
    );


    if (
        typeof start11RenderSquadUI ===
        "function"
    ) {

        start11RenderSquadUI();

    }


    if (
        typeof scheduleCloudSave ===
        "function"
    ) {

        scheduleCloudSave();

    }


    if (
        typeof visNotification ===
        "function"
    ) {

        visNotification(
            `${savedPlayer.name} er gemt.`
        );

    }


    if (
        closeAfter
    ) {

        start11V12Close();

    } else {

        start11V12Render();

    }


    return true;

}


function start11V12Delete() {

    if (
        start11V12IsNew
    ) {

        start11V12Close();

        return;

    }


    const player =
        start11FullSquad.find(
            item =>
                item.id ===
                start11V12PlayerId
        );


    if (!player) {

        return;

    }


    if (
        typeof start11GetPlayerRole ===
            "function"
    ) {

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
                    "Spilleren er i kampens opstilling. Fjern spilleren fra opstillingen først."
                );

            }


            return;

        }

    }


    if (
        !window.confirm(
            `Slet ${player.name}?`
        )
    ) {

        return;

    }


    start11FullSquad =
        start11FullSquad.filter(
            item =>
                item.id !==
                start11V12PlayerId
        );


    if (
        typeof start11SaveFullSquad ===
        "function"
    ) {

        start11SaveFullSquad();

    }


    if (
        typeof start11RenderSquadUI ===
        "function"
    ) {

        start11RenderSquadUI();

    }


    start11V12Close();

}


/* =========================================================
   RENDER
========================================================= */

function start11V12Render() {

    start11V12RenderTop();

    start11V12RenderTabs();

    start11V12RenderContent();

    start11V12RenderSide();

}


function start11V12RenderTop() {

    const target =
        document.getElementById(
            "s11v12Top"
        );


    if (!target) {

        return;

    }


    const player =
        start11V12ProfileDraft;


    target.innerHTML = `

        <div class="s11v12-title">

            <div class="s11v12-number">
                ${
                    start11V12Escape(
                        player?.number ||
                        "+"
                    )
                }
            </div>

            <div>

                <h2>
                    ${
                        start11V12Escape(
                            player?.name ||
                            (
                                start11V12IsNew
                                    ? "Ny spiller"
                                    : "Spiller"
                            )
                        )
                    }
                </h2>

                <p>
                    ${
                        start11V12IsNew
                            ? "OPRET SPILLER"
                            : "SAMLET SPILLERPROFIL"
                    }
                    · ${
                        start11V12Escape(
                            player?.position ||
                            "—"
                        )
                    }
                    · spillerudvikling
                </p>

            </div>

        </div>


        <div class="s11v12-top-right">

            <div class="s11v12-ovr">
                <span>OVR</span>
                <strong>
                    ${start11V12Overall()}
                </strong>
            </div>

            ${
                !start11V12IsNew
                    ? `
                        <button
                            type="button"
                            class="s11v12-btn"
                            id="s11v12Pdf"
                        >
                            GENERER PDF
                        </button>
                    `
                    : ""
            }

            <button
                type="button"
                class="s11v12-btn primary"
                id="s11v12Save"
            >
                GEM
            </button>

            ${
                !start11V12IsNew
                    ? `
                        <button
                            type="button"
                            class="s11v12-btn danger"
                            id="s11v12Delete"
                        >
                            SLET
                        </button>
                    `
                    : ""
            }

            <button
                type="button"
                class="s11v12-btn"
                id="s11v12Close"
            >
                LUK
            </button>

        </div>
    `;


    document.getElementById(
        "s11v12Save"
    )
        ?.addEventListener(
            "click",
            () =>
                start11V12Save(
                    false
                )
        );


    document.getElementById(
        "s11v12Close"
    )
        ?.addEventListener(
            "click",
            start11V12Close
        );


    document.getElementById(
        "s11v12Delete"
    )
        ?.addEventListener(
            "click",
            start11V12Delete
        );


    document.getElementById(
        "s11v12Pdf"
    )
        ?.addEventListener(
            "click",
            start11V12GeneratePdf
        );

}


function start11V12RenderTabs() {

    const target =
        document.getElementById(
            "s11v12Tabs"
        );


    if (!target) {

        return;

    }


    const tabs = [
        [
            "profile",
            "SPILLERPROFIL"
        ],
        [
            "attributes",
            "ATTRIBUTES"
        ],
        [
            "focus",
            "SPILLERFOKUS"
        ],
        [
            "training",
            "TRÆNINGSPLAN"
        ],
        [
            "videos",
            "VIDEO"
        ],
        [
            "evaluations",
            "EVALUERINGER"
        ],
        [
            "notes",
            "NOTER"
        ]
    ];


    target.innerHTML =
        tabs
            .map(
                (
                    [
                        id,
                        label
                    ]
                ) => `
                    <button
                        type="button"
                        class="
                            s11v12-tab
                            ${
                                start11V12Tab === id
                                    ? "active"
                                    : ""
                            }
                        "
                        data-tab="${id}"
                    >
                        ${label}
                    </button>
                `
            )
            .join(
                ""
            );


    target.querySelectorAll(
        "[data-tab]"
    )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        start11V12Tab =
                            button.dataset.tab;


                        start11V12RenderTabs();

                        start11V12RenderContent();

                    }
                );

            }
        );

}


function start11V12RenderContent() {

    const target =
        document.getElementById(
            "s11v12Content"
        );


    if (!target) {

        return;

    }


    switch (
        start11V12Tab
    ) {

        case "profile":
            start11V12RenderProfile(
                target
            );
            break;

        case "attributes":
            start11V12RenderAttributes(
                target
            );
            break;

        case "focus":
            start11V12RenderFocus(
                target
            );
            break;

        case "training":
            start11V12RenderTraining(
                target
            );
            break;

        case "videos":
            start11V12RenderVideos(
                target
            );
            break;

        case "evaluations":
            start11V12RenderEvaluations(
                target
            );
            break;

        default:
            start11V12RenderNotes(
                target
            );

    }

}


function start11V12RenderSide() {

    const target =
        document.getElementById(
            "s11v12Side"
        );


    if (!target) {

        return;

    }


    const focusCount =
        (
            start11V12DevelopmentDraft
                ?.focus ||
            []
        )
            .filter(
                item =>
                    item.status !==
                    "Afsluttet"
            )
            .length;


    target.innerHTML = `

        <section
            class="
                s11v12-panel
                s11v12-radar-card
            "
        >

            <div class="s11v12-panel-head">
                <strong>RADARDIAGRAM</strong>

                <span class="s11v12-muted">
                    Live
                </span>
            </div>

            ${
                start11V12Radar(
                    start11V12DevelopmentDraft,
                    350
                )
            }

        </section>


        <section class="s11v12-panel">

            <div class="s11v12-panel-head">
                <strong>SPILLERSTATUS</strong>
            </div>

            <div class="s11v12-summary">

                <div class="s11v12-summary-item">
                    <span>OVR</span>
                    <strong>
                        ${start11V12Overall()}
                    </strong>
                </div>

                <div class="s11v12-summary-item">
                    <span>POSITION</span>
                    <strong>
                        ${
                            start11V12Escape(
                                start11V12ProfileDraft
                                    ?.position ||
                                "—"
                            )
                        }
                    </strong>
                </div>

                <div class="s11v12-summary-item">
                    <span>FOKUSPUNKTER</span>
                    <strong>
                        ${focusCount}
                    </strong>
                </div>

                <div class="s11v12-summary-item">
                    <span>EVALUERINGER</span>
                    <strong>
                        ${
                            start11V12DevelopmentDraft
                                ?.evaluations
                                ?.length ||
                            0
                        }
                    </strong>
                </div>

            </div>

        </section>
    `;

}


/* =========================================================
   PROFILE TAB
========================================================= */

function start11V12RenderProfile(
    target
) {

    const player =
        start11V12ProfileDraft;


    target.innerHTML = `

        <section class="s11v12-panel">

            <div class="s11v12-panel-head">

                <div>
                    <strong>SPILLERPROFIL</strong>

                    <div
                        class="s11v12-muted"
                        style="margin-top:4px;"
                    >
                        Alt grunddata om spilleren redigeres her.
                    </div>
                </div>

            </div>


            <div class="s11v12-profile-grid">

                <label class="s11v12-field">
                    Navn

                    <input
                        id="s11v12Name"
                        class="s11v12-input"
                        value="${
                            start11V12Escape(
                                player.name
                            )
                        }"
                        placeholder="Spillerens navn"
                    >
                </label>


                <label class="s11v12-field">
                    Nummer

                    <input
                        id="s11v12Number"
                        class="s11v12-input"
                        value="${
                            start11V12Escape(
                                player.number
                            )
                        }"
                        placeholder="Fx 9"
                    >
                </label>


                <label class="s11v12-field">
                    Position

                    <select
                        id="s11v12Position"
                        class="s11v12-select"
                    >
                        ${
                            [
                                ["GK","Målmand (GK)"],
                                ["RB","Højre back (RB)"],
                                ["CB","Centerback (CB)"],
                                ["LB","Venstre back (LB)"],
                                ["RWB","Højre wingback (RWB)"],
                                ["LWB","Venstre wingback (LWB)"],
                                ["DM","Defensiv midtbane (DM)"],
                                ["CM","Central midtbane (CM)"],
                                ["AM","Offensiv midtbane (AM)"],
                                ["RW","Højre kant (RW)"],
                                ["LW","Venstre kant (LW)"],
                                ["ST","Angriber (ST)"]
                            ]
                                .map(
                                    (
                                        [
                                            value,
                                            label
                                        ]
                                    ) => `
                                        <option
                                            value="${value}"
                                            ${
                                                player.position ===
                                                value
                                                    ? "selected"
                                                    : ""
                                            }
                                        >
                                            ${label}
                                        </option>
                                    `
                                )
                                .join(
                                    ""
                                )
                        }
                    </select>
                </label>


                <label class="s11v12-field">
                    Status

                    <select
                        id="s11v12Status"
                        class="s11v12-select"
                    >
                        ${
                            [
                                ["available","Tilgængelig"],
                                ["injured","Skadet"],
                                ["unavailable","Ikke tilgængelig"]
                            ]
                                .map(
                                    (
                                        [
                                            value,
                                            label
                                        ]
                                    ) => `
                                        <option
                                            value="${value}"
                                            ${
                                                player.status ===
                                                value
                                                    ? "selected"
                                                    : ""
                                            }
                                        >
                                            ${label}
                                        </option>
                                    `
                                )
                                .join(
                                    ""
                                )
                        }
                    </select>
                </label>


                <label
                    class="
                        s11v12-field
                        wide
                    "
                >
                    <span>Udtaget til kamptrup</span>

                    <span class="s11v12-check">
                        <input
                            id="s11v12Selected"
                            type="checkbox"
                            ${
                                player.selected
                                    ? "checked"
                                    : ""
                            }
                        >
                        Spilleren er udtaget
                    </span>
                </label>


                <label
                    class="
                        s11v12-field
                        wide
                    "
                >
                    Styrker / positive

                    <textarea
                        id="s11v12Strengths"
                        class="s11v12-textarea"
                        placeholder="Fx 1v1, fart, blik for spillet..."
                    >${
                        start11V12Escape(
                            player.strengths ||
                            ""
                        )
                    }</textarea>
                </label>


                <label
                    class="
                        s11v12-field
                        wide
                    "
                >
                    Svagheder / udviklingsområder

                    <textarea
                        id="s11v12Weaknesses"
                        class="s11v12-textarea"
                        placeholder="Fx orientering, duelspil..."
                    >${
                        start11V12Escape(
                            player.weaknesses ||
                            ""
                        )
                    }</textarea>
                </label>


                <label
                    class="
                        s11v12-field
                        wide
                    "
                >
                    Fokuspunkter med bold

                    <textarea
                        id="s11v12FocusBall"
                        class="s11v12-textarea"
                        placeholder="Spillerspecifikt fokus med bold..."
                    >${
                        start11V12Escape(
                            player.focusWithBall ||
                            ""
                        )
                    }</textarea>
                </label>


                <label
                    class="
                        s11v12-field
                        wide
                    "
                >
                    Fokuspunkter uden bold

                    <textarea
                        id="s11v12FocusNoBall"
                        class="s11v12-textarea"
                        placeholder="Spillerspecifikt fokus uden bold..."
                    >${
                        start11V12Escape(
                            player.focusWithoutBall ||
                            ""
                        )
                    }</textarea>
                </label>


                <label
                    class="
                        s11v12-field
                        wide
                    "
                >
                    Primært videolink

                    <input
                        id="s11v12Video"
                        class="s11v12-input"
                        value="${
                            start11V12Escape(
                                player.video ||
                                ""
                            )
                        }"
                        placeholder="https://..."
                    >
                </label>

            </div>

        </section>
    `;


    const bind =
        (
            id,
            field,
            event =
                "input"
        ) => {

            document.getElementById(
                id
            )
                ?.addEventListener(
                    event,
                    eventObject => {

                        start11V12ProfileDraft[
                            field
                        ] =
                            eventObject.target
                                .value;


                        start11V12RenderTop();

                        start11V12RenderSide();

                    }
                );

        };


    bind(
        "s11v12Name",
        "name"
    );

    bind(
        "s11v12Number",
        "number"
    );

    bind(
        "s11v12Position",
        "position",
        "change"
    );

    bind(
        "s11v12Status",
        "status",
        "change"
    );

    bind(
        "s11v12Strengths",
        "strengths"
    );

    bind(
        "s11v12Weaknesses",
        "weaknesses"
    );

    bind(
        "s11v12FocusBall",
        "focusWithBall"
    );

    bind(
        "s11v12FocusNoBall",
        "focusWithoutBall"
    );

    bind(
        "s11v12Video",
        "video"
    );


    document.getElementById(
        "s11v12Selected"
    )
        ?.addEventListener(
            "change",
            event => {

                start11V12ProfileDraft.selected =
                    event.target.checked;

            }
        );

}


/* =========================================================
   ATTRIBUTES TAB
========================================================= */

function start11V12RenderAttributes(
    target
) {

    const attributes =
        start11V12DevelopmentDraft
            .attributes ||
        [];


    target.innerHTML = `

        <section class="s11v12-panel">

            <div class="s11v12-panel-head">

                <div>
                    <strong>ATTRIBUTES 1–100</strong>

                    <div
                        class="s11v12-muted"
                        style="margin-top:4px;"
                    >
                        Opret selv de attributes du bruger.
                        Vælg op til 8 til radardiagrammet.
                    </div>
                </div>

                <button
                    id="s11v12AddAttr"
                    class="s11v12-btn"
                    type="button"
                >
                    + ATTRIBUTE
                </button>

            </div>


            <div
                id="s11v12Attrs"
                class="s11v12-attrs"
            >
                ${
                    attributes
                        .map(
                            attribute => `
                                <div
                                    class="s11v12-attr"
                                    data-id="${
                                        start11V12Escape(
                                            attribute.id
                                        )
                                    }"
                                >

                                    <div class="s11v12-attr-main">

                                        <input
                                            class="s11v12-input"
                                            data-field="name"
                                            value="${
                                                start11V12Escape(
                                                    attribute.name
                                                )
                                            }"
                                        >

                                        <select
                                            class="s11v12-select"
                                            data-field="category"
                                        >
                                            ${
                                                [
                                                    "Teknisk",
                                                    "Taktisk",
                                                    "Fysisk",
                                                    "Mentalt",
                                                    "Målmand",
                                                    "Andet"
                                                ]
                                                    .map(
                                                        category => `
                                                            <option
                                                                ${
                                                                    attribute.category ===
                                                                    category
                                                                        ? "selected"
                                                                        : ""
                                                                }
                                                            >
                                                                ${category}
                                                            </option>
                                                        `
                                                    )
                                                    .join(
                                                        ""
                                                    )
                                            }
                                        </select>

                                    </div>


                                    <div>

                                        <input
                                            class="s11v12-range"
                                            data-field="rating"
                                            type="range"
                                            min="1"
                                            max="100"
                                            value="${
                                                Number(
                                                    attribute.rating ||
                                                    1
                                                )
                                            }"
                                        >

                                        <label
                                            class="s11v12-muted"
                                            style="
                                                display:flex;
                                                gap:5px;
                                                align-items:center;
                                                margin-top:5px;
                                            "
                                        >
                                            <input
                                                type="checkbox"
                                                data-field="radar"
                                                ${
                                                    attribute.radar !==
                                                    false
                                                        ? "checked"
                                                        : ""
                                                }
                                            >
                                            På radar
                                        </label>

                                    </div>


                                    <div
                                        class="s11v12-rating"
                                        data-value
                                    >
                                        ${
                                            Number(
                                                attribute.rating ||
                                                1
                                            )
                                        }
                                    </div>


                                    <button
                                        class="s11v12-del"
                                        type="button"
                                        data-delete
                                    >
                                        ×
                                    </button>

                                </div>
                            `
                        )
                        .join(
                            ""
                        )
                }
            </div>

        </section>
    `;


    target.querySelectorAll(
        ".s11v12-attr"
    )
        .forEach(
            row => {

                const id =
                    row.dataset.id;


                const item =
                    () =>
                        start11V12DevelopmentDraft
                            .attributes
                            .find(
                                attribute =>
                                    attribute.id ===
                                    id
                            );


                row.querySelector(
                    '[data-field="name"]'
                )
                    ?.addEventListener(
                        "input",
                        event => {

                            const current =
                                item();


                            if (!current) {

                                return;

                            }


                            current.name =
                                event.target.value;


                            start11V12RenderSide();

                        }
                    );


                row.querySelector(
                    '[data-field="category"]'
                )
                    ?.addEventListener(
                        "change",
                        event => {

                            const current =
                                item();


                            if (current) {

                                current.category =
                                    event.target.value;

                            }

                        }
                    );


                row.querySelector(
                    '[data-field="rating"]'
                )
                    ?.addEventListener(
                        "input",
                        event => {

                            const current =
                                item();


                            if (!current) {

                                return;

                            }


                            current.rating =
                                Math.max(
                                    1,
                                    Math.min(
                                        100,
                                        Number(
                                            event.target
                                                .value
                                        )
                                    )
                                );


                            row.querySelector(
                                "[data-value]"
                            )
                                .textContent =
                                current.rating;


                            start11V12RenderTop();

                            start11V12RenderSide();

                        }
                    );


                row.querySelector(
                    '[data-field="radar"]'
                )
                    ?.addEventListener(
                        "change",
                        event => {

                            const current =
                                item();


                            if (!current) {

                                return;

                            }


                            if (
                                event.target.checked
                            ) {

                                const count =
                                    start11V12DevelopmentDraft
                                        .attributes
                                        .filter(
                                            attribute =>
                                                attribute.radar !==
                                                false
                                        )
                                        .length;


                                if (
                                    count >=
                                    8
                                ) {

                                    event.target.checked =
                                        false;


                                    if (
                                        typeof visNotification ===
                                        "function"
                                    ) {

                                        visNotification(
                                            "Der kan maks. vises 8 attributes på radardiagrammet."
                                        );

                                    }


                                    return;

                                }

                            }


                            current.radar =
                                event.target.checked;


                            start11V12RenderSide();

                        }
                    );


                row.querySelector(
                    "[data-delete]"
                )
                    ?.addEventListener(
                        "click",
                        () => {

                            start11V12DevelopmentDraft.attributes =
                                start11V12DevelopmentDraft
                                    .attributes
                                    .filter(
                                        attribute =>
                                            attribute.id !==
                                            id
                                    );


                            start11V12RenderContent();

                            start11V12RenderTop();

                            start11V12RenderSide();

                        }
                    );

            }
        );


    document.getElementById(
        "s11v12AddAttr"
    )
        ?.addEventListener(
            "click",
            () => {

                const radarCount =
                    start11V12DevelopmentDraft
                        .attributes
                        .filter(
                            item =>
                                item.radar !==
                                false
                        )
                        .length;


                start11V12DevelopmentDraft
                    .attributes
                    .push({
                        id:
                            "attribute_" +
                            Date.now() +
                            "_" +
                            Math.random()
                                .toString(36)
                                .slice(2,6),

                        name:
                            "Nyt attribute",

                        category:
                            "Teknisk",

                        rating:
                            50,

                        radar:
                            radarCount <
                            8
                    });


                start11V12RenderContent();

                start11V12RenderSide();

            }
        );

}


/* =========================================================
   FOCUS / TRAINING / VIDEO / EVALUATIONS / NOTES
========================================================= */

function start11V12BindList(
    root,
    key,
    rowSelector
) {

    root.querySelectorAll(
        rowSelector
    )
        .forEach(
            row => {

                const id =
                    row.dataset.id;


                const getItem =
                    () =>
                        start11V12DevelopmentDraft[
                            key
                        ]
                            .find(
                                item =>
                                    item.id ===
                                    id
                            );


                row.querySelectorAll(
                    "[data-field]"
                )
                    .forEach(
                        field => {

                            field.addEventListener(
                                field.tagName ===
                                "SELECT"
                                    ? "change"
                                    : "input",
                                event => {

                                    const item =
                                        getItem();


                                    if (!item) {

                                        return;

                                    }


                                    item[
                                        field.dataset.field
                                    ] =
                                        event.target.value;


                                    start11V12RenderSide();

                                }
                            );

                        }
                    );


                row.querySelector(
                    "[data-delete]"
                )
                    ?.addEventListener(
                        "click",
                        () => {

                            start11V12DevelopmentDraft[
                                key
                            ] =
                                start11V12DevelopmentDraft[
                                    key
                                ]
                                    .filter(
                                        item =>
                                            item.id !==
                                            id
                                    );


                            start11V12RenderContent();

                            start11V12RenderSide();

                        }
                    );

            }
        );

}


function start11V12RenderFocus(
    target
) {

    const items =
        start11V12DevelopmentDraft
            .focus ||
        [];


    target.innerHTML = `

        <section class="s11v12-panel">

            <div class="s11v12-panel-head">

                <div>
                    <strong>SPILLERFOKUS</strong>
                    <div class="s11v12-muted">
                        Konkrete udviklingsmål for spilleren.
                    </div>
                </div>

                <button
                    id="s11v12AddFocus"
                    class="s11v12-btn"
                >
                    + FOKUSPUNKT
                </button>

            </div>


            <div
                id="s11v12FocusList"
                class="s11v12-stack"
            >
                ${
                    items.length
                        ? items.map(
                            item => `
                                <div
                                    class="s11v12-item"
                                    data-focus-row
                                    data-id="${
                                        start11V12Escape(
                                            item.id
                                        )
                                    }"
                                >

                                    <div class="s11v12-row3">

                                        <input
                                            class="s11v12-input"
                                            data-field="title"
                                            value="${
                                                start11V12Escape(
                                                    item.title ||
                                                    ""
                                                )
                                            }"
                                            placeholder="Fokusområde"
                                        >

                                        <select
                                            class="s11v12-select"
                                            data-field="status"
                                        >
                                            ${
                                                [
                                                    "Aktiv",
                                                    "På vej",
                                                    "Afsluttet"
                                                ]
                                                    .map(
                                                        status => `
                                                            <option
                                                                ${
                                                                    item.status ===
                                                                    status
                                                                        ? "selected"
                                                                        : ""
                                                                }
                                                            >
                                                                ${status}
                                                            </option>
                                                        `
                                                    )
                                                    .join(
                                                        ""
                                                    )
                                            }
                                        </select>

                                        <button
                                            class="s11v12-del"
                                            data-delete
                                        >
                                            ×
                                        </button>

                                    </div>

                                    <textarea
                                        class="s11v12-textarea"
                                        data-field="description"
                                        placeholder="Hvad skal udvikles?"
                                    >${
                                        start11V12Escape(
                                            item.description ||
                                            ""
                                        )
                                    }</textarea>

                                    <textarea
                                        class="s11v12-textarea"
                                        data-field="target"
                                        placeholder="Konkret mål / adfærd"
                                    >${
                                        start11V12Escape(
                                            item.target ||
                                            ""
                                        )
                                    }</textarea>

                                </div>
                            `
                        ).join("")
                        : `
                            <div class="s11v12-empty">
                                Ingen fokuspunkter endnu.
                            </div>
                        `
                }
            </div>

        </section>
    `;


    start11V12BindList(
        target,
        "focus",
        "[data-focus-row]"
    );


    document.getElementById(
        "s11v12AddFocus"
    )
        ?.addEventListener(
            "click",
            () => {

                start11V12DevelopmentDraft
                    .focus
                    .push({
                        id:
                            "focus_" +
                            Date.now(),

                        title:
                            "",

                        description:
                            "",

                        target:
                            "",

                        status:
                            "Aktiv"
                    });


                start11V12RenderContent();

                start11V12RenderSide();

            }
        );

}


function start11V12RenderTraining(
    target
) {

    const items =
        start11V12DevelopmentDraft
            .trainingPlan ||
        [];


    target.innerHTML = `

        <section class="s11v12-panel">

            <div class="s11v12-panel-head">

                <div>
                    <strong>INDIVIDUEL TRÆNINGSPLAN</strong>
                    <div class="s11v12-muted">
                        Øvelser, hyppighed og konkrete mål.
                    </div>
                </div>

                <button
                    id="s11v12AddTraining"
                    class="s11v12-btn"
                >
                    + TRÆNING
                </button>

            </div>


            <div class="s11v12-stack">

                ${
                    items.length
                        ? items.map(
                            item => `
                                <div
                                    class="s11v12-item"
                                    data-training-row
                                    data-id="${
                                        start11V12Escape(
                                            item.id
                                        )
                                    }"
                                >

                                    <div class="s11v12-row4">

                                        <input
                                            class="s11v12-input"
                                            data-field="exercise"
                                            value="${
                                                start11V12Escape(
                                                    item.exercise ||
                                                    ""
                                                )
                                            }"
                                            placeholder="Øvelse"
                                        >

                                        <input
                                            class="s11v12-input"
                                            data-field="frequency"
                                            value="${
                                                start11V12Escape(
                                                    item.frequency ||
                                                    ""
                                                )
                                            }"
                                            placeholder="Fx 2x ugentligt"
                                        >

                                        <select
                                            class="s11v12-select"
                                            data-field="status"
                                        >
                                            ${
                                                [
                                                    "Planlagt",
                                                    "I gang",
                                                    "Gennemført"
                                                ]
                                                    .map(
                                                        status => `
                                                            <option
                                                                ${
                                                                    item.status ===
                                                                    status
                                                                        ? "selected"
                                                                        : ""
                                                                }
                                                            >
                                                                ${status}
                                                            </option>
                                                        `
                                                    )
                                                    .join(
                                                        ""
                                                    )
                                            }
                                        </select>

                                        <button
                                            class="s11v12-del"
                                            data-delete
                                        >
                                            ×
                                        </button>

                                    </div>

                                    <textarea
                                        class="s11v12-textarea"
                                        data-field="goal"
                                        placeholder="Mål med træningen"
                                    >${
                                        start11V12Escape(
                                            item.goal ||
                                            ""
                                        )
                                    }</textarea>

                                </div>
                            `
                        ).join("")
                        : `
                            <div class="s11v12-empty">
                                Ingen træningsplan endnu.
                            </div>
                        `
                }

            </div>

        </section>
    `;


    start11V12BindList(
        target,
        "trainingPlan",
        "[data-training-row]"
    );


    document.getElementById(
        "s11v12AddTraining"
    )
        ?.addEventListener(
            "click",
            () => {

                start11V12DevelopmentDraft
                    .trainingPlan
                    .push({
                        id:
                            "training_" +
                            Date.now(),

                        exercise:
                            "",

                        frequency:
                            "",

                        goal:
                            "",

                        status:
                            "Planlagt"
                    });


                start11V12RenderContent();

            }
        );

}


function start11V12RenderVideos(
    target
) {

    const items =
        start11V12DevelopmentDraft
            .videos ||
        [];


    target.innerHTML = `

        <section class="s11v12-panel">

            <div class="s11v12-panel-head">

                <div>
                    <strong>VIDEO FRA KAMPE</strong>
                    <div class="s11v12-muted">
                        Gem kamp, tidspunkt, link og din analyse.
                    </div>
                </div>

                <button
                    id="s11v12AddVideo"
                    class="s11v12-btn"
                >
                    + VIDEO
                </button>

            </div>


            <div class="s11v12-stack">

                ${
                    items.length
                        ? items.map(
                            item => `
                                <div
                                    class="s11v12-item"
                                    data-video-row
                                    data-id="${
                                        start11V12Escape(
                                            item.id
                                        )
                                    }"
                                >

                                    <div class="s11v12-rowvideo">

                                        <input
                                            class="s11v12-input"
                                            data-field="title"
                                            value="${
                                                start11V12Escape(
                                                    item.title ||
                                                    ""
                                                )
                                            }"
                                            placeholder="Titel"
                                        >

                                        <input
                                            class="s11v12-input"
                                            data-field="match"
                                            value="${
                                                start11V12Escape(
                                                    item.match ||
                                                    ""
                                                )
                                            }"
                                            placeholder="Fx vs AGF"
                                        >

                                        <input
                                            class="s11v12-input"
                                            data-field="timestamp"
                                            value="${
                                                start11V12Escape(
                                                    item.timestamp ||
                                                    ""
                                                )
                                            }"
                                            placeholder="34:20"
                                        >

                                        <button
                                            class="s11v12-del"
                                            data-delete
                                        >
                                            ×
                                        </button>

                                    </div>

                                    <input
                                        class="s11v12-input"
                                        style="margin-top:7px;"
                                        data-field="url"
                                        value="${
                                            start11V12Escape(
                                                item.url ||
                                                ""
                                            )
                                        }"
                                        placeholder="https://..."
                                    >

                                    <textarea
                                        class="s11v12-textarea"
                                        data-field="note"
                                        placeholder="Hvad skal spilleren se?"
                                    >${
                                        start11V12Escape(
                                            item.note ||
                                            ""
                                        )
                                    }</textarea>

                                </div>
                            `
                        ).join("")
                        : `
                            <div class="s11v12-empty">
                                Ingen videoer endnu.
                            </div>
                        `
                }

            </div>

        </section>
    `;


    start11V12BindList(
        target,
        "videos",
        "[data-video-row]"
    );


    document.getElementById(
        "s11v12AddVideo"
    )
        ?.addEventListener(
            "click",
            () => {

                start11V12DevelopmentDraft
                    .videos
                    .push({
                        id:
                            "video_" +
                            Date.now(),

                        title:
                            "",

                        match:
                            "",

                        timestamp:
                            "",

                        url:
                            "",

                        note:
                            ""
                    });


                start11V12RenderContent();

            }
        );

}


function start11V12RenderEvaluations(
    target
) {

    const items =
        [
            ...(
                start11V12DevelopmentDraft
                    .evaluations ||
                []
            )
        ]
            .sort(
                (
                    a,
                    b
                ) =>
                    String(
                        b.date ||
                        ""
                    )
                        .localeCompare(
                            String(
                                a.date ||
                                ""
                            )
                        )
            );


    target.innerHTML = `

        <section class="s11v12-panel">

            <div class="s11v12-panel-head">

                <div>
                    <strong>EVALUERINGSHISTORIK</strong>
                    <div class="s11v12-muted">
                        Gem et snapshot af de nuværende ratings.
                    </div>
                </div>

                <button
                    id="s11v12AddEvaluation"
                    class="s11v12-btn primary"
                >
                    + NY EVALUERING
                </button>

            </div>


            <div class="s11v12-stack">

                ${
                    items.length
                        ? items.map(
                            item => `
                                <div
                                    class="s11v12-item"
                                    data-eval-row
                                    data-id="${
                                        start11V12Escape(
                                            item.id
                                        )
                                    }"
                                >

                                    <div class="s11v12-row3">

                                        <div>
                                            <strong>
                                                ${
                                                    start11V12Escape(
                                                        item.title ||
                                                        "Evaluering"
                                                    )
                                                }
                                            </strong>

                                            <div class="s11v12-muted">
                                                ${
                                                    start11V12Escape(
                                                        item.date ||
                                                        ""
                                                    )
                                                }
                                                · OVR ${
                                                    typeof start11V11Overall ===
                                                        "function"
                                                        ? start11V11Overall({
                                                            attributes:
                                                                item.attributes ||
                                                                []
                                                        })
                                                        : ""
                                                }
                                            </div>
                                        </div>

                                        <div class="s11v12-muted">
                                            ${
                                                start11V12Escape(
                                                    item.note ||
                                                    "Ingen note."
                                                )
                                            }
                                        </div>

                                        <button
                                            class="s11v12-del"
                                            data-delete
                                        >
                                            ×
                                        </button>

                                    </div>

                                </div>
                            `
                        ).join("")
                        : `
                            <div class="s11v12-empty">
                                Ingen evalueringer endnu.
                            </div>
                        `
                }

            </div>

        </section>
    `;


    target.querySelectorAll(
        "[data-eval-row]"
    )
        .forEach(
            row => {

                row.querySelector(
                    "[data-delete]"
                )
                    ?.addEventListener(
                        "click",
                        () => {

                            start11V12DevelopmentDraft.evaluations =
                                start11V12DevelopmentDraft
                                    .evaluations
                                    .filter(
                                        item =>
                                            item.id !==
                                            row.dataset.id
                                    );


                            start11V12RenderContent();

                            start11V12RenderSide();

                        }
                    );

            }
        );


    document.getElementById(
        "s11v12AddEvaluation"
    )
        ?.addEventListener(
            "click",
            () => {

                const title =
                    window.prompt(
                        "Titel på evalueringen:",
                        "Status " +
                        new Date()
                            .toLocaleDateString(
                                "da-DK"
                            )
                    );


                if (
                    title === null
                ) {

                    return;

                }


                const note =
                    window.prompt(
                        "Kort note:",
                        ""
                    ) || "";


                start11V12DevelopmentDraft
                    .evaluations
                    .push({
                        id:
                            "evaluation_" +
                            Date.now(),

                        date:
                            new Date()
                                .toISOString()
                                .slice(
                                    0,
                                    10
                                ),

                        title:
                            title ||
                            "Evaluering",

                        note,

                        attributes:
                            start11V12Clone(
                                start11V12DevelopmentDraft
                                    .attributes
                            )
                    });


                start11V12RenderContent();

                start11V12RenderSide();

            }
        );

}


function start11V12RenderNotes(
    target
) {

    target.innerHTML = `

        <section class="s11v12-panel">

            <div class="s11v12-panel-head">

                <div>
                    <strong>TRÆNERNOTER</strong>
                    <div class="s11v12-muted">
                        Samlet vurdering til spillerprofil og PDF.
                    </div>
                </div>

            </div>

            <textarea
                id="s11v12CoachNote"
                class="s11v12-textarea"
                style="min-height:240px;"
                placeholder="Skriv samlet vurdering af spilleren..."
            >${
                start11V12Escape(
                    start11V12DevelopmentDraft
                        .coachNote ||
                    ""
                )
            }</textarea>

        </section>
    `;


    document.getElementById(
        "s11v12CoachNote"
    )
        ?.addEventListener(
            "input",
            event => {

                start11V12DevelopmentDraft.coachNote =
                    event.target.value;

            }
        );

}


/* =========================================================
   ROBUST PDF – NEW PRINT WINDOW
========================================================= */

function start11V12BuildStandalonePdf() {

    const player =
        start11V12ProfileDraft;

    const development =
        start11V12DevelopmentDraft;


    const meta =
        typeof start11V8GetActiveMeta ===
            "function"
            ? start11V8GetActiveMeta()
            : {
                clubName:
                    "START11",
                teamName:
                    ""
            };


    const theme =
        typeof start11V9GetActiveTheme ===
            "function"
            ? start11V9GetActiveTheme()
            : {};


    const primary =
        theme.primaryColor ||
        "#65D13C";


    const logo =
        theme.logo ||
        "";


    const radar =
        start11V12Radar(
            development,
            390
        );


    const attrRows =
        (
            development.attributes ||
            []
        )
            .map(
                item => `
                    <tr>
                        <td>
                            ${
                                start11V12Escape(
                                    item.name
                                )
                            }
                        </td>

                        <td>
                            ${
                                start11V12Escape(
                                    item.category
                                )
                            }
                        </td>

                        <td>
                            <strong>
                                ${
                                    Number(
                                        item.rating ||
                                        0
                                    )
                                }
                            </strong>
                        </td>
                    </tr>
                `
            )
            .join(
                ""
            );


    const focus =
        (
            development.focus ||
            []
        )
            .map(
                item => `
                    <div class="card">
                        <h3>
                            ${
                                start11V12Escape(
                                    item.title ||
                                    "Fokus"
                                )
                            }
                        </h3>

                        <p>
                            ${
                                start11V12Escape(
                                    item.description ||
                                    ""
                                )
                            }
                        </p>

                        ${
                            item.target
                                ? `
                                    <p>
                                        <strong>Mål:</strong>
                                        ${
                                            start11V12Escape(
                                                item.target
                                            )
                                        }
                                    </p>
                                `
                                : ""
                        }
                    </div>
                `
            )
            .join(
                ""
            ) ||
        `
            <div class="card">
                Ingen udviklingsfokus registreret.
            </div>
        `;


    const trainingRows =
        (
            development.trainingPlan ||
            []
        )
            .map(
                item => `
                    <tr>
                        <td>
                            ${
                                start11V12Escape(
                                    item.exercise ||
                                    ""
                                )
                            }
                        </td>

                        <td>
                            ${
                                start11V12Escape(
                                    item.frequency ||
                                    ""
                                )
                            }
                        </td>

                        <td>
                            ${
                                start11V12Escape(
                                    item.goal ||
                                    ""
                                )
                            }
                        </td>

                        <td>
                            ${
                                start11V12Escape(
                                    item.status ||
                                    ""
                                )
                            }
                        </td>
                    </tr>
                `
            )
            .join(
                ""
            ) ||
        `
            <tr>
                <td colspan="4">
                    Ingen træningsplan registreret.
                </td>
            </tr>
        `;


    const videos =
        (
            development.videos ||
            []
        )
            .map(
                item => `
                    <div class="video">

                        <strong>
                            ${
                                start11V12Escape(
                                    item.title ||
                                    "Videoklip"
                                )
                            }
                        </strong>

                        <div class="muted">
                            ${
                                start11V12Escape(
                                    item.match ||
                                    ""
                                )
                            }

                            ${
                                item.timestamp
                                    ? ` · ${start11V12Escape(
                                        item.timestamp
                                    )}`
                                    : ""
                            }
                        </div>

                        ${
                            item.note
                                ? `
                                    <p>
                                        ${
                                            start11V12Escape(
                                                item.note
                                            )
                                        }
                                    </p>
                                `
                                : ""
                        }

                        ${
                            item.url
                                ? `
                                    <a
                                        href="${
                                            start11V12Escape(
                                                item.url
                                            )
                                        }"
                                    >
                                        ${
                                            start11V12Escape(
                                                item.url
                                            )
                                        }
                                    </a>
                                `
                                : ""
                        }

                    </div>
                `
            )
            .join(
                ""
            ) ||
        `
            <p>
                Ingen videoklip registreret.
            </p>
        `;


    return `
<!DOCTYPE html>

<html lang="da">

<head>

    <meta charset="UTF-8">

    <title>
        ${
            start11V12Escape(
                player.name
            )
        } - Individuel spillerudvikling
    </title>

    <style>

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            background: #fff;
            color: #111;
            font-family:
                Arial,
                Helvetica,
                sans-serif;
        }

        .page {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            padding: 14mm;
            page-break-after: always;
        }

        .page:last-child {
            page-break-after: auto;
        }

        header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 20px;

            padding-bottom: 7mm;

            border-bottom:
                3px solid
                ${primary};
        }

        .brand {
            color: ${primary};
            font-size: 12px;
            font-weight: 900;
            letter-spacing: 1.5px;
        }

        h1 {
            margin: 2mm 0 1mm;
            font-size: 25px;
        }

        h2 {
            margin:
                0 0 4mm;
            font-size: 14px;
        }

        h3 {
            margin:
                0 0 2mm;
            font-size: 11px;
        }

        p,
        td,
        th {
            font-size: 9.5px;
            line-height: 1.45;
        }

        .meta {
            color: #666;
            font-size: 9px;
        }

        .logo {
            width: 23mm;
            height: 23mm;
            object-fit: contain;
        }

        .grid {
            display: grid;
            grid-template-columns:
                1fr
                1fr;

            gap: 7mm;

            margin-top: 8mm;
        }

        .card {
            padding: 5mm;

            border:
                1px solid
                #DDD;

            border-radius: 3mm;
        }

        .rating {
            color: ${primary};
            font-size: 28px;
            font-weight: 900;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th,
        td {
            padding: 2.5mm;
            border-bottom:
                1px solid
                #DDD;
            text-align: left;
            vertical-align: top;
        }

        th {
            color: #555;
            font-size: 8px;
            text-transform: uppercase;
        }

        .video {
            padding: 4mm 0;
            border-bottom:
                1px solid
                #DDD;
        }

        .video a {
            color: #111;
            word-break: break-all;
        }

        .muted {
            margin-top: 1mm;
            color: #666;
            font-size: 8px;
        }

        .radar svg {
            width: 100%;
            height: auto;
        }

        .radar text {
            fill: #111 !important;
        }

        .radar polygon {
            stroke: #999;
        }

        @page {
            size: A4 portrait;
            margin: 0;
        }

        @media print {

            .page {
                margin: 0;
            }

        }

    </style>

</head>


<body>

    <section class="page">

        <header>

            <div>

                <div class="brand">
                    START11 · ${
                        start11V12Escape(
                            meta.clubName ||
                            ""
                        )
                    }
                </div>

                <h1>
                    Individuel spillerudvikling
                </h1>

                <div class="meta">
                    ${
                        start11V12Escape(
                            player.name
                        )
                    }
                    · #${
                        start11V12Escape(
                            player.number ||
                            "—"
                        )
                    }
                    · ${
                        start11V12Escape(
                            player.position ||
                            "—"
                        )
                    }
                    · ${
                        start11V12Escape(
                            meta.teamName ||
                            ""
                        )
                    }
                </div>

            </div>

            ${
                logo
                    ? `
                        <img
                            class="logo"
                            src="${
                                start11V12Escape(
                                    logo
                                )
                            }"
                        >
                    `
                    : ""
            }

        </header>


        <div class="grid">

            <div class="card">

                <h2>Spillerprofil</h2>

                <div class="rating">
                    ${start11V12Overall()}
                </div>

                <p>
                    <strong>Position:</strong>
                    ${
                        start11V12Escape(
                            player.position ||
                            "—"
                        )
                    }
                </p>

                <p>
                    <strong>Styrker:</strong><br>
                    ${
                        start11V12Escape(
                            player.strengths ||
                            "Ikke udfyldt."
                        )
                    }
                </p>

                <p>
                    <strong>Udviklingsområder:</strong><br>
                    ${
                        start11V12Escape(
                            player.weaknesses ||
                            "Ikke udfyldt."
                        )
                    }
                </p>

                <p>
                    <strong>Trænerens vurdering:</strong><br>
                    ${
                        start11V12Escape(
                            development.coachNote ||
                            "Ikke udfyldt."
                        )
                    }
                </p>

            </div>


            <div class="card radar">

                <h2>Radardiagram</h2>

                ${radar}

            </div>

        </div>


        <div
            class="card"
            style="margin-top:7mm;"
        >

            <h2>Attributes</h2>

            <table>

                <thead>
                    <tr>
                        <th>Attribute</th>
                        <th>Kategori</th>
                        <th>Rating</th>
                    </tr>
                </thead>

                <tbody>
                    ${attrRows}
                </tbody>

            </table>

        </div>

    </section>


    <section class="page">

        <header>

            <div>

                <div class="brand">
                    START11 · ${
                        start11V12Escape(
                            meta.clubName ||
                            ""
                        )
                    }
                </div>

                <h1>
                    Fokus & træningsplan
                </h1>

                <div class="meta">
                    ${
                        start11V12Escape(
                            player.name
                        )
                    }
                </div>

            </div>

            ${
                logo
                    ? `
                        <img
                            class="logo"
                            src="${
                                start11V12Escape(
                                    logo
                                )
                            }"
                        >
                    `
                    : ""
            }

        </header>


        <h2
            style="margin-top:8mm;"
        >
            Spillerfokus
        </h2>

        <div class="grid">
            ${focus}
        </div>


        <div
            class="card"
            style="margin-top:8mm;"
        >

            <h2>
                Individuel træningsplan
            </h2>

            <table>

                <thead>
                    <tr>
                        <th>Øvelse</th>
                        <th>Hyppighed</th>
                        <th>Mål</th>
                        <th>Status</th>
                    </tr>
                </thead>

                <tbody>
                    ${trainingRows}
                </tbody>

            </table>

        </div>

    </section>


    <section class="page">

        <header>

            <div>

                <div class="brand">
                    START11 · ${
                        start11V12Escape(
                            meta.clubName ||
                            ""
                        )
                    }
                </div>

                <h1>
                    Video & noter
                </h1>

                <div class="meta">
                    ${
                        start11V12Escape(
                            player.name
                        )
                    }
                </div>

            </div>

            ${
                logo
                    ? `
                        <img
                            class="logo"
                            src="${
                                start11V12Escape(
                                    logo
                                )
                            }"
                        >
                    `
                    : ""
            }

        </header>


        <div
            class="card"
            style="margin-top:8mm;"
        >

            <h2>Videoklip</h2>

            ${videos}

        </div>


        <div
            class="card"
            style="margin-top:8mm;"
        >

            <h2>Med bold</h2>

            <p>
                ${
                    start11V12Escape(
                        player.focusWithBall ||
                        "Ikke udfyldt."
                    )
                }
            </p>


            <h2>Uden bold</h2>

            <p>
                ${
                    start11V12Escape(
                        player.focusWithoutBall ||
                        "Ikke udfyldt."
                    )
                }
            </p>

        </div>

    </section>

</body>

</html>
    `;

}


function start11V12GeneratePdf() {

    if (
        !start11V12Save(
            false
        )
    ) {

        return;

    }


    /*
        Åbn vinduet direkte i klik-eventet.
        Det er mere robust end V11's window.print() på hovedsiden
        og undgår at eksisterende app-CSS skjuler PDF'en.
    */
    const printWindow =
        window.open(
            "",
            "_blank",
            "width=1000,height=800"
        );


    if (!printWindow) {

        if (
            typeof visNotification ===
            "function"
        ) {

            visNotification(
                "Browseren blokerede PDF-vinduet. Tillad popups for START11 og prøv igen."
            );

        }


        return;

    }


    printWindow.document.open();

    printWindow.document.write(
        start11V12BuildStandalonePdf()
    );

    printWindow.document.close();


    printWindow.focus();


    setTimeout(
        () => {

            printWindow.print();

        },
        700
    );

}


/* =========================================================
   OVERRIDE: TILFØJ / REDIGER SPILLER
========================================================= */

/*
    Fra nu af bruges samme samlede spillerprofil både
    til "Tilføj spiller" og "Rediger spiller".
*/
start11OpenSquadPlayerModal =
    function (
        id = null
    ) {

        const oldModal =
            document.getElementById(
                "squadPlayerModal"
            );


        if (oldModal) {

            oldModal.style.display =
                "none";

        }


        start11V12Open(
            id
        );

    };


/*
    Hvis gammel kode kalder denne funktion for at lukke
    spillereditoren, lukker vi også V12.
*/
const start11V12OldCloseSquadPlayerModal =
    typeof start11CloseSquadPlayerModal ===
        "function"
        ? start11CloseSquadPlayerModal
        : null;


start11CloseSquadPlayerModal =
    function () {

        if (
            start11V12OldCloseSquadPlayerModal
        ) {

            start11V12OldCloseSquadPlayerModal();

        }


        start11V12Close();

    };


/* =========================================================
   OVERRIDE: DETALJEBOKS FRA STARTOPSTILLING
   + RADARDIAGRAM
========================================================= */

const start11V12OriginalVisDetaljer =
    typeof visDetaljer ===
        "function"
        ? visDetaljer
        : null;


visDetaljer =
    function (
        spiller
    ) {

        /*
            Bevar hele den eksisterende detaljeboks først.
        */
        if (
            start11V12OriginalVisDetaljer
        ) {

            start11V12OriginalVisDetaljer(
                spiller
            );

        }


        const squadPlayer =
            start11V12FindFullSquadPlayerFromMatchPlayer(
                spiller
            );


        if (
            !squadPlayer
        ) {

            return;

        }


        /*
            Erstat den gamle "Rediger spiller"-handlers adfærd,
            så den åbner V12 i stedet for den gamle editor.
        */
        const editButton =
            document.getElementById(
                "detailsEditButton"
            );


        if (editButton) {

            const clone =
                editButton.cloneNode(
                    true
                );


            editButton.replaceWith(
                clone
            );


            clone.addEventListener(
                "click",
                () => {

                    if (
                        typeof lukPlayerModal ===
                        "function"
                    ) {

                        lukPlayerModal();

                    }


                    start11V12Open(
                        squadPlayer.id
                    );

                }
            );

        }


        const development =
            start11V12NormalizeDevelopment(
                squadPlayer.development
            );


        const radarWrap =
            document.createElement(
                "div"
            );


        radarWrap.className =
            "s11v12-detail-radar";


        radarWrap.innerHTML = `

            <div class="s11v12-detail-radar-copy">

                <h3>
                    SPILLERUDVIKLING
                </h3>

                <p>
                    Samlet rating:
                    <strong
                        style="color:var(--s11-primary);"
                    >
                        ${
                            typeof start11V11Overall ===
                                "function"
                                ? start11V11Overall(
                                    development
                                )
                                : "—"
                        }
                    </strong>
                </p>

                <p>
                    Radardiagrammet bruger de attributes,
                    der er valgt på spillerprofilen.
                </p>

                <button
                    type="button"
                    class="s11v12-btn"
                    id="s11v12DetailDevelopmentButton"
                >
                    ÅBN HELE SPILLERPROFILEN
                </button>

            </div>


            <div>

                ${
                    typeof start11V11Radar ===
                        "function"
                        ? start11V11Radar(
                            development,
                            null,
                            300
                        )
                        : `
                            <div class="s11v12-empty">
                                Ingen radar endnu.
                            </div>
                        `
                }

            </div>
        `;


        playerDetails.appendChild(
            radarWrap
        );


        document.getElementById(
            "s11v12DetailDevelopmentButton"
        )
            ?.addEventListener(
                "click",
                () => {

                    if (
                        typeof lukPlayerModal ===
                        "function"
                    ) {

                        lukPlayerModal();

                    }


                    start11V12Open(
                        squadPlayer.id
                    );

                }
            );

    };


/* =========================================================
   INIT
========================================================= */

function start11V12Init() {

    start11V12InstallStyles();

    start11V12EnsureModal();


    /*
        Skjul V11's separate spillerudviklingsknap.
        V12 har nu hele spillerprofilen samlet.
    */
    const oldDevelopmentButton =
        document.getElementById(
            "start11DevelopmentButtonV11"
        );


    if (oldDevelopmentButton) {

        oldDevelopmentButton.style.display =
            "none";

    }


    /*
        Den gamle spillereditor må ikke ligge ovenpå V12.
    */
    const oldModal =
        document.getElementById(
            "squadPlayerModal"
        );


    if (oldModal) {

        oldModal.style.display =
            "none";

    }

}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        () =>
            setTimeout(
                start11V12Init,
                1500
            )
    );

} else {

    setTimeout(
        start11V12Init,
        1500
    );

}


