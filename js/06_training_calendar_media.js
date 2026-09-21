/* =========================================================
   START11 – V15
   ---------------------------------------------------------
   KALENDER + TRÆNINGSMEDIER + VIDEOANALYSE-STUDIE

   Nyt:
   - KALENDER direkte i topmenuen
   - + TRÆNING direkte i kalenderen
   - Træninger vises i kalenderen
   - Klik på tom kalenderdag kan oprette træning
   - Træningsplan kan åbnes som A4 PDF/print
   - Træningspas kan have billeder, videoer og links
   - Drag & drop af lokale filer
   - Lokale medier gemmes i IndexedDB (samme browser)
   - Videoanalyse kan afspille uploadede videofiler direkte
   - Videoanalyser organiseres i mapper pr. kamp
   - Video-præsentation med forrige/næste klip
========================================================= */


/* =========================================================
   DATA
========================================================= */

function s15EnsureData() {

    if (
        !s13Data ||
        typeof s13Data !== "object"
    ) {
        s13Data = {};
    }

    if (
        !Array.isArray(
            s13Data.videoFolders
        )
    ) {
        s13Data.videoFolders = [];
    }

    if (
        !Array.isArray(
            s13Data.videoClips
        )
    ) {
        s13Data.videoClips = [];
    }

    if (
        !Array.isArray(
            s13Data.sessions
        )
    ) {
        s13Data.sessions = [];
    }

    s13Data.sessions.forEach(
        session => {

            if (
                !Array.isArray(
                    session.attachments
                )
            ) {
                session.attachments = [];
            }

        }
    );

}


if (
    typeof s13Norm ===
    "function"
) {

    const s15NormBefore =
        s13Norm;

    s13Norm =
        function (
            raw = {}
        ) {

            const data =
                s15NormBefore(
                    raw
                );

            data.videoFolders =
                Array.isArray(
                    raw.videoFolders
                )
                    ? raw.videoFolders
                    : [];

            data.videoClips =
                Array.isArray(
                    raw.videoClips
                )
                    ? raw.videoClips
                    : (
                        Array.isArray(
                            data.videoClips
                        )
                            ? data.videoClips
                            : []
                    );

            data.sessions =
                Array.isArray(
                    data.sessions
                )
                    ? data.sessions
                    : [];

            data.sessions.forEach(
                session => {

                    if (
                        !Array.isArray(
                            session.attachments
                        )
                    ) {
                        session.attachments = [];
                    }

                }
            );

            return data;

        };

}


/* =========================================================
   INDEXEDDB – LOKALE MEDIEFILER
========================================================= */

const S15_MEDIA_DB_NAME =
    "START11_MEDIA_DB";

const S15_MEDIA_DB_VERSION =
    1;

const S15_MEDIA_STORE =
    "media";


function s15TeamScope() {

    return String(
        typeof activeTeamId !==
            "undefined"
            ? (
                activeTeamId ||
                "no-team"
            )
            : "no-team"
    );

}


function s15MediaKey(
    mediaId
) {

    return (
        s15TeamScope() +
        "::" +
        mediaId
    );

}


function s15OpenMediaDb() {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            if (
                !("indexedDB" in window)
            ) {

                reject(
                    new Error(
                        "Browseren understøtter ikke IndexedDB."
                    )
                );

                return;
            }

            const request =
                indexedDB.open(
                    S15_MEDIA_DB_NAME,
                    S15_MEDIA_DB_VERSION
                );

            request.onupgradeneeded =
                () => {

                    const db =
                        request.result;

                    if (
                        !db.objectStoreNames
                            .contains(
                                S15_MEDIA_STORE
                            )
                    ) {

                        db.createObjectStore(
                            S15_MEDIA_STORE,
                            {
                                keyPath:
                                    "key"
                            }
                        );

                    }

                };

            request.onsuccess =
                () =>
                    resolve(
                        request.result
                    );

            request.onerror =
                () =>
                    reject(
                        request.error
                    );

        }
    );

}


async function s15StoreBlob(
    mediaId,
    file
) {

    const db =
        await s15OpenMediaDb();

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const tx =
                db.transaction(
                    S15_MEDIA_STORE,
                    "readwrite"
                );

            const store =
                tx.objectStore(
                    S15_MEDIA_STORE
                );

            store.put({
                key:
                    s15MediaKey(
                        mediaId
                    ),

                teamId:
                    s15TeamScope(),

                mediaId,

                name:
                    file.name,

                type:
                    file.type ||
                    "application/octet-stream",

                size:
                    file.size,

                updatedAt:
                    Date.now(),

                blob:
                    file
            });

            tx.oncomplete =
                () => {

                    db.close();
                    resolve();

                };

            tx.onerror =
                () => {

                    const error =
                        tx.error;

                    db.close();

                    reject(
                        error
                    );

                };

        }
    );

}


async function s15GetBlob(
    mediaId
) {

    const db =
        await s15OpenMediaDb();

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const tx =
                db.transaction(
                    S15_MEDIA_STORE,
                    "readonly"
                );

            const request =
                tx.objectStore(
                    S15_MEDIA_STORE
                )
                    .get(
                        s15MediaKey(
                            mediaId
                        )
                    );

            request.onsuccess =
                () => {

                    db.close();

                    resolve(
                        request.result ||
                        null
                    );

                };

            request.onerror =
                () => {

                    const error =
                        request.error;

                    db.close();

                    reject(
                        error
                    );

                };

        }
    );

}


async function s15DeleteBlob(
    mediaId
) {

    const db =
        await s15OpenMediaDb();

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const tx =
                db.transaction(
                    S15_MEDIA_STORE,
                    "readwrite"
                );

            tx.objectStore(
                S15_MEDIA_STORE
            )
                .delete(
                    s15MediaKey(
                        mediaId
                    )
                );

            tx.oncomplete =
                () => {

                    db.close();
                    resolve();

                };

            tx.onerror =
                () => {

                    const error =
                        tx.error;

                    db.close();

                    reject(
                        error
                    );

                };

        }
    );

}


function s15FileKind(
    type = "",
    name = ""
) {

    const mime =
        String(
            type
        )
            .toLowerCase();

    const lowerName =
        String(
            name
        )
            .toLowerCase();

    if (
        mime.startsWith(
            "video/"
        ) ||
        /\.(mp4|webm|mov|m4v|ogg)$/i
            .test(
                lowerName
            )
    ) {
        return "video";
    }

    if (
        mime.startsWith(
            "image/"
        ) ||
        /\.(png|jpe?g|webp|gif)$/i
            .test(
                lowerName
            )
    ) {
        return "image";
    }

    return "file";

}


function s15FormatBytes(
    bytes
) {

    const value =
        Number(
            bytes ||
            0
        );

    if (
        value <
        1024
    ) {
        return value +
            " B";
    }

    if (
        value <
        1024 *
        1024
    ) {
        return (
            value /
            1024
        )
            .toFixed(
                1
            ) +
            " KB";
    }

    return (
        value /
        (
            1024 *
            1024
        )
    )
        .toFixed(
            1
        ) +
        " MB";

}


async function s15BlobObjectUrl(
    mediaId
) {

    const item =
        await s15GetBlob(
            mediaId
        );

    if (
        !item?.blob
    ) {
        return "";
    }

    return URL.createObjectURL(
        item.blob
    );

}


function s15ReadBlobAsDataUrl(
    blob
) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const reader =
                new FileReader();

            reader.onload =
                () =>
                    resolve(
                        reader.result
                    );

            reader.onerror =
                () =>
                    reject(
                        reader.error
                    );

            reader.readAsDataURL(
                blob
            );

        }
    );

}


/* =========================================================
   STYLES
========================================================= */

function s15InstallStyles() {

    if (
        document.getElementById(
            "s15styles"
        )
    ) {
        return;
    }

    const style =
        document.createElement(
            "style"
        );

    style.id =
        "s15styles";

    style.textContent = `

        /* Kalender */
        #s15CalendarNav {
            border:
                1px solid
                var(--s11-border-strong) !important;

            border-radius:
                6px !important;

            color:
                var(--s11-primary) !important;
        }

        .s15-calendar-training {
            display: block;

            width: 100%;

            margin-top: 3px;
            padding:
                4px 5px;

            border:
                0;
            border-left:
                3px solid
                #4BA9FF;

            border-radius:
                4px;

            background:
                rgba(75,169,255,.10);

            color: #DDEEFF;

            font: inherit;
            font-size: 7px;
            text-align: left;

            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;

            cursor: pointer;
        }

        .s15-calendar-training:hover {
            background:
                rgba(75,169,255,.18);
        }

        .s15-calendar-training-dot {
            width: 7px;
            height: 7px;

            display: inline-block;

            margin-right: 5px;

            border-radius:
                50%;

            background:
                #4BA9FF;
        }

        .s15-calendar-add-training {
            border-color:
                rgba(75,169,255,.35) !important;

            color:
                #8CC9FF !important;
        }

        .s15-calendar-month-trainings {
            margin-top:
                12px;

            padding-top:
                12px;

            border-top:
                1px solid
                rgba(255,255,255,.08);
        }

        .s15-calendar-training-row {
            display: grid;
            grid-template-columns:
                74px
                minmax(0,1fr)
                68px;

            gap: 8px;

            align-items: center;

            padding:
                8px 5px;

            border-bottom:
                1px solid
                rgba(255,255,255,.055);

            color: #DDE6DF;
            font-size: 9px;
        }


        /* Træningsmedier */
        .s15-training-tools {
            margin-top:
                12px;

            padding-top:
                12px;

            border-top:
                1px solid
                rgba(255,255,255,.08);
        }

        .s15-dropzone {
            min-height: 94px;

            display: grid;
            place-items: center;

            padding: 13px;

            border:
                1px dashed
                rgba(255,255,255,.18);

            border-radius:
                8px;

            background:
                rgba(255,255,255,.015);

            color:
                #89968D;

            font-size: 8px;
            line-height: 1.55;
            text-align: center;

            cursor: pointer;
        }

        .s15-dropzone.dragover {
            border-color:
                var(--s11-primary);

            background:
                var(--s11-theme-glow-soft);

            color: #fff;
        }

        .s15-attachment-list {
            display: grid;
            gap: 7px;

            margin-top:
                9px;
        }

        .s15-attachment {
            display: grid;
            grid-template-columns:
                30px
                minmax(0,1fr)
                auto;

            gap: 8px;

            align-items: center;

            padding:
                8px;

            border:
                1px solid
                rgba(255,255,255,.075);

            border-radius:
                6px;

            background:
                #071009;
        }

        .s15-attachment-icon {
            width: 29px;
            height: 29px;

            display: grid;
            place-items: center;

            border:
                1px solid
                var(--s11-border);

            border-radius:
                5px;

            color:
                var(--s11-primary);

            font-size: 12px;
        }

        .s15-attachment-actions {
            display: flex;
            gap: 5px;
        }


        /* Videostudie */
        .s15-video-toolbar {
            display: grid;
            grid-template-columns:
                220px
                minmax(0,1fr)
                180px
                auto;

            gap: 8px;

            margin-bottom:
                10px;
        }

        .s15-video-studio {
            display: grid;
            grid-template-columns:
                285px
                minmax(0,1fr);

            gap: 12px;
        }

        .s15-folder-list,
        .s15-clip-list {
            display: grid;
            gap: 7px;
        }

        .s15-folder {
            padding: 10px;

            border:
                1px solid
                rgba(255,255,255,.075);

            border-radius:
                7px;

            background:
                #08100A;

            cursor: pointer;
        }

        .s15-folder.active {
            border-color:
                var(--s11-primary);

            background:
                color-mix(
                    in srgb,
                    var(--s11-primary) 7%,
                    #08100A
                );
        }

        .s15-folder-count {
            color:
                var(--s11-primary);

            font-size: 7px;
            font-weight: 900;
        }

        .s15-video-player-wrap {
            overflow: hidden;

            border:
                1px solid
                rgba(255,255,255,.09);

            border-radius:
                9px;

            background:
                #020403;
        }

        .s15-video-player-wrap video {
            width: 100%;
            max-height: 460px;

            display: block;

            background:
                #000;
        }

        .s15-image-player {
            width: 100%;
            max-height: 460px;

            display: block;

            object-fit: contain;

            background:
                #000;
        }

        .s15-local-file-note {
            padding: 8px 10px;

            border-top:
                1px solid
                rgba(255,255,255,.07);

            color:
                #7E8B82;

            font-size: 7px;
        }

        .s15-clip-editor-grid {
            display: grid;
            grid-template-columns:
                repeat(
                    2,
                    minmax(0,1fr)
                );

            gap: 8px;

            margin-top:
                10px;
        }

        .s15-presentation {
            position: fixed;
            inset: 0;

            z-index:
                10400;

            display: none;

            overflow-y: auto;

            background:
                radial-gradient(
                    circle at 70% 0%,
                    var(--s11-theme-glow-soft),
                    transparent 48%
                ),
                #030704;

            color: #fff;
        }

        .s15-presentation.open {
            display: block;
        }

        .s15-presentation-inner {
            width:
                min(
                    1380px,
                    calc(100vw - 36px)
                );

            margin: 0 auto;

            padding:
                22px 0 42px;
        }

        .s15-presentation-header {
            display: flex;
            align-items: center;
            justify-content: space-between;

            gap: 14px;

            margin-bottom:
                14px;
        }

        .s15-presentation-stage {
            display: grid;
            grid-template-columns:
                minmax(0,1.55fr)
                minmax(330px,.75fr);

            gap: 14px;
        }

        .s15-presentation-player {
            overflow: hidden;

            border:
                1px solid
                rgba(255,255,255,.1);

            border-radius:
                10px;

            background:
                #000;
        }

        .s15-presentation-player video,
        .s15-presentation-player img {
            width: 100%;
            max-height: 72vh;

            display: block;

            object-fit: contain;

            background:
                #000;
        }

        .s15-presentation-notes {
            padding: 17px;

            border:
                1px solid
                rgba(255,255,255,.09);

            border-radius:
                10px;

            background:
                rgba(255,255,255,.018);
        }

        .s15-presentation-notes h3 {
            margin:
                0 0 9px;

            color:
                var(--s11-primary);

            font-size: 11px;
        }

        .s15-presentation-navigation {
            display: flex;
            justify-content: space-between;
            align-items: center;

            gap: 10px;

            margin-top:
                13px;
        }


        @media (
            max-width: 1000px
        ) {

            .s15-video-toolbar,
            .s15-video-studio,
            .s15-presentation-stage,
            .s15-clip-editor-grid {
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
   KALENDER – DIREKTE ADGANG
========================================================= */

function s15InstallCalendarNav() {

    if (
        document.getElementById(
            "s15CalendarNav"
        )
    ) {
        return;
    }

    const nav =
        document.querySelector(
            ".start11-main-nav"
        );

    if (!nav) {
        return;
    }

    const button =
        document.createElement(
            "button"
        );

    button.id =
        "s15CalendarNav";

    button.type =
        "button";

    button.className =
        "start11-nav-item";

    button.textContent =
        "KALENDER";

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

            const section =
                document.getElementById(
                    "matchesSection"
                );

            section?.scrollIntoView({
                behavior:
                    "smooth",
                block:
                    "start"
            });

            setTimeout(
                () => {

                    if (
                        typeof start11CalendarSetOpen ===
                        "function"
                    ) {

                        start11CalendarSetOpen(
                            true
                        );

                    }

                },
                220
            );

        }
    );

    const coaching =
        document.getElementById(
            "s13nav"
        );

    if (coaching) {

        nav.insertBefore(
            button,
            coaching
        );

    } else {

        nav.appendChild(
            button
        );

    }

}


/* =========================================================
   KALENDER – TRÆNINGER
========================================================= */

function s15TrainingSessionsForDate(
    date
) {

    s15EnsureData();

    return s13Data.sessions.filter(
        session =>
            session.date ===
            date
    );

}


function s15CreateTrainingFromCalendar(
    date
) {

    s15EnsureData();

    const session = {
        id:
            s13Id(
                "session"
            ),

        date:
            date ||
            s13Today(),

        title:
            "Træning",

        theme:
            "",

        note:
            "",

        blocks:
            [],

        attendance:
            {},

        attachments:
            []
    };

    s13Data.sessions.push(
        session
    );

    s13Session =
        session.id;

    s13AttendanceSession =
        session.id;

    s13Save();

    if (
        typeof start11CalendarSetOpen ===
        "function"
    ) {

        start11CalendarSetOpen(
            false
        );

    }

    if (
        typeof s13Open ===
        "function"
    ) {

        s13Open();

        s13Tab =
            "training";

        s13Render();

        setTimeout(
            () => {

                if (
                    typeof s13EditSession ===
                    "function"
                ) {

                    s13EditSession();

                }

            },
            40
        );

    }

}


function s15EnsureCalendarTrainingButton() {

    const toolbar =
        document.querySelector(
            "#start11CalendarShell .start11-calendar-nav:last-child"
        );

    if (
        !toolbar ||
        document.getElementById(
            "s15CalendarAddTraining"
        )
    ) {
        return;
    }

    const button =
        document.createElement(
            "button"
        );

    button.id =
        "s15CalendarAddTraining";

    button.type =
        "button";

    button.className =
        "start11-calendar-action s15-calendar-add-training";

    button.textContent =
        "+ TRÆNING";

    const friendly =
        document.getElementById(
            "start11CalendarAddFriendly"
        );

    if (friendly) {

        toolbar.insertBefore(
            button,
            friendly
        );

    } else {

        toolbar.appendChild(
            button
        );

    }

    button.addEventListener(
        "click",
        () => {

            const date =
                window.prompt(
                    "Dato for træningen (ÅÅÅÅ-MM-DD):",
                    s13Today()
                );

            if (
                !date
            ) {
                return;
            }

            s15CreateTrainingFromCalendar(
                date
            );

        }
    );

}


function s15CalendarDayDates() {

    if (
        typeof start11CalendarDate ===
        "undefined"
    ) {
        return [];
    }

    const year =
        start11CalendarDate.getFullYear();

    const month =
        start11CalendarDate.getMonth();

    const first =
        new Date(
            year,
            month,
            1
        );

    const mondayIndex =
        (
            first.getDay() +
            6
        ) %
        7;

    const start =
        new Date(
            year,
            month,
            1 -
            mondayIndex
        );

    const dates = [];

    for (
        let i =
            0;
        i <
            42;
        i++
    ) {

        const date =
            new Date(
                start.getFullYear(),
                start.getMonth(),
                start.getDate() +
                i
            );

        dates.push(
            `${date.getFullYear()}-${String(
                date.getMonth() +
                1
            ).padStart(
                2,
                "0"
            )}-${String(
                date.getDate()
            ).padStart(
                2,
                "0"
            )}`
        );

    }

    return dates;

}


function s15DecorateCalendarTrainings() {

    s15EnsureData();

    s15EnsureCalendarTrainingButton();

    const grid =
        document.getElementById(
            "start11CalendarGrid"
        );

    if (!grid) {
        return;
    }

    const days =
        [
            ...grid.querySelectorAll(
                ".start11-calendar-day"
            )
        ];

    const dates =
        s15CalendarDayDates();

    days.forEach(
        (
            day,
            index
        ) => {

            const date =
                dates[
                    index
                ];

            if (!date) {
                return;
            }

            day.dataset.s15Date =
                date;

            day.querySelectorAll(
                ".s15-calendar-training"
            )
                .forEach(
                    item =>
                        item.remove()
                );

            s15TrainingSessionsForDate(
                date
            )
                .forEach(
                    session => {

                        const button =
                            document.createElement(
                                "button"
                            );

                        button.type =
                            "button";

                        button.className =
                            "s15-calendar-training";

                        button.textContent =
                            "TRÆNING · " +
                            (
                                session.theme ||
                                session.title ||
                                "Træning"
                            );

                        button.addEventListener(
                            "click",
                            event => {

                                event.stopPropagation();

                                if (
                                    typeof start11CalendarSetOpen ===
                                    "function"
                                ) {

                                    start11CalendarSetOpen(
                                        false
                                    );

                                }

                                s13Session =
                                    session.id;

                                if (
                                    typeof s13Open ===
                                    "function"
                                ) {

                                    s13Open();

                                    s13Tab =
                                        "training";

                                    s13Render();

                                    setTimeout(
                                        () =>
                                            s13EditSession?.(),
                                        30
                                    );

                                }

                            }
                        );

                        day.appendChild(
                            button
                        );

                    }
                );

            if (
                day.dataset.s15ClickBound !==
                "1"
            ) {

                day.dataset.s15ClickBound =
                    "1";

                day.addEventListener(
                    "dblclick",
                    event => {

                        if (
                            event.target.closest(
                                "button"
                            )
                        ) {
                            return;
                        }

                        const selectedDate =
                            day.dataset
                                .s15Date;

                        if (
                            !selectedDate
                        ) {
                            return;
                        }

                        s15CreateTrainingFromCalendar(
                            selectedDate
                        );

                    }
                );

                day.title =
                    "Dobbeltklik på dagen for at oprette træning";

            }

        }
    );

    s15RenderCalendarTrainingList();

}


function s15RenderCalendarTrainingList() {

    const shell =
        document.getElementById(
            "start11CalendarShell"
        );

    if (
        !shell ||
        typeof start11CalendarDate ===
            "undefined"
    ) {
        return;
    }

    shell.querySelector(
        ".s15-calendar-month-trainings"
    )
        ?.remove();

    const year =
        start11CalendarDate.getFullYear();

    const month =
        start11CalendarDate.getMonth();

    const sessions =
        s13Data.sessions
            .filter(
                session => {

                    if (
                        !session.date
                    ) {
                        return false;
                    }

                    const date =
                        new Date(
                            session.date +
                            "T12:00:00"
                        );

                    return (
                        !Number.isNaN(
                            date.getTime()
                        ) &&
                        date.getFullYear() ===
                            year &&
                        date.getMonth() ===
                            month
                    );

                }
            )
            .sort(
                (
                    a,
                    b
                ) =>
                    String(
                        a.date
                    )
                        .localeCompare(
                            String(
                                b.date
                            )
                        )
            );

    const section =
        document.createElement(
            "div"
        );

    section.className =
        "s15-calendar-month-trainings";

    section.innerHTML = `
        <div class="start11-calendar-month-list-title">
            Månedens træninger
        </div>

        ${
            sessions.length
                ? sessions
                    .map(
                        session => `
                            <div
                                class="s15-calendar-training-row"
                                data-s15-session="${
                                    s13Esc(
                                        session.id
                                    )
                                }"
                            >
                                <div>
                                    ${
                                        s13Date(
                                            session.date
                                        )
                                    }
                                </div>

                                <div>
                                    <strong>
                                        ${
                                            s13Esc(
                                                session.title ||
                                                "Træning"
                                            )
                                        }
                                    </strong>

                                    <div class="s13mut">
                                        ${
                                            s13Esc(
                                                session.theme ||
                                                "Intet tema"
                                            )
                                        }
                                        ·
                                        ${
                                            (
                                                session.blocks ||
                                                []
                                            )
                                                .reduce(
                                                    (
                                                        total,
                                                        block
                                                    ) =>
                                                        total +
                                                        Number(
                                                            block.duration ||
                                                            0
                                                        ),
                                                    0
                                                )
                                        } min
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    class="s13btn"
                                    data-open
                                >
                                    ÅBN
                                </button>
                            </div>
                        `
                    )
                    .join(
                        ""
                    )
                : `
                    <div class="start11-calendar-empty">
                        Ingen træninger i denne måned.
                    </div>
                `
        }
    `;

    shell.appendChild(
        section
    );

    section.querySelectorAll(
        "[data-s15-session]"
    )
        .forEach(
            row => {

                row.querySelector(
                    "[data-open]"
                )
                    ?.addEventListener(
                        "click",
                        () => {

                            const id =
                                row.dataset
                                    .s15Session;

                            start11CalendarSetOpen?.(
                                false
                            );

                            s13Session =
                                id;

                            s13Open?.();

                            s13Tab =
                                "training";

                            s13Render?.();

                            setTimeout(
                                () =>
                                    s13EditSession?.(),
                                30
                            );

                        }
                    );

            }
        );

}


/*
    Træninger skal med hver gang kalenderen renderes.
*/
if (
    typeof start11RenderCalendarV3 ===
    "function"
) {

    const s15RenderCalendarBefore =
        start11RenderCalendarV3;

    start11RenderCalendarV3 =
        function (
            ...args
        ) {

            const result =
                s15RenderCalendarBefore(
                    ...args
                );

            setTimeout(
                s15DecorateCalendarTrainings,
                0
            );

            return result;

        };

}


/* =========================================================
   TRÆNING – PDF + MEDIER
========================================================= */

let s15SessionEditorObserver =
    null;


function s15CurrentSession() {

    s15EnsureData();

    if (
        !s13Session
    ) {
        return null;
    }

    return s13Data.sessions.find(
        session =>
            session.id ===
            s13Session
    ) ||
    null;

}


function s15TrainingAttachmentIcon(
    attachment
) {

    if (
        attachment.kind ===
        "video"
    ) {
        return "▶";
    }

    if (
        attachment.kind ===
        "image"
    ) {
        return "▧";
    }

    if (
        attachment.kind ===
        "link"
    ) {
        return "↗";
    }

    return "•";

}


function s15InjectSessionTools() {

    const editor =
        document.getElementById(
            "s13sessionedit"
        );

    if (!editor) {
        return;
    }

    const session =
        s15CurrentSession();

    if (
        editor.querySelector(
            ".s15-training-tools"
        )
    ) {
        s15RenderSessionAttachments();
        return;
    }

    const section =
        document.createElement(
            "section"
        );

    section.className =
        "s15-training-tools";

    if (!session) {

        section.innerHTML = `
            <div class="s13head">
                <strong>PDF & MEDIER</strong>
            </div>

            <div class="s13mut">
                Gem træningen først. Derefter kan du tilføje billeder,
                videoer, links og lave en PDF.
            </div>
        `;

        editor.appendChild(
            section
        );

        return;
    }

    section.innerHTML = `

        <div class="s13head">

            <div>
                <strong>PDF & MEDIER</strong>

                <div class="s13mut">
                    Billeder og videoer du uploader gemmes lokalt i denne browser.
                    Links og metadata følger holdets gemte data.
                </div>
            </div>

            <button
                type="button"
                id="s15TrainingPdf"
                class="s13btn primary"
            >
                PDF
            </button>

        </div>


        <div
            id="s15TrainingDrop"
            class="s15-dropzone"
        >
            <div>
                <strong>
                    DROP BILLEDER / VIDEOER / FILER HER
                </strong>

                <div>
                    eller klik for at vælge filer
                </div>
            </div>

            <input
                id="s15TrainingFileInput"
                type="file"
                multiple
                accept="image/*,video/*,.pdf"
                hidden
            >
        </div>


        <div
            style="
                display:grid;
                grid-template-columns:minmax(0,1fr) auto;
                gap:8px;
                margin-top:9px;
            "
        >

            <input
                id="s15TrainingLinkInput"
                class="s13in"
                placeholder="Indsæt link til video, Drive, hjemmeside osv."
            >

            <button
                type="button"
                id="s15TrainingAddLink"
                class="s13btn"
            >
                + LINK
            </button>

        </div>


        <div
            id="s15TrainingAttachments"
            class="s15-attachment-list"
        ></div>
    `;

    editor.appendChild(
        section
    );

    const drop =
        document.getElementById(
            "s15TrainingDrop"
        );

    const input =
        document.getElementById(
            "s15TrainingFileInput"
        );

    drop?.addEventListener(
        "click",
        () =>
            input?.click()
    );

    [
        "dragenter",
        "dragover"
    ]
        .forEach(
            eventName => {

                drop?.addEventListener(
                    eventName,
                    event => {

                        event.preventDefault();
                        event.stopPropagation();

                        drop.classList.add(
                            "dragover"
                        );

                    }
                );

            }
        );

    [
        "dragleave",
        "drop"
    ]
        .forEach(
            eventName => {

                drop?.addEventListener(
                    eventName,
                    event => {

                        event.preventDefault();
                        event.stopPropagation();

                        drop.classList.remove(
                            "dragover"
                        );

                    }
                );

            }
        );

    drop?.addEventListener(
        "drop",
        event => {

            s15AddTrainingFiles(
                [
                    ...(
                        event.dataTransfer
                            ?.files ||
                        []
                    )
                ]
            );

        }
    );

    input?.addEventListener(
        "change",
        event => {

            s15AddTrainingFiles(
                [
                    ...(
                        event.target
                            .files ||
                        []
                    )
                ]
            );

            event.target.value =
                "";

        }
    );

    document.getElementById(
        "s15TrainingAddLink"
    )
        ?.addEventListener(
            "click",
            () => {

                const field =
                    document.getElementById(
                        "s15TrainingLinkInput"
                    );

                const url =
                    String(
                        field?.value ||
                        ""
                    )
                        .trim();

                if (!url) {
                    return;
                }

                session.attachments.push({
                    id:
                        s13Id(
                            "link"
                        ),

                    kind:
                        "link",

                    name:
                        url,

                    url,

                    type:
                        "text/uri-list",

                    size:
                        0
                });

                if (field) {
                    field.value =
                        "";
                }

                s13Save();

                s15RenderSessionAttachments();

            }
        );

    document.getElementById(
        "s15TrainingPdf"
    )
        ?.addEventListener(
            "click",
            () =>
                s15GenerateTrainingPdf(
                    session
                )
        );

    s15RenderSessionAttachments();

}


async function s15AddTrainingFiles(
    files
) {

    const session =
        s15CurrentSession();

    if (
        !session ||
        !files.length
    ) {
        return;
    }

    for (
        const file of
        files
    ) {

        /*
            Undgå ekstremt store lokale uploads ved et uheld.
        */
        if (
            file.size >
            750 *
            1024 *
            1024
        ) {

            visNotification?.(
                `${file.name} er større end 750 MB og blev ikke tilføjet.`
            );

            continue;
        }

        const id =
            s13Id(
                "media"
            );

        try {

            await s15StoreBlob(
                id,
                file
            );

            session.attachments.push({
                id,

                mediaId:
                    id,

                kind:
                    s15FileKind(
                        file.type,
                        file.name
                    ),

                name:
                    file.name,

                type:
                    file.type ||
                    "",

                size:
                    file.size
            });

        } catch (
            error
        ) {

            console.error(
                "START11 media upload error",
                error
            );

            visNotification?.(
                `Kunne ikke gemme ${file.name} lokalt.`
            );

        }

    }

    s13Save();

    s15RenderSessionAttachments();

}


async function s15OpenAttachment(
    attachment
) {

    if (
        attachment.kind ===
        "link"
    ) {

        window.open(
            attachment.url,
            "_blank",
            "noopener"
        );

        return;
    }

    const url =
        await s15BlobObjectUrl(
            attachment.mediaId
        );

    if (!url) {

        visNotification?.(
            "Filen findes ikke længere i denne browser."
        );

        return;
    }

    window.open(
        url,
        "_blank"
    );

    setTimeout(
        () =>
            URL.revokeObjectURL(
                url
            ),
        60000
    );

}


function s15RenderSessionAttachments() {

    const target =
        document.getElementById(
            "s15TrainingAttachments"
        );

    const session =
        s15CurrentSession();

    if (
        !target ||
        !session
    ) {
        return;
    }

    target.innerHTML =
        session.attachments.length
            ? session.attachments
                .map(
                    attachment => `
                        <div
                            class="s15-attachment"
                            data-attachment="${
                                s13Esc(
                                    attachment.id
                                )
                            }"
                        >

                            <div class="s15-attachment-icon">
                                ${
                                    s15TrainingAttachmentIcon(
                                        attachment
                                    )
                                }
                            </div>

                            <div>
                                <div class="s13title">
                                    ${
                                        s13Esc(
                                            attachment.name
                                        )
                                    }
                                </div>

                                <div class="s13mut">
                                    ${
                                        attachment.kind ===
                                        "link"
                                            ? "LINK"
                                            : (
                                                attachment.kind
                                                    .toUpperCase() +
                                                " · " +
                                                s15FormatBytes(
                                                    attachment.size
                                                )
                                            )
                                    }
                                </div>
                            </div>

                            <div class="s15-attachment-actions">

                                <button
                                    type="button"
                                    class="s13btn"
                                    data-open
                                >
                                    ÅBN
                                </button>

                                <button
                                    type="button"
                                    class="s13btn"
                                    data-delete
                                >
                                    ×
                                </button>

                            </div>

                        </div>
                    `
                )
                .join(
                    ""
                )
            : `
                <div class="s13mut">
                    Ingen billeder, videoer eller links på træningen endnu.
                </div>
            `;

    target.querySelectorAll(
        "[data-attachment]"
    )
        .forEach(
            row => {

                const attachment =
                    session.attachments
                        .find(
                            item =>
                                item.id ===
                                row.dataset
                                    .attachment
                        );

                if (!attachment) {
                    return;
                }

                row.querySelector(
                    "[data-open]"
                )
                    ?.addEventListener(
                        "click",
                        () =>
                            s15OpenAttachment(
                                attachment
                            )
                    );

                row.querySelector(
                    "[data-delete]"
                )
                    ?.addEventListener(
                        "click",
                        async () => {

                            if (
                                attachment.mediaId
                            ) {

                                try {

                                    await s15DeleteBlob(
                                        attachment.mediaId
                                    );

                                } catch (
                                    error
                                ) {

                                    console.warn(
                                        error
                                    );

                                }

                            }

                            session.attachments =
                                session.attachments
                                    .filter(
                                        item =>
                                            item.id !==
                                            attachment.id
                                    );

                            s13Save();

                            s15RenderSessionAttachments();

                        }
                    );

            }
        );

}


async function s15TrainingPdfImageHtml(
    attachment
) {

    if (
        attachment.kind !==
        "image" ||
        !attachment.mediaId
    ) {
        return "";
    }

    try {

        const stored =
            await s15GetBlob(
                attachment.mediaId
            );

        if (
            !stored?.blob
        ) {
            return "";
        }

        const dataUrl =
            await s15ReadBlobAsDataUrl(
                stored.blob
            );

        return `
            <div class="media-card">
                <img
                    src="${dataUrl}"
                    alt=""
                >

                <div>
                    ${
                        s13Esc(
                            attachment.name
                        )
                    }
                </div>
            </div>
        `;

    } catch {

        return "";

    }

}


async function s15GenerateTrainingPdf(
    session
) {

    const imageHtml =
        (
            await Promise.all(
                session.attachments
                    .map(
                        s15TrainingPdfImageHtml
                    )
            )
        )
            .join(
                ""
            );

    const meta =
        s13Meta();

    const theme =
        typeof start11V9GetActiveTheme ===
            "function"
            ? start11V9GetActiveTheme()
            : {};

    const primary =
        theme.primaryColor ||
        "#70D94A";

    const logo =
        theme.logo ||
        "";

    const blocks =
        (
            session.blocks ||
            []
        );

    const links =
        session.attachments
            .filter(
                item =>
                    item.kind ===
                    "link"
            );

    const videos =
        session.attachments
            .filter(
                item =>
                    item.kind ===
                    "video"
            );

    const printWindow =
        window.open(
            "",
            "_blank",
            "width=1050,height=850"
        );

    if (!printWindow) {

        visNotification?.(
            "Browseren blokerede PDF-vinduet. Tillad popups og prøv igen."
        );

        return;
    }

    printWindow.document.open();

    printWindow.document.write(`
<!doctype html>
<html lang="da">
<head>
<meta charset="utf-8">
<title>${s13Esc(session.title)} - Træningsplan</title>
<style>
*{box-sizing:border-box}
body{margin:0;background:#fff;color:#111;font-family:Arial,Helvetica,sans-serif}
.page{width:210mm;min-height:297mm;margin:0 auto;padding:14mm;page-break-after:always}
.page:last-child{page-break-after:auto}
header{display:flex;justify-content:space-between;align-items:center;gap:18px;padding-bottom:7mm;border-bottom:3px solid ${primary}}
.brand{color:${primary};font-size:11px;font-weight:900;letter-spacing:1px}
h1{margin:2mm 0 1mm;font-size:25px}
h2{font-size:14px;margin:0 0 4mm}
h3{font-size:11px;margin:0 0 2mm}
p,li,td,th{font-size:9.5px;line-height:1.45}
.logo{width:22mm;height:22mm;object-fit:contain}
.meta{color:#666;font-size:9px}
.card{padding:5mm;border:1px solid #ddd;border-radius:3mm;margin-top:7mm}
.block{display:grid;grid-template-columns:18mm minmax(0,1fr);gap:4mm;padding:4mm 0;border-bottom:1px solid #ddd}
.block:last-child{border-bottom:0}
.duration{color:${primary};font-size:17px;font-weight:900}
.media-grid{display:grid;grid-template-columns:1fr 1fr;gap:5mm}
.media-card{padding:3mm;border:1px solid #ddd;border-radius:2mm;font-size:8px}
.media-card img{width:100%;max-height:72mm;object-fit:contain;display:block;margin-bottom:2mm}
a{color:#111;word-break:break-all}
@page{size:A4 portrait;margin:0}
</style>
</head>
<body>
<section class="page">
<header>
<div>
<div class="brand">START11 · ${s13Esc(meta.clubName||"")}</div>
<h1>${s13Esc(session.title||"Træningsplan")}</h1>
<div class="meta">${s13Date(session.date)} · ${s13Esc(meta.teamName||"")} · ${s13Esc(session.theme||"")}</div>
</div>
${logo?`<img class="logo" src="${s13Esc(logo)}">`:""}
</header>

<div class="card">
<h2>Træningens fokus</h2>
<p>${s13Esc(session.note||"Ingen trænernote.")}</p>
</div>

<div class="card">
<h2>Træningsplan · ${blocks.reduce((sum,b)=>sum+Number(b.duration||0),0)} min</h2>
${blocks.length?blocks.map((b,i)=>`
<div class="block">
<div class="duration">${Number(b.duration||0)}<div style="font-size:7px;color:#666">MIN</div></div>
<div>
<h3>${i+1}. ${s13Esc(b.title||"Øvelse")}</h3>
<p>${s13Esc(b.note||"")}</p>
</div>
</div>`).join(""):"<p>Ingen øvelser tilføjet.</p>"}
</div>
</section>

<section class="page">
<header>
<div>
<div class="brand">START11 · ${s13Esc(meta.clubName||"")}</div>
<h1>Medier & links</h1>
<div class="meta">${s13Esc(session.title||"Træning")} · ${s13Date(session.date)}</div>
</div>
${logo?`<img class="logo" src="${s13Esc(logo)}">`:""}
</header>

${imageHtml?`<div class="card"><h2>Billeder</h2><div class="media-grid">${imageHtml}</div></div>`:""}

<div class="card">
<h2>Videoer</h2>
${videos.length?videos.map(v=>`<p><strong>${s13Esc(v.name)}</strong> · lokal videofil i START11</p>`).join(""):"<p>Ingen lokale videoer.</p>"}
</div>

<div class="card">
<h2>Links</h2>
${links.length?links.map(l=>`<p><a href="${s13Esc(l.url)}">${s13Esc(l.url)}</a></p>`).join(""):"<p>Ingen links.</p>"}
</div>
</section>
</body>
</html>
    `);

    printWindow.document.close();

    setTimeout(
        () => {

            printWindow.focus();
            printWindow.print();

        },
        650
    );

}


/*
    Session-editoren rerenderer internt. Observer kun den ene editor,
    og injicér medieværktøjer igen når nødvendigt.
*/
function s15WatchSessionEditor() {

    const editor =
        document.getElementById(
            "s13sessionedit"
        );

    if (
        !editor ||
        editor.dataset.s15Observed ===
            "1"
    ) {
        return;
    }

    editor.dataset.s15Observed =
        "1";

    const observer =
        new MutationObserver(
            () => {

                if (
                    !editor.querySelector(
                        ".s15-training-tools"
                    )
                ) {

                    queueMicrotask(
                        s15InjectSessionTools
                    );

                }

            }
        );

    observer.observe(
        editor,
        {
            childList:
                true,
            subtree:
                false
        }
    );

    s15InjectSessionTools();

}


/*
    Når V13 åbner/redigerer en træning, tilføj V15-værktøjer.
*/
if (
    typeof s13EditSession ===
    "function"
) {

    const s15EditSessionBefore =
        s13EditSession;

    s13EditSession =
        function (
            ...args
        ) {

            const result =
                s15EditSessionBefore(
                    ...args
                );

            setTimeout(
                () => {

                    s15WatchSessionEditor();

                    s15InjectSessionTools();

                },
                0
            );

            return result;

        };

}


/* =========================================================
   VIDEOANALYSE – MAPPER + DROP + AFSPILNING + PRÆSENTATION
========================================================= */

let s15SelectedFolderId =
    null;

let s15SelectedVideoClipId =
    null;

let s15PresentationFolderId =
    null;

let s15PresentationIndex =
    0;

let s15CurrentPlayerObjectUrl =
    "";


function s15RevokePlayerUrl() {

    if (
        s15CurrentPlayerObjectUrl
    ) {

        URL.revokeObjectURL(
            s15CurrentPlayerObjectUrl
        );

        s15CurrentPlayerObjectUrl =
            "";

    }

}


function s15VideoFolder(
    folderId
) {

    return s13Data.videoFolders.find(
        folder =>
            folder.id ===
            folderId
    ) ||
    null;

}


function s15FolderClips(
    folderId
) {

    return s13Data.videoClips.filter(
        clip =>
            clip.folderId ===
            folderId
    );

}


function s15EnsureDefaultVideoFolder() {

    s15EnsureData();

    if (
        s13Data.videoFolders.length
    ) {

        if (
            !s15SelectedFolderId
        ) {

            s15SelectedFolderId =
                s13Data.videoFolders[0].id;

        }

        return;
    }

    const folder = {
        id:
            s13Id(
                "videofolder"
            ),

        title:
            "Generelle analyser",

        opponent:
            "",

        date:
            "",

        note:
            "",

        createdAt:
            new Date()
                .toISOString()
    };

    s13Data.videoFolders.push(
        folder
    );

    s15SelectedFolderId =
        folder.id;

    s13Save();

}


function s15CreateVideoFolder() {

    const title =
        window.prompt(
            "Navn på videoanalyse-mappen:",
            "Kampanalyse"
        );

    if (
        title ===
        null
    ) {
        return;
    }

    const opponent =
        window.prompt(
            "Modstander / kamp:",
            ""
        ) ||
        "";

    const date =
        window.prompt(
            "Dato (ÅÅÅÅ-MM-DD):",
            s13Today()
        ) ||
        "";

    const folder = {
        id:
            s13Id(
                "videofolder"
            ),

        title:
            title.trim() ||
            "Kampanalyse",

        opponent:
            opponent.trim(),

        date:
            date.trim(),

        note:
            "",

        createdAt:
            new Date()
                .toISOString()
    };

    s13Data.videoFolders.unshift(
        folder
    );

    s15SelectedFolderId =
        folder.id;

    s15SelectedVideoClipId =
        null;

    s13Save();

}


function s15VideoStudio(
    target
) {

    s15EnsureData();

    s15EnsureDefaultVideoFolder();

    const folder =
        s15VideoFolder(
            s15SelectedFolderId
        ) ||
        s13Data.videoFolders[0];

    if (folder) {

        s15SelectedFolderId =
            folder.id;

    }

    const clips =
        folder
            ? s15FolderClips(
                folder.id
            )
            : [];

    const selected =
        clips.find(
            clip =>
                clip.id ===
                s15SelectedVideoClipId
        ) ||
        clips[0] ||
        null;

    if (
        selected
    ) {

        s15SelectedVideoClipId =
            selected.id;

    }

    target.innerHTML = `

        <div class="s15-video-toolbar">

            <button
                type="button"
                id="s15NewVideoFolder"
                class="s13btn primary"
            >
                + MAPPE / KAMP
            </button>

            <input
                id="s15FolderSearch"
                class="s13in"
                placeholder="Mapperne kan fx være AGF 12/9, Viborg 19/9..."
            >

            <button
                type="button"
                id="s15VideoPresentation"
                class="s13btn"
                ${
                    clips.length
                        ? ""
                        : "disabled"
                }
            >
                PRÆSENTATION
            </button>

            <button
                type="button"
                id="s15AddLinkClip"
                class="s13btn"
            >
                + LINK-KLIP
            </button>

        </div>


        <div class="s15-video-studio">

            <div>

                <section class="s13panel">

                    <div class="s13head">
                        <strong>VIDEOANALYSE-MAPPER</strong>
                    </div>

                    <div
                        id="s15VideoFolders"
                        class="s15-folder-list"
                    >

                        ${
                            s13Data.videoFolders
                                .map(
                                    item => {

                                        const count =
                                            s15FolderClips(
                                                item.id
                                            )
                                                .length;

                                        return `
                                            <div
                                                class="
                                                    s15-folder
                                                    ${
                                                        folder?.id ===
                                                        item.id
                                                            ? "active"
                                                            : ""
                                                    }
                                                "
                                                data-folder="${
                                                    s13Esc(
                                                        item.id
                                                    )
                                                }"
                                            >

                                                <div
                                                    style="
                                                        display:flex;
                                                        justify-content:space-between;
                                                        gap:8px;
                                                    "
                                                >
                                                    <div>
                                                        <div class="s13title">
                                                            ${
                                                                s13Esc(
                                                                    item.title
                                                                )
                                                            }
                                                        </div>

                                                        <div class="s13mut">
                                                            ${
                                                                item.opponent
                                                                    ? s13Esc(
                                                                        item.opponent
                                                                    )
                                                                    : "Ingen modstander"
                                                            }
                                                            ${
                                                                item.date
                                                                    ? ` · ${s13Date(
                                                                        item.date
                                                                    )}`
                                                                    : ""
                                                            }
                                                        </div>
                                                    </div>

                                                    <span class="s15-folder-count">
                                                        ${count} KLIP
                                                    </span>
                                                </div>

                                            </div>
                                        `;

                                    }
                                )
                                .join(
                                    ""
                                )
                        }

                    </div>

                </section>


                <section
                    class="s13panel"
                    style="margin-top:10px;"
                >

                    <div class="s13head">

                        <strong>
                            ${
                                folder
                                    ? s13Esc(
                                        folder.title
                                    )
                                    : "KLIP"
                            }
                        </strong>

                        ${
                            folder
                                ? `
                                    <button
                                        type="button"
                                        id="s15EditFolder"
                                        class="s13btn"
                                    >
                                        REDIGER
                                    </button>
                                `
                                : ""
                        }

                    </div>


                    <div
                        id="s15VideoDrop"
                        class="s15-dropzone"
                    >
                        <div>
                            <strong>
                                DROP VIDEO / BILLEDE HER
                            </strong>

                            <div>
                                Filer kan afspilles direkte i START11
                            </div>
                        </div>

                        <input
                            id="s15VideoFileInput"
                            type="file"
                            accept="video/*,image/*"
                            multiple
                            hidden
                        >
                    </div>


                    <div
                        class="s15-clip-list"
                        style="margin-top:9px;"
                    >

                        ${
                            clips.length
                                ? clips
                                    .map(
                                        clip => `
                                            <div
                                                class="
                                                    s14-video-clip
                                                    ${
                                                        selected?.id ===
                                                        clip.id
                                                            ? "active"
                                                            : ""
                                                    }
                                                "
                                                data-clip="${
                                                    s13Esc(
                                                        clip.id
                                                    )
                                                }"
                                            >

                                                <div class="s13title">
                                                    ${
                                                        s13Esc(
                                                            clip.title ||
                                                            "Videoklip"
                                                        )
                                                    }
                                                </div>

                                                <div class="s13mut">
                                                    ${
                                                        clip.playerId
                                                            ? s13Esc(
                                                                s13Players()
                                                                    .find(
                                                                        player =>
                                                                            player.id ===
                                                                            clip.playerId
                                                                    )
                                                                    ?.name ||
                                                                ""
                                                            )
                                                            : "Holdklip"
                                                    }
                                                    ${
                                                        clip.phase
                                                            ? ` · ${s13Esc(
                                                                clip.phase
                                                            )}`
                                                            : ""
                                                    }
                                                </div>

                                            </div>
                                        `
                                    )
                                    .join(
                                        ""
                                    )
                                : `
                                    <div class="s13mut">
                                        Mappen er tom. Drop en videofil eller et billede ovenfor.
                                    </div>
                                `
                        }

                    </div>

                </section>

            </div>


            <section
                id="s15VideoEditorPanel"
                class="s13panel"
            >

                ${
                    selected
                        ? s15VideoEditorHtml(
                            selected
                        )
                        : `
                            <div class="s13head">
                                <strong>VIDEOANALYSE</strong>
                            </div>

                            <div class="s14-video-player">
                                Vælg eller tilføj et klip.
                            </div>
                        `
                }

            </section>

        </div>
    `;


    document.getElementById(
        "s15NewVideoFolder"
    )
        ?.addEventListener(
            "click",
            () => {

                s15CreateVideoFolder();

                s15VideoStudio(
                    target
                );

            }
        );


    target.querySelectorAll(
        "[data-folder]"
    )
        .forEach(
            row => {

                row.addEventListener(
                    "click",
                    () => {

                        s15SelectedFolderId =
                            row.dataset
                                .folder;

                        s15SelectedVideoClipId =
                            null;

                        s15RevokePlayerUrl();

                        s15VideoStudio(
                            target
                        );

                    }
                );

            }
        );


    target.querySelectorAll(
        "[data-clip]"
    )
        .forEach(
            row => {

                row.addEventListener(
                    "click",
                    () => {

                        s15SelectedVideoClipId =
                            row.dataset
                                .clip;

                        s15RevokePlayerUrl();

                        s15VideoStudio(
                            target
                        );

                    }
                );

            }
        );


    const drop =
        document.getElementById(
            "s15VideoDrop"
        );

    const input =
        document.getElementById(
            "s15VideoFileInput"
        );

    drop?.addEventListener(
        "click",
        () =>
            input?.click()
    );

    [
        "dragenter",
        "dragover"
    ]
        .forEach(
            name => {

                drop?.addEventListener(
                    name,
                    event => {

                        event.preventDefault();

                        drop.classList.add(
                            "dragover"
                        );

                    }
                );

            }
        );

    [
        "dragleave",
        "drop"
    ]
        .forEach(
            name => {

                drop?.addEventListener(
                    name,
                    event => {

                        event.preventDefault();

                        drop.classList.remove(
                            "dragover"
                        );

                    }
                );

            }
        );

    drop?.addEventListener(
        "drop",
        event =>
            s15AddVideoFiles(
                [
                    ...(
                        event.dataTransfer
                            ?.files ||
                        []
                    )
                ],
                folder,
                target
            )
    );

    input?.addEventListener(
        "change",
        event => {

            s15AddVideoFiles(
                [
                    ...(
                        event.target
                            .files ||
                        []
                    )
                ],
                folder,
                target
            );

            event.target.value =
                "";

        }
    );


    document.getElementById(
        "s15AddLinkClip"
    )
        ?.addEventListener(
            "click",
            () => {

                if (!folder) {
                    return;
                }

                const url =
                    window.prompt(
                        "Videolink:",
                        "https://"
                    );

                if (
                    !url
                ) {
                    return;
                }

                const clip = {
                    id:
                        s13Id(
                            "clip"
                        ),

                    folderId:
                        folder.id,

                    title:
                        "Nyt link-klip",

                    sourceType:
                        "link",

                    url:
                        url.trim(),

                    mediaId:
                        "",

                    mediaKind:
                        "video",

                    playerId:
                        "",

                    attributeId:
                        "",

                    start:
                        "",

                    end:
                        "",

                    phase:
                        "Med bold",

                    outcome:
                        "Udvikling",

                    tags:
                        "",

                    observation:
                        "",

                    coachingQuestion:
                        "",

                    action:
                        "",

                    showInMeeting:
                        true,

                    createdAt:
                        new Date()
                            .toISOString()
                };

                s13Data.videoClips.push(
                    clip
                );

                s15SelectedVideoClipId =
                    clip.id;

                s13Save();

                s15VideoStudio(
                    target
                );

            }
        );


    document.getElementById(
        "s15VideoPresentation"
    )
        ?.addEventListener(
            "click",
            () => {

                if (
                    folder &&
                    clips.length
                ) {

                    s15OpenVideoPresentation(
                        folder.id
                    );

                }

            }
        );


    document.getElementById(
        "s15EditFolder"
    )
        ?.addEventListener(
            "click",
            () => {

                if (!folder) {
                    return;
                }

                const title =
                    window.prompt(
                        "Mappenavn:",
                        folder.title
                    );

                if (
                    title !==
                    null
                ) {
                    folder.title =
                        title.trim() ||
                        folder.title;
                }

                const opponent =
                    window.prompt(
                        "Modstander / kamp:",
                        folder.opponent ||
                        ""
                    );

                if (
                    opponent !==
                    null
                ) {
                    folder.opponent =
                        opponent.trim();
                }

                s13Save();

                s15VideoStudio(
                    target
                );

            }
        );


    if (
        selected
    ) {

        s15BindVideoEditorV15(
            target,
            selected
        );

        s15LoadVideoPreview(
            selected
        );

    }

}


async function s15AddVideoFiles(
    files,
    folder,
    target
) {

    if (
        !folder ||
        !files.length
    ) {
        return;
    }

    for (
        const file of
        files
    ) {

        const kind =
            s15FileKind(
                file.type,
                file.name
            );

        if (
            kind !==
                "video" &&
            kind !==
                "image"
        ) {

            visNotification?.(
                `${file.name} er ikke en video eller et billede.`
            );

            continue;
        }

        if (
            file.size >
            1000 *
            1024 *
            1024
        ) {

            visNotification?.(
                `${file.name} er større end 1 GB og blev ikke tilføjet.`
            );

            continue;
        }

        const mediaId =
            s13Id(
                "video-media"
            );

        try {

            await s15StoreBlob(
                mediaId,
                file
            );

            const clip = {
                id:
                    s13Id(
                        "clip"
                    ),

                folderId:
                    folder.id,

                title:
                    file.name
                        .replace(
                            /\.[^.]+$/,
                            ""
                        ),

                sourceType:
                    "local",

                mediaId,

                mediaKind:
                    kind,

                fileName:
                    file.name,

                fileSize:
                    file.size,

                url:
                    "",

                playerId:
                    "",

                attributeId:
                    "",

                start:
                    "",

                end:
                    "",

                phase:
                    "Med bold",

                outcome:
                    "Udvikling",

                tags:
                    "",

                observation:
                    "",

                coachingQuestion:
                    "",

                action:
                    "",

                showInMeeting:
                    true,

                createdAt:
                    new Date()
                        .toISOString()
            };

            s13Data.videoClips.push(
                clip
            );

            s15SelectedVideoClipId =
                clip.id;

        } catch (
            error
        ) {

            console.error(
                error
            );

            visNotification?.(
                `Kunne ikke gemme ${file.name}.`
            );

        }

    }

    s13Save();

    s15VideoStudio(
        target
    );

}


function s15VideoEditorHtml(
    clip
) {

    const player =
        s13Players().find(
            item =>
                item.id ===
                clip.playerId
        );

    const attributes =
        player
            ? (
                s13Dev(
                    player
                )
                    .attributes ||
                []
            )
            : [];

    return `

        <div class="s13head">

            <div>
                <strong>VIDEOANALYSE</strong>

                <div class="s13mut">
                    Observation → coaching-spørgsmål → næste handling.
                </div>
            </div>

            <button
                type="button"
                id="s15DeleteClip"
                class="s13btn"
            >
                SLET
            </button>

        </div>


        <div
            id="s15VideoPreview"
            class="s15-video-player-wrap"
        >
            <div class="s14-video-player">
                Indlæser medie...
            </div>
        </div>


        <div class="s15-clip-editor-grid">

            <label class="s13field">
                Titel
                <input
                    id="s15ClipTitle"
                    class="s13in"
                    value="${
                        s13Esc(
                            clip.title ||
                            ""
                        )
                    }"
                >
            </label>

            <label class="s13field">
                Spiller
                <select
                    id="s15ClipPlayer"
                    class="s13sel"
                >
                    <option value="">
                        Holdklip
                    </option>

                    ${
                        s13Players()
                            .map(
                                item => `
                                    <option
                                        value="${
                                            s13Esc(
                                                item.id
                                            )
                                        }"
                                        ${
                                            clip.playerId ===
                                            item.id
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        ${
                                            s13Esc(
                                                item.name
                                            )
                                        }
                                    </option>
                                `
                            )
                            .join(
                                ""
                            )
                    }
                </select>
            </label>

            <label class="s13field">
                Spilfase
                <select
                    id="s15ClipPhase"
                    class="s13sel"
                >
                    ${
                        [
                            "Med bold",
                            "Uden bold",
                            "Offensiv omstilling",
                            "Defensiv omstilling",
                            "Standard"
                        ]
                            .map(
                                phase => `
                                    <option
                                        ${
                                            clip.phase ===
                                            phase
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        ${phase}
                                    </option>
                                `
                            )
                            .join(
                                ""
                            )
                    }
                </select>
            </label>

            <label class="s13field">
                Kliptype
                <select
                    id="s15ClipOutcome"
                    class="s13sel"
                >
                    ${
                        [
                            "Positiv",
                            "Udvikling",
                            "Korrigering"
                        ]
                            .map(
                                value => `
                                    <option
                                        ${
                                            clip.outcome ===
                                            value
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        ${value}
                                    </option>
                                `
                            )
                            .join(
                                ""
                            )
                    }
                </select>
            </label>

            <label class="s13field">
                Attribute
                <select
                    id="s15ClipAttribute"
                    class="s13sel"
                >
                    <option value="">
                        Intet attribute
                    </option>

                    ${
                        attributes
                            .map(
                                attribute => `
                                    <option
                                        value="${
                                            s13Esc(
                                                attribute.id
                                            )
                                        }"
                                        ${
                                            clip.attributeId ===
                                            attribute.id
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        ${
                                            s13Esc(
                                                attribute.name
                                            )
                                        }
                                    </option>
                                `
                            )
                            .join(
                                ""
                            )
                    }
                </select>
            </label>

            <label class="s13field">
                Tags
                <input
                    id="s15ClipTags"
                    class="s13in"
                    value="${
                        s13Esc(
                            clip.tags ||
                            ""
                        )
                    }"
                    placeholder="scanning, 1v1, pres..."
                >
            </label>

            <label class="s13field">
                Starttid
                <input
                    id="s15ClipStart"
                    class="s13in"
                    value="${
                        s13Esc(
                            clip.start ||
                            ""
                        )
                    }"
                    placeholder="00:34:20"
                >
            </label>

            <label class="s13field">
                Sluttid
                <input
                    id="s15ClipEnd"
                    class="s13in"
                    value="${
                        s13Esc(
                            clip.end ||
                            ""
                        )
                    }"
                    placeholder="00:34:36"
                >
            </label>

        </div>


        <label
            class="s13field"
            style="margin-top:9px;"
        >
            Observation

            <textarea
                id="s15ClipObservation"
                class="s13txt"
                placeholder="Hvad sker der konkret i situationen?"
            >${
                s13Esc(
                    clip.observation ||
                    ""
                )
            }</textarea>
        </label>


        <label
            class="s13field"
            style="margin-top:9px;"
        >
            Coaching-spørgsmål

            <textarea
                id="s15ClipQuestion"
                class="s13txt"
                placeholder="Hvad vil du spørge spilleren om?"
            >${
                s13Esc(
                    clip.coachingQuestion ||
                    ""
                )
            }</textarea>
        </label>


        <label
            class="s13field"
            style="margin-top:9px;"
        >
            Næste handling

            <textarea
                id="s15ClipAction"
                class="s13txt"
                placeholder="Hvad skal spilleren gøre næste gang?"
            >${
                s13Esc(
                    clip.action ||
                    ""
                )
            }</textarea>
        </label>


        <label
            style="
                display:flex;
                align-items:center;
                gap:7px;
                margin-top:9px;
                color:#C1CBC3;
                font-size:8px;
            "
        >
            <input
                id="s15ClipMeeting"
                type="checkbox"
                ${
                    clip.showInMeeting
                        ? "checked"
                        : ""
                }
            >

            Brug i spillersamtale / præsentation
        </label>


        <div
            style="
                display:flex;
                justify-content:flex-end;
                margin-top:11px;
            "
        >

            <button
                type="button"
                id="s15SaveClip"
                class="s13btn primary"
            >
                GEM ANALYSE
            </button>

        </div>
    `;

}


async function s15LoadVideoPreview(
    clip
) {

    const target =
        document.getElementById(
            "s15VideoPreview"
        );

    if (!target) {
        return;
    }

    s15RevokePlayerUrl();

    if (
        clip.sourceType ===
            "local" &&
        clip.mediaId
    ) {

        const stored =
            await s15GetBlob(
                clip.mediaId
            );

        if (
            !stored?.blob
        ) {

            target.innerHTML = `
                <div class="s14-video-player">
                    Den lokale fil findes ikke på denne enhed.
                </div>
            `;

            return;
        }

        const url =
            URL.createObjectURL(
                stored.blob
            );

        s15CurrentPlayerObjectUrl =
            url;

        if (
            clip.mediaKind ===
            "image"
        ) {

            target.innerHTML = `
                <img
                    class="s15-image-player"
                    src="${url}"
                    alt=""
                >

                <div class="s15-local-file-note">
                    Lokal fil · ${
                        s13Esc(
                            clip.fileName ||
                            ""
                        )
                    }
                </div>
            `;

        } else {

            target.innerHTML = `
                <video
                    id="s15InlineVideo"
                    src="${url}"
                    controls
                    preload="metadata"
                ></video>

                <div class="s15-local-file-note">
                    Lokal video · ${
                        s13Esc(
                            clip.fileName ||
                            ""
                        )
                    }
                    ${
                        clip.fileSize
                            ? ` · ${s15FormatBytes(
                                clip.fileSize
                            )}`
                            : ""
                    }
                </div>
            `;

        }

        return;
    }

    if (
        clip.url
    ) {

        target.innerHTML = `
            <div class="s14-video-player">

                <div>

                    <div
                        style="
                            font-size:28px;
                            margin-bottom:9px;
                        "
                    >
                        ▶
                    </div>

                    <a
                        href="${
                            s13Esc(
                                clip.url
                            )
                        }"
                        target="_blank"
                        rel="noopener noreferrer"
                        style="
                            color:var(--s11-primary);
                            font-size:10px;
                            font-weight:900;
                        "
                    >
                        ÅBN EKSTERNT VIDEOCLIP ↗
                    </a>

                </div>

            </div>
        `;

        return;
    }

    target.innerHTML = `
        <div class="s14-video-player">
            Intet medie på klippet.
        </div>
    `;

}


function s15BindVideoEditorV15(
    target,
    clip
) {

    document.getElementById(
        "s15ClipPlayer"
    )
        ?.addEventListener(
            "change",
            event => {

                clip.playerId =
                    event.target.value;

                clip.attributeId =
                    "";

                s13Save();

                s15VideoStudio(
                    target
                );

            }
        );


    document.getElementById(
        "s15SaveClip"
    )
        ?.addEventListener(
            "click",
            () => {

                clip.title =
                    document.getElementById(
                        "s15ClipTitle"
                    )?.value.trim() ||
                    "Videoklip";

                clip.playerId =
                    document.getElementById(
                        "s15ClipPlayer"
                    )?.value ||
                    "";

                clip.phase =
                    document.getElementById(
                        "s15ClipPhase"
                    )?.value ||
                    "";

                clip.outcome =
                    document.getElementById(
                        "s15ClipOutcome"
                    )?.value ||
                    "";

                clip.attributeId =
                    document.getElementById(
                        "s15ClipAttribute"
                    )?.value ||
                    "";

                clip.tags =
                    document.getElementById(
                        "s15ClipTags"
                    )?.value.trim() ||
                    "";

                clip.start =
                    document.getElementById(
                        "s15ClipStart"
                    )?.value.trim() ||
                    "";

                clip.end =
                    document.getElementById(
                        "s15ClipEnd"
                    )?.value.trim() ||
                    "";

                clip.observation =
                    document.getElementById(
                        "s15ClipObservation"
                    )?.value ||
                    "";

                clip.coachingQuestion =
                    document.getElementById(
                        "s15ClipQuestion"
                    )?.value ||
                    "";

                clip.action =
                    document.getElementById(
                        "s15ClipAction"
                    )?.value ||
                    "";

                clip.showInMeeting =
                    Boolean(
                        document.getElementById(
                            "s15ClipMeeting"
                        )?.checked
                    );

                s13Save();

                s15VideoStudio(
                    target
                );

                visNotification?.(
                    "Videoanalysen er gemt."
                );

            }
        );


    document.getElementById(
        "s15DeleteClip"
    )
        ?.addEventListener(
            "click",
            async () => {

                if (
                    !window.confirm(
                        "Slet dette videoklip?"
                    )
                ) {
                    return;
                }

                if (
                    clip.mediaId
                ) {

                    try {

                        await s15DeleteBlob(
                            clip.mediaId
                        );

                    } catch {

                    }

                }

                s13Data.videoClips =
                    s13Data.videoClips
                        .filter(
                            item =>
                                item.id !==
                                clip.id
                        );

                s15SelectedVideoClipId =
                    null;

                s13Save();

                s15RevokePlayerUrl();

                s15VideoStudio(
                    target
                );

            }
        );

}


/*
    Erstat V14-videoanalysen med V15-studiet.
*/
if (
    typeof s13Videos ===
    "function"
) {

    s13Videos =
        function (
            target
        ) {

            s15VideoStudio(
                target
            );

        };

}


/* =========================================================
   VIDEO-PRÆSENTATION
========================================================= */

function s15EnsurePresentation() {

    let overlay =
        document.getElementById(
            "s15VideoPresentationOverlay"
        );

    if (overlay) {
        return overlay;
    }

    overlay =
        document.createElement(
            "div"
        );

    overlay.id =
        "s15VideoPresentationOverlay";

    overlay.className =
        "s15-presentation";

    document.body.appendChild(
        overlay
    );

    return overlay;

}


function s15OpenVideoPresentation(
    folderId
) {

    const clips =
        s15FolderClips(
            folderId
        );

    if (!clips.length) {
        return;
    }

    s15PresentationFolderId =
        folderId;

    s15PresentationIndex =
        0;

    s15RenderPresentation();

}


async function s15RenderPresentation() {

    const overlay =
        s15EnsurePresentation();

    const folder =
        s15VideoFolder(
            s15PresentationFolderId
        );

    const clips =
        s15FolderClips(
            s15PresentationFolderId
        );

    const clip =
        clips[
            s15PresentationIndex
        ];

    if (
        !folder ||
        !clip
    ) {
        overlay.classList.remove(
            "open"
        );

        return;
    }

    s15RevokePlayerUrl();

    overlay.innerHTML = `

        <div class="s15-presentation-inner">

            <div class="s15-presentation-header">

                <div>

                    <div
                        style="
                            color:var(--s11-primary);
                            font-size:9px;
                            font-weight:950;
                        "
                    >
                        START11 VIDEOANALYSE
                    </div>

                    <h1
                        style="
                            margin:4px 0;
                            font-size:27px;
                        "
                    >
                        ${
                            s13Esc(
                                folder.title
                            )
                        }
                    </h1>

                    <div class="s13mut">
                        ${
                            s13Esc(
                                folder.opponent ||
                                ""
                            )
                        }
                        ${
                            folder.date
                                ? ` · ${s13Date(
                                    folder.date
                                )}`
                                : ""
                        }
                        · klip ${
                            s15PresentationIndex +
                            1
                        } / ${clips.length}
                    </div>

                </div>

                <button
                    type="button"
                    id="s15PresentationClose"
                    class="s13btn"
                >
                    LUK
                </button>

            </div>


            <div class="s15-presentation-stage">

                <div
                    id="s15PresentationMedia"
                    class="s15-presentation-player"
                >
                    <div class="s14-video-player">
                        Indlæser...
                    </div>
                </div>


                <aside class="s15-presentation-notes">

                    <h3>
                        ${
                            s13Esc(
                                clip.title ||
                                "Videoklip"
                            )
                        }
                    </h3>

                    <div class="s13mut">
                        ${
                            s13Esc(
                                clip.phase ||
                                ""
                            )
                        }
                        ${
                            clip.outcome
                                ? ` · ${s13Esc(
                                    clip.outcome
                                )}`
                                : ""
                        }
                    </div>

                    <h3
                        style="margin-top:18px;"
                    >
                        OBSERVATION
                    </h3>

                    <p
                        style="
                            font-size:10px;
                            line-height:1.55;
                        "
                    >
                        ${
                            s13Esc(
                                clip.observation ||
                                "Ingen observation."
                            )
                        }
                    </p>

                    <h3
                        style="margin-top:18px;"
                    >
                        COACHING-SPØRGSMÅL
                    </h3>

                    <p
                        style="
                            font-size:10px;
                            line-height:1.55;
                        "
                    >
                        ${
                            s13Esc(
                                clip.coachingQuestion ||
                                "Intet spørgsmål."
                            )
                        }
                    </p>

                    <h3
                        style="margin-top:18px;"
                    >
                        NÆSTE HANDLING
                    </h3>

                    <p
                        style="
                            font-size:10px;
                            line-height:1.55;
                        "
                    >
                        ${
                            s13Esc(
                                clip.action ||
                                "Ingen handling."
                            )
                        }
                    </p>

                </aside>

            </div>


            <div class="s15-presentation-navigation">

                <button
                    type="button"
                    id="s15PresentationPrev"
                    class="s13btn"
                    ${
                        s15PresentationIndex ===
                        0
                            ? "disabled"
                            : ""
                    }
                >
                    ← FORRIGE
                </button>

                <div class="s13mut">
                    Brug præsentationen til holdmøde eller spillersamtale
                </div>

                <button
                    type="button"
                    id="s15PresentationNext"
                    class="s13btn primary"
                    ${
                        s15PresentationIndex >=
                        clips.length -
                        1
                            ? "disabled"
                            : ""
                    }
                >
                    NÆSTE →
                </button>

            </div>

        </div>
    `;

    overlay.classList.add(
        "open"
    );

    document.getElementById(
        "s15PresentationClose"
    )
        ?.addEventListener(
            "click",
            () => {

                s15RevokePlayerUrl();

                overlay.classList.remove(
                    "open"
                );

            }
        );

    document.getElementById(
        "s15PresentationPrev"
    )
        ?.addEventListener(
            "click",
            () => {

                if (
                    s15PresentationIndex >
                    0
                ) {

                    s15PresentationIndex -=
                        1;

                    s15RenderPresentation();

                }

            }
        );

    document.getElementById(
        "s15PresentationNext"
    )
        ?.addEventListener(
            "click",
            () => {

                if (
                    s15PresentationIndex <
                    clips.length -
                    1
                ) {

                    s15PresentationIndex +=
                        1;

                    s15RenderPresentation();

                }

            }
        );


    const media =
        document.getElementById(
            "s15PresentationMedia"
        );

    if (!media) {
        return;
    }

    if (
        clip.sourceType ===
            "local" &&
        clip.mediaId
    ) {

        const stored =
            await s15GetBlob(
                clip.mediaId
            );

        if (
            stored?.blob
        ) {

            const url =
                URL.createObjectURL(
                    stored.blob
                );

            s15CurrentPlayerObjectUrl =
                url;

            if (
                clip.mediaKind ===
                "image"
            ) {

                media.innerHTML = `
                    <img
                        src="${url}"
                        alt=""
                    >
                `;

            } else {

                media.innerHTML = `
                    <video
                        src="${url}"
                        controls
                        autoplay
                    ></video>
                `;

            }

        } else {

            media.innerHTML = `
                <div class="s14-video-player">
                    Filen findes ikke på denne enhed.
                </div>
            `;

        }

    } else if (
        clip.url
    ) {

        media.innerHTML = `
            <div class="s14-video-player">
                <a
                    href="${
                        s13Esc(
                            clip.url
                        )
                    }"
                    target="_blank"
                    rel="noopener noreferrer"
                    style="
                        color:var(--s11-primary);
                        font-size:11px;
                        font-weight:900;
                    "
                >
                    ÅBN EKSTERNT VIDEOCLIP ↗
                </a>
            </div>
        `;

    } else {

        media.innerHTML = `
            <div class="s14-video-player">
                Intet medie.
            </div>
        `;

    }

}


/* =========================================================
   SPILLERSAMTALE: MEDTAG V15-MEDIER
========================================================= */

function s15MeetingClips(
    playerId
) {

    s15EnsureData();

    return s13Data.videoClips.filter(
        clip =>
            clip.playerId ===
                playerId &&
            clip.showInMeeting ===
                true
    );

}


/* =========================================================
   DYNAMISK INIT
========================================================= */

function s15RefreshDynamic() {

    s15EnsureData();

    s15InstallCalendarNav();

    s15EnsureCalendarTrainingButton();

    s15DecorateCalendarTrainings();

    s15WatchSessionEditor();

}


function s15Init() {

    s15EnsureData();

    s15InstallStyles();

    s15InstallCalendarNav();

    s15EnsureCalendarTrainingButton();

    s15DecorateCalendarTrainings();

    s15WatchSessionEditor();


    let timer =
        null;

    const observer =
        new MutationObserver(
            mutations => {

                const relevant =
                    mutations.some(
                        mutation =>
                            [
                                ...mutation.addedNodes
                            ]
                                .some(
                                    node => {

                                        if (
                                            !(
                                                node instanceof
                                                Element
                                            )
                                        ) {
                                            return false;
                                        }

                                        return (
                                            node.id ===
                                                "start11CalendarShell" ||
                                            node.id ===
                                                "start11CalendarGrid" ||
                                            node.id ===
                                                "s13sessionedit" ||
                                            node.querySelector?.(
                                                "#start11CalendarShell,#start11CalendarGrid,#s13sessionedit"
                                            )
                                        );

                                    }
                                )
                    );

                if (!relevant) {
                    return;
                }

                if (timer) {
                    clearTimeout(
                        timer
                    );
                }

                timer =
                    setTimeout(
                        () => {

                            timer =
                                null;

                            s15RefreshDynamic();

                        },
                        90
                    );

            }
        );

    observer.observe(
        document.body,
        {
            childList:
                true,
            subtree:
                true
        }
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
                s15Init,
                2350
            )
    );

} else {

    setTimeout(
        s15Init,
        2350
    );

}



/* =========================================================
   START11 – V16
   ---------------------------------------------------------
   1) Fjerner den nye V14 GAMEPLAN-skærm helt fra workflowet
   2) Kommende kampe åbner igen den ORIGINALE KAMPPLAN
   3) Den originale KAMPPLAN gemmes nu separat pr. kamp
      og beholder den eksisterende PDF-funktion
   4) Kalender åbner som et rigtigt modal-vindue ligesom
      Coaching Hub – i stedet for inde i dashboardet
========================================================= */


/* =========================================================
   DATA – GAMMEL KAMPPLAN PR. KAMP
========================================================= */

function s16EnsureData() {

    if (
        !s13Data ||
        typeof s13Data !== "object"
    ) {
        s13Data = {};
    }

    if (
        !Array.isArray(
            s13Data.legacyMatchPlans
        )
    ) {
        s13Data.legacyMatchPlans = [];
    }

}


if (
    typeof s13Norm ===
    "function"
) {

    const s16NormBefore =
        s13Norm;

    s13Norm =
        function (
            raw = {}
        ) {

            const data =
                s16NormBefore(
                    raw
                );

            data.legacyMatchPlans =
                Array.isArray(
                    raw.legacyMatchPlans
                )
                    ? raw.legacyMatchPlans
                    : [];

            return data;

        };

}


/* =========================================================
   DEAKTIVER DEN NYE V14 GAMEPLAN
   ---------------------------------------------------------
   Dette sker allerede ved script-evaluering, altså inden
   V14's forsinkede init når at binde sin capture-listener.
========================================================= */

if (
    typeof s14InstallUpcomingGamePlanClicks ===
    "function"
) {

    s14InstallUpcomingGamePlanClicks =
        function () {};

}

if (
    typeof s14EnsureGamePlanModal ===
    "function"
) {

    s14EnsureGamePlanModal =
        function () {};

}

if (
    typeof s14DecorateUpcomingRows ===
    "function"
) {

    s14DecorateUpcomingRows =
        function () {};

}


/* =========================================================
   STYLES – KALENDER MODAL
========================================================= */

function s16InstallStyles() {

    if (
        document.getElementById(
            "s16styles"
        )
    ) {
        return;
    }

    const style =
        document.createElement(
            "style"
        );

    style.id =
        "s16styles";

    style.textContent = `

        #s16CalendarModal {
            z-index: 10320;
        }

        #s16CalendarModal .s16-calendar-shell {
            width:
                min(
                    1460px,
                    calc(100vw - 28px)
                );

            height:
                min(
                    920px,
                    calc(100vh - 28px)
                );

            max-width: none !important;

            padding: 0 !important;

            overflow: hidden;

            border:
                1px solid
                var(--s11-border-strong);

            border-radius:
                12px;

            background:
                radial-gradient(
                    circle at 72% 0%,
                    var(--s11-theme-glow-soft),
                    transparent 43%
                ),
                #061008;

            color: #fff;
        }

        .s16-calendar-top {
            min-height: 78px;

            display: flex;
            align-items: center;
            justify-content: space-between;

            gap: 16px;

            padding:
                15px 19px;

            border-bottom:
                1px solid
                rgba(255,255,255,.08);

            background:
                linear-gradient(
                    90deg,
                    color-mix(
                        in srgb,
                        var(--s11-primary) 8%,
                        transparent
                    ),
                    transparent 45%
                );
        }

        .s16-calendar-top h2 {
            margin:
                0 0 4px;

            color: #fff;

            font-size:
                23px;

            font-weight:
                950;
        }

        .s16-calendar-top p {
            margin: 0;

            color: #86928A;

            font-size:
                8px;
        }

        .s16-calendar-body {
            height:
                calc(
                    100% - 78px
                );

            overflow-y:
                auto;

            padding:
                16px 18px 24px;
        }

        /*
            Kalenderen bor nu inde i modalens body.
            Den skal derfor ikke have sit gamle dashboard-margin.
        */
        #s16CalendarModal #start11CalendarShell {
            display:
                block !important;

            width:
                100% !important;

            margin:
                0 !important;

            padding:
                0 !important;

            border:
                0 !important;

            border-radius:
                0 !important;

            background:
                transparent !important;
        }

        #s16CalendarModal #start11CalendarShell.active {
            display:
                block !important;
        }

        /*
            Behold det eksisterende kalenderdesign, men giv mere plads.
        */
        #s16CalendarModal .start11-calendar-grid {
            gap:
                7px !important;
        }

        #s16CalendarModal .start11-calendar-day {
            min-height:
                112px !important;

            padding:
                7px !important;
        }

        #s16CalendarModal .start11-calendar-toolbar {
            margin-bottom:
                14px !important;

            padding-bottom:
                12px;

            border-bottom:
                1px solid
                rgba(255,255,255,.065);
        }

        /*
            Kalender-mode på selve dashboardet er ikke længere nødvendig.
        */
        #matchesSection.start11-calendar-mode
            .next-match-card,
        #matchesSection.start11-calendar-mode
            .upcoming-card,
        #matchesSection.start11-calendar-mode
            .dbu-connect-card {
            display:
                block !important;
        }

        /*
            Den gamle V14 GAMEPLAN skal aldrig blive vist.
        */
        #s14GamePlanModal {
            display:
                none !important;
        }


        @media (
            max-width: 760px
        ) {

            #s16CalendarModal .s16-calendar-shell {
                width:
                    calc(100vw - 12px);

                height:
                    calc(100vh - 12px);
            }

            #s16CalendarModal .start11-calendar-day {
                min-height:
                    82px !important;
            }

        }

    `;

    document.head.appendChild(
        style
    );

}


/* =========================================================
   ORIGINAL KAMPPLAN – NØGLE / GEMNING PR. KAMP
========================================================= */

let s16CurrentMatchPlanKey =
    "";


function s16MatchPlanKey(
    match
) {

    const normalized =
        typeof start11CalendarNormalizeMatch ===
            "function"
            ? start11CalendarNormalizeMatch(
                match
            )
            : match;

    return String(
        normalized?.id ||
        normalized?.matchNumber ||
        normalized?.matchNo ||
        [
            normalized?.date ||
                "",
            normalized?.home ||
                normalized?.homeTeam ||
                "",
            normalized?.away ||
                normalized?.awayTeam ||
                "",
            normalized?.time ||
                ""
        ]
            .join(
                "::"
            )
    );

}


function s16FindLegacyMatchPlan(
    key
) {

    s16EnsureData();

    return s13Data
        .legacyMatchPlans
        .find(
            item =>
                String(
                    item.key
                ) ===
                String(
                    key
                )
        ) ||
        null;

}


function s16SaveCurrentLegacyMatchPlan() {

    s16EnsureData();

    if (
        !s16CurrentMatchPlanKey ||
        typeof kampplan ===
            "undefined"
    ) {
        return;
    }

    const payload = {
        key:
            s16CurrentMatchPlanKey,

        updatedAt:
            new Date()
                .toISOString(),

        data:
            JSON.parse(
                JSON.stringify(
                    kampplan
                )
            )
    };

    const index =
        s13Data
            .legacyMatchPlans
            .findIndex(
                item =>
                    String(
                        item.key
                    ) ===
                    String(
                        s16CurrentMatchPlanKey
                    )
            );

    if (
        index === -1
    ) {

        s13Data
            .legacyMatchPlans
            .push(
                payload
            );

    } else {

        s13Data
            .legacyMatchPlans[
                index
            ] =
                payload;

    }

    s13Save?.();

}


/* =========================================================
   ORIGINAL KAMPPLAN – ÅBN FRA KALENDER/KOMMENDE KAMPE
========================================================= */

if (
    typeof start11CalendarApplyMatchToEditor ===
    "function"
) {

    start11CalendarApplyMatchToEditor =
        function (
            match
        ) {

            s16EnsureData();

            const normalized =
                start11CalendarNormalizeMatch(
                    match
                );

            const key =
                s16MatchPlanKey(
                    normalized
                );

            s16CurrentMatchPlanKey =
                key;

            const saved =
                s16FindLegacyMatchPlan(
                    key
                );

            /*
                Behold evt. globalt baggrundsbillede som praktisk default,
                men ALT kampindhold gemmes fremover pr. kamp.
            */
            const fallbackBackground =
                typeof kampplan !==
                    "undefined"
                    ? (
                        kampplan
                            ?.backgroundImage ||
                        ""
                    )
                    : "";

            const basePlan =
                typeof defaultKampplan ===
                    "function"
                    ? defaultKampplan()
                    : {};

            kampplan = {
                ...basePlan,
                ...(
                    saved
                        ?.data ||
                    {}
                ),

                /*
                    DBU/kampdata er altid source of truth på disse felter.
                */
                homeTeam:
                    normalized.home ||
                    "",

                awayTeam:
                    normalized.away ||
                    "",

                matchDate:
                    normalized.date ||
                    "",

                matchTime:
                    normalized.time ||
                    "",

                matchPlace:
                    normalized.place ||
                    "",

                homeLogo:
                    normalized.homeLogo ||
                    saved?.data
                        ?.homeLogo ||
                    "",

                awayLogo:
                    normalized.awayLogo ||
                    saved?.data
                        ?.awayLogo ||
                    "",

                backgroundImage:
                    saved?.data
                        ?.backgroundImage ||
                    fallbackBackground ||
                    ""
            };

            start11CalendarEditContext = {
                mode:
                    "edit",

                id:
                    normalized.id,

                source:
                    normalized.source
            };

            /*
                Kalenderen må gerne lukke bag kampplanen.
            */
            if (
                typeof start11CalendarSetOpen ===
                    "function"
            ) {

                start11CalendarSetOpen(
                    false
                );

            }

            if (
                typeof åbnKampplan ===
                    "function"
            ) {

                åbnKampplan();

            }

        };

}


/* =========================================================
   ORIGINAL KAMPPLAN – NY TRÆNINGSKAMP
========================================================= */

if (
    typeof start11CalendarCreateFriendly ===
    "function"
) {

    start11CalendarCreateFriendly =
        function (
            date = ""
        ) {

            const ownTeam =
                start11CalendarTeamName();

            const id =
                `manual_${Date.now()}_${Math.random()
                    .toString(36)
                    .slice(2,8)}`;

            start11CalendarEditContext = {
                mode:
                    "new",

                id,

                source:
                    START11_CALENDAR_MANUAL_SOURCE
            };

            s16CurrentMatchPlanKey =
                id;

            const background =
                kampplan
                    ?.backgroundImage ||
                "";

            kampplan = {
                ...defaultKampplan(),

                homeTeam:
                    ownTeam,

                awayTeam:
                    "",

                matchDate:
                    start11CalendarToIsoDate(
                        date
                    ),

                matchTime:
                    "",

                matchPlace:
                    "",

                backgroundImage:
                    background
            };

            start11CalendarSetOpen?.(
                false
            );

            åbnKampplan?.();

        };

}


/* =========================================================
   GEM ORIGINAL KAMPPLAN PR. KAMP
   ---------------------------------------------------------
   Den gamle click-handler på #saveMatchplan kører først og
   gemmer kampplanen som normalt + PDF-data.
   Denne ekstra listener gemmer derefter samme kampplan under
   den konkrete kampnøgle.
========================================================= */

function s16BindOldMatchPlanSave() {

    const button =
        document.getElementById(
            "saveMatchplan"
        );

    if (
        !button ||
        button.dataset.s16PerMatchBound ===
            "1"
    ) {
        return;
    }

    button.dataset.s16PerMatchBound =
        "1";

    button.addEventListener(
        "click",
        () => {

            setTimeout(
                () => {

                    s16SaveCurrentLegacyMatchPlan();

                },
                0
            );

        }
    );

}


/* =========================================================
   KALENDER SOM MODAL
========================================================= */

function s16EnsureCalendarModal() {

    let modal =
        document.getElementById(
            "s16CalendarModal"
        );

    if (modal) {
        return modal;
    }

    modal =
        document.createElement(
            "div"
        );

    modal.id =
        "s16CalendarModal";

    modal.className =
        "modal";

    modal.innerHTML = `

        <div
            class="
                modal-content
                s16-calendar-shell
            "
        >

            <header class="s16-calendar-top">

                <div>
                    <h2>KALENDER</h2>

                    <p id="s16CalendarSubtitle">
                        Kampe, træninger og træningskampe
                    </p>
                </div>

                <button
                    type="button"
                    class="s13btn"
                    id="s16CalendarClose"
                >
                    LUK
                </button>

            </header>

            <div
                id="s16CalendarBody"
                class="s16-calendar-body"
            ></div>

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

                start11CalendarSetOpen?.(
                    false
                );

            }

        }
    );

    document.getElementById(
        "s16CalendarClose"
    )
        ?.addEventListener(
            "click",
            () =>
                start11CalendarSetOpen?.(
                    false
                )
        );

    return modal;

}


function s16MoveCalendarIntoModal() {

    const modal =
        s16EnsureCalendarModal();

    const body =
        document.getElementById(
            "s16CalendarBody"
        );

    const calendar =
        document.getElementById(
            "start11CalendarShell"
        );

    if (
        !modal ||
        !body ||
        !calendar
    ) {
        return false;
    }

    if (
        calendar.parentElement !==
        body
    ) {

        body.appendChild(
            calendar
        );

    }

    return true;

}


/* =========================================================
   OVERRIDE: ÅBN/LUK KALENDER
========================================================= */

start11CalendarSetOpen =
    function (
        open
    ) {

        const modal =
            s16EnsureCalendarModal();

        /*
            Kalenderens HTML oprettes af det eksisterende system.
            Flyt det blot ind i modal-vinduet.
        */
        s16MoveCalendarIntoModal();

        const calendar =
            document.getElementById(
                "start11CalendarShell"
            );

        if (
            !modal ||
            !calendar
        ) {
            return;
        }

        const section =
            document.getElementById(
                "matchesSection"
            );

        /*
            Fjern gammel inline-dashboard calendar mode.
        */
        section?.classList.remove(
            "start11-calendar-mode"
        );

        if (
            open
        ) {

            /*
                Åbn automatisk på måneden med nærmeste kommende kamp,
                ligesom før.
            */
            try {

                const next =
                    start11CalendarV3SortedMatches()
                        .find(
                            start11CalendarV3IsUpcoming
                        );

                if (next) {

                    const date =
                        start11CalendarDateObject(
                            next
                        );

                    if (date) {

                        start11CalendarDate =
                            new Date(
                                date.getFullYear(),
                                date.getMonth(),
                                1
                            );

                    }

                }

            } catch {

            }

            calendar.classList.add(
                "active"
            );

            modal.style.display =
                "flex";

            const meta =
                typeof s13Meta ===
                    "function"
                    ? s13Meta()
                    : {};

            const subtitle =
                document.getElementById(
                    "s16CalendarSubtitle"
                );

            if (subtitle) {

                subtitle.textContent =
                    [
                        meta.clubName ||
                            "",
                        meta.teamName ||
                            "",
                        "kampe, træninger og træningskampe"
                    ]
                        .filter(
                            Boolean
                        )
                        .join(
                            " · "
                        );

            }

            if (
                typeof start11RenderCalendar ===
                    "function"
            ) {

                start11RenderCalendar();

            }

            setTimeout(
                () => {

                    s15DecorateCalendarTrainings?.();

                },
                0
            );

        } else {

            modal.style.display =
                "none";

        }

    };


/* =========================================================
   TOPMENU KALENDER – ÅBN KUN MODAL
========================================================= */

function s16RebindCalendarNav() {

    const old =
        document.getElementById(
            "s15CalendarNav"
        );

    if (!old) {
        return;
    }

    /*
        Klon knappen for at fjerne V15's gamle scroll-handler.
    */
    const button =
        old.cloneNode(
            true
        );

    old.replaceWith(
        button
    );

    button.addEventListener(
        "click",
        () => {

            start11CalendarSetOpen(
                true
            );

        }
    );

}


/* =========================================================
   KALENDERENS HEADERKNAP
========================================================= */

function s16RebindCalendarHeaderButton() {

    const old =
        document.getElementById(
            "start11CalendarHeaderButton"
        );

    if (
        !old ||
        old.dataset.s16CalendarBound ===
            "1"
    ) {
        return;
    }

    /*
        Her behøver vi ikke klone: den gamle handler kalder også
        start11CalendarSetOpen(true), som nu er vores modal-version.
    */
    old.dataset.s16CalendarBound =
        "1";

}


/* =========================================================
   CLEANUP AF V14 GAMEPLAN UI
========================================================= */

function s16RemoveNewGamePlanUi() {

    document.getElementById(
        "s14GamePlanModal"
    )
        ?.remove();

    document.querySelectorAll(
        ".s14-upcoming-plan-badge"
    )
        .forEach(
            item =>
                item.remove()
        );

}


/* =========================================================
   DYNAMISK REFRESH
========================================================= */

function s16RefreshDynamic() {

    s16EnsureData();

    s16BindOldMatchPlanSave();

    s16MoveCalendarIntoModal();

    s16RebindCalendarHeaderButton();

    s16RemoveNewGamePlanUi();

}


/* =========================================================
   INIT
========================================================= */

function s16Init() {

    s16EnsureData();

    s16InstallStyles();

    s16EnsureCalendarModal();

    s16RemoveNewGamePlanUi();

    /*
        V15 opretter KALENDER-knappen lidt tidligere.
        Bind den om efter alle tidligere init-funktioner er kørt.
    */
    s16RebindCalendarNav();

    s16RefreshDynamic();


    let timer =
        null;

    const observer =
        new MutationObserver(
            mutations => {

                const relevant =
                    mutations.some(
                        mutation =>
                            [
                                ...mutation.addedNodes
                            ]
                                .some(
                                    node => {

                                        if (
                                            !(
                                                node instanceof
                                                Element
                                            )
                                        ) {
                                            return false;
                                        }

                                        return (
                                            node.id ===
                                                "start11CalendarShell" ||
                                            node.id ===
                                                "s15CalendarNav" ||
                                            node.id ===
                                                "s14GamePlanModal" ||
                                            node.id ===
                                                "saveMatchplan" ||
                                            node.querySelector?.(
                                                "#start11CalendarShell,#s15CalendarNav,#s14GamePlanModal,#saveMatchplan"
                                            )
                                        );

                                    }
                                )
                    );

                if (!relevant) {
                    return;
                }

                if (timer) {
                    clearTimeout(
                        timer
                    );
                }

                timer =
                    setTimeout(
                        () => {

                            timer =
                                null;

                            /*
                                Hvis V15 har genoprettet kalenderknappen,
                                bind den om.
                            */
                            const nav =
                                document.getElementById(
                                    "s15CalendarNav"
                                );

                            if (
                                nav &&
                                nav.dataset.s16Rebound !==
                                    "1"
                            ) {

                                s16RebindCalendarNav();

                                const rebound =
                                    document.getElementById(
                                        "s15CalendarNav"
                                    );

                                if (rebound) {

                                    rebound.dataset.s16Rebound =
                                        "1";

                                }

                            }

                            s16RefreshDynamic();

                        },
                        100
                    );

            }
        );

    observer.observe(
        document.body,
        {
            childList:
                true,
            subtree:
                true
        }
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
                s16Init,
                2700
            )
    );

} else {

    setTimeout(
        s16Init,
        2700
    );

}



/* =========================================================
   START11 – V17
   ---------------------------------------------------------
   ØVELSER SOM RIGTIGE TRÆNINGSKORT

   Hver øvelse kan nu have:
   - Navn
   - Beskrivelse
   - Fokuspunkt
   - Varighed
   - Antal spillere / organisation
   - Coachingpunkter
   - Progression
   - Regression
   - Billede
   - Video
   - Link
   - Andre filer

   Trænings-PDF'en viser øvelserne i rækkefølge:
   Rondo · 15 min
   billede/video/link
   beskrivelse
   fokuspunkt
   coaching
   progression/regression
   derefter næste øvelse
========================================================= */


/* =========================================================
   DATA
========================================================= */

function s17EnsureExerciseData() {

    if (
        !s13Data ||
        typeof s13Data !== "object"
    ) {
        return;
    }

    if (
        !Array.isArray(
            s13Data.exercises
        )
    ) {
        s13Data.exercises = [];
    }

    s13Data.exercises.forEach(
        exercise => {

            if (
                typeof exercise.description !==
                "string"
            ) {
                exercise.description =
                    "";
            }

            if (
                typeof exercise.focusPoint !==
                "string"
            ) {
                exercise.focusPoint =
                    "";
            }

            if (
                !Array.isArray(
                    exercise.attachments
                )
            ) {
                exercise.attachments =
                    [];
            }

        }
    );

}


if (
    typeof s13Norm ===
    "function"
) {

    const s17NormBefore =
        s13Norm;

    s13Norm =
        function (
            raw = {}
        ) {

            const data =
                s17NormBefore(
                    raw
                );

            if (
                !Array.isArray(
                    data.exercises
                )
            ) {
                data.exercises = [];
            }

            data.exercises.forEach(
                exercise => {

                    exercise.description =
                        String(
                            exercise.description ||
                            ""
                        );

                    exercise.focusPoint =
                        String(
                            exercise.focusPoint ||
                            ""
                        );

                    exercise.attachments =
                        Array.isArray(
                            exercise.attachments
                        )
                            ? exercise.attachments
                            : [];

                }
            );

            return data;

        };

}


/* =========================================================
   STYLES
========================================================= */

function s17InstallStyles() {

    if (
        document.getElementById(
            "s17styles"
        )
    ) {
        return;
    }

    const style =
        document.createElement(
            "style"
        );

    style.id =
        "s17styles";

    style.textContent = `

        .s17-exercise-card {
            padding: 12px;

            border:
                1px solid
                rgba(255,255,255,.075);

            border-radius:
                8px;

            background:
                #08100A;
        }

        .s17-exercise-card + .s17-exercise-card {
            margin-top:
                8px;
        }

        .s17-exercise-preview {
            display: grid;
            grid-template-columns:
                110px
                minmax(0,1fr)
                auto;

            gap: 10px;
            align-items: center;
        }

        .s17-exercise-thumb {
            width: 110px;
            height: 74px;

            display: grid;
            place-items: center;

            overflow: hidden;

            border:
                1px solid
                rgba(255,255,255,.08);

            border-radius:
                6px;

            background:
                #040705;

            color:
                #748078;

            font-size:
                7px;
        }

        .s17-exercise-thumb img,
        .s17-exercise-thumb video {
            width: 100%;
            height: 100%;

            object-fit: cover;
        }

        .s17-focus {
            margin-top:
                7px;

            padding:
                7px 8px;

            border-left:
                3px solid
                var(--s11-primary);

            border-radius:
                4px;

            background:
                var(--s11-theme-glow-soft);

            color: #EAF4EB;

            font-size:
                8px;

            line-height:
                1.45;
        }

        .s17-media-section {
            margin-top:
                10px;

            padding-top:
                10px;

            border-top:
                1px solid
                rgba(255,255,255,.07);
        }

        .s17-media-grid {
            display: grid;
            grid-template-columns:
                repeat(
                    2,
                    minmax(0,1fr)
                );

            gap: 8px;
        }

        .s17-media-item {
            display: grid;
            grid-template-columns:
                32px
                minmax(0,1fr)
                auto;

            gap: 8px;
            align-items: center;

            padding:
                8px;

            border:
                1px solid
                rgba(255,255,255,.075);

            border-radius:
                6px;

            background:
                #071009;
        }

        .s17-media-icon {
            width: 31px;
            height: 31px;

            display: grid;
            place-items: center;

            border:
                1px solid
                var(--s11-border);

            border-radius:
                5px;

            color:
                var(--s11-primary);

            font-size:
                13px;
        }

        .s17-exercise-drop {
            min-height:
                82px;

            display: grid;
            place-items: center;

            padding:
                12px;

            border:
                1px dashed
                rgba(255,255,255,.18);

            border-radius:
                7px;

            background:
                rgba(255,255,255,.014);

            color:
                #87938A;

            font-size:
                8px;

            text-align: center;

            cursor: pointer;
        }

        .s17-exercise-drop.dragover {
            border-color:
                var(--s11-primary);

            background:
                var(--s11-theme-glow-soft);

            color:
                #fff;
        }

        .s17-session-block-preview {
            margin-top:
                7px;

            padding:
                8px;

            border:
                1px solid
                rgba(255,255,255,.06);

            border-radius:
                6px;

            background:
                rgba(255,255,255,.012);

            color:
                #AAB5AC;

            font-size:
                7px;

            line-height:
                1.45;
        }

        @media (
            max-width: 900px
        ) {

            .s17-exercise-preview,
            .s17-media-grid {
                grid-template-columns:
                    1fr;
            }

            .s17-exercise-thumb {
                width:
                    100%;

                height:
                    150px;
            }

        }

    `;

    document.head.appendChild(
        style
    );

}


/* =========================================================
   ØVELSES-MEDIER
========================================================= */

function s17ExerciseMediaIcon(
    attachment
) {

    if (
        attachment.kind ===
        "video"
    ) {
        return "▶";
    }

    if (
        attachment.kind ===
        "image"
    ) {
        return "▧";
    }

    if (
        attachment.kind ===
        "link"
    ) {
        return "↗";
    }

    return "•";

}


async function s17OpenExerciseAttachment(
    attachment
) {

    if (
        attachment.kind ===
        "link"
    ) {

        window.open(
            attachment.url,
            "_blank",
            "noopener"
        );

        return;
    }

    const url =
        await s15BlobObjectUrl(
            attachment.mediaId
        );

    if (!url) {

        visNotification?.(
            "Filen findes ikke længere i denne browser."
        );

        return;
    }

    window.open(
        url,
        "_blank"
    );

    setTimeout(
        () =>
            URL.revokeObjectURL(
                url
            ),
        60000
    );

}


async function s17AddExerciseFiles(
    exercise,
    files
) {

    if (
        !exercise ||
        !files.length
    ) {
        return;
    }

    exercise.attachments =
        Array.isArray(
            exercise.attachments
        )
            ? exercise.attachments
            : [];

    for (
        const file of
        files
    ) {

        if (
            file.size >
            750 *
            1024 *
            1024
        ) {

            visNotification?.(
                `${file.name} er større end 750 MB og blev ikke tilføjet.`
            );

            continue;
        }

        const mediaId =
            s13Id(
                "exercise-media"
            );

        try {

            await s15StoreBlob(
                mediaId,
                file
            );

            exercise.attachments.push({
                id:
                    s13Id(
                        "exercise-attachment"
                    ),

                mediaId,

                kind:
                    s15FileKind(
                        file.type,
                        file.name
                    ),

                name:
                    file.name,

                type:
                    file.type ||
                    "",

                size:
                    file.size
            });

        } catch (
            error
        ) {

            console.error(
                error
            );

            visNotification?.(
                `Kunne ikke gemme ${file.name}.`
            );

        }

    }

    s13Save();

}


function s17ExerciseAttachmentsHtml(
    exercise
) {

    const attachments =
        Array.isArray(
            exercise.attachments
        )
            ? exercise.attachments
            : [];

    if (!attachments.length) {

        return `
            <div class="s13mut">
                Ingen billeder, videoer eller links på øvelsen endnu.
            </div>
        `;

    }

    return attachments
        .map(
            attachment => `
                <div
                    class="s17-media-item"
                    data-exercise-attachment="${
                        s13Esc(
                            attachment.id
                        )
                    }"
                >
                    <div class="s17-media-icon">
                        ${
                            s17ExerciseMediaIcon(
                                attachment
                            )
                        }
                    </div>

                    <div>
                        <div class="s13title">
                            ${
                                s13Esc(
                                    attachment.name
                                )
                            }
                        </div>

                        <div class="s13mut">
                            ${
                                attachment.kind ===
                                "link"
                                    ? "LINK"
                                    : (
                                        attachment.kind
                                            .toUpperCase() +
                                        " · " +
                                        s15FormatBytes(
                                            attachment.size
                                        )
                                    )
                            }
                        </div>
                    </div>

                    <div
                        style="
                            display:flex;
                            gap:5px;
                        "
                    >
                        <button
                            type="button"
                            class="s13btn"
                            data-open
                        >
                            ÅBN
                        </button>

                        <button
                            type="button"
                            class="s13btn"
                            data-delete
                        >
                            ×
                        </button>
                    </div>
                </div>
            `
        )
        .join(
            ""
        );

}



/* =========================================================
   START11 V24.6 – NATIVE ØVELSESBANK MAPPER
   Integreret direkte i den renderer der faktisk tegner
   ØVELSESBANK på skærmen.
========================================================= */

window.s246ExerciseFolderFilter = window.s246ExerciseFolderFilter || "all";

function s246Folders(){
    if(!Array.isArray(s13Data.exerciseFolders)) s13Data.exerciseFolders=[];
    return s13Data.exerciseFolders;
}
function s246FolderChildren(parentId=""){
    return s246Folders().filter(f=>String(f.parentId||"")===String(parentId||""))
        .sort((a,b)=>String(a.name||"").localeCompare(String(b.name||""),"da"));
}
function s246FolderDescendants(id){
    const set=new Set([String(id)]);
    let changed=true;
    while(changed){
        changed=false;
        s246Folders().forEach(f=>{
            if(set.has(String(f.parentId||""))&&!set.has(String(f.id))){
                set.add(String(f.id)); changed=true;
            }
        });
    }
    return set;
}
function s246FolderPath(id){
    const names=[], seen=new Set();
    let f=s246Folders().find(x=>String(x.id)===String(id));
    while(f&&!seen.has(String(f.id))){
        seen.add(String(f.id)); names.unshift(f.name||"Mappe");
        f=s246Folders().find(x=>String(x.id)===String(f.parentId||""));
    }
    return names.join(" / ");
}
function s246FolderTree(parentId="",depth=0){
    return s246FolderChildren(parentId).map(f=>{
        const count=(s13Data.exercises||[]).filter(x=>String(x.folderId||"")===String(f.id)).length;
        return `<button type="button" class="s246folder ${String(window.s246ExerciseFolderFilter)===String(f.id)?"active":""}"
            data-s246-folder="${s13Esc(f.id)}" style="--d:${depth}">
            <span>📁 ${s13Esc(f.name||"Mappe")}</span><small>${count}</small>
        </button>${s246FolderTree(f.id,depth+1)}`;
    }).join("");
}
function s246FolderOptions(excludeId=""){
    const blocked=excludeId?s246FolderDescendants(excludeId):new Set();
    const walk=(parent="",depth=0)=>s246FolderChildren(parent)
        .filter(f=>!blocked.has(String(f.id)))
        .map(f=>`<option value="${s13Esc(f.id)}">${"— ".repeat(depth)}${s13Esc(f.name||"Mappe")}</option>${walk(f.id,depth+1)}`)
        .join("");
    return `<option value="">Uden mappe</option>${walk()}`;
}
function s246ExerciseVisible(ex){
    const filter=String(window.s246ExerciseFolderFilter||"all");
    if(filter==="all") return true;
    if(filter==="root") return !ex.folderId;
    return s246FolderDescendants(filter).has(String(ex.folderId||""));
}
function s246ExerciseCover(ex){
    try{
        if(ex?.diagram?.frames?.[0] && typeof s19PitchSvg==="function"){
            return `<div class="s246cover" title="Opsætning · Trin 1">${s19PitchSvg(ex.diagram.pitch||"plain",ex.diagram.frames[0],0)}</div>`;
        }
    }catch(e){}
    return ex.attachments?.some(x=>x.kind==="video")?"VIDEO":
        ex.attachments?.some(x=>x.kind==="image")?"BILLEDE":"INGEN MEDIE";
}
function s246InstallStyles(){
    if(document.getElementById("s246styles")) return;
    const s=document.createElement("style"); s.id="s246styles";
    s.textContent=`
      .s246banklayout{display:grid;grid-template-columns:175px minmax(0,1fr);gap:9px;margin-top:9px}
      .s246folders{border:1px solid rgba(255,255,255,.08);border-radius:7px;padding:7px;background:#061008;min-width:0}
      .s246folderhead{display:flex;justify-content:space-between;align-items:center;gap:5px;margin-bottom:5px}
      .s246folderhead strong{font-size:7px}
      .s246folder{width:100%;min-height:28px;display:flex;align-items:center;justify-content:space-between;gap:5px;padding:3px 5px 3px calc(5px + var(--d,0)*10px);border:0;border-radius:5px;background:transparent;color:#89968c;font:inherit;font-size:6.8px;text-align:left;cursor:pointer}
      .s246folder:hover,.s246folder.active{background:rgba(130,255,84,.09);color:#fff}
      .s246folder small{color:var(--s11-primary,#82ff54);font-size:5.8px}
      .s246folderactions{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,.06)}
      .s246folderactions .s13btn{min-height:26px;padding:0 4px;font-size:5.7px}
      .s246list{min-width:0}
      .s246cover{width:100%;height:100%;overflow:hidden;background:#176a36;display:grid;place-items:center}
      .s246cover svg{display:block;width:100%!important;height:100%!important;max-width:none!important}
      .s246folderchip{display:inline-block;margin-top:4px;padding:2px 5px;border:1px solid rgba(255,255,255,.08);border-radius:999px;color:#859188;font-size:5.5px}
      @media(max-width:760px){.s246banklayout{grid-template-columns:1fr}.s246folders{max-height:230px;overflow:auto}}
    `;
    document.head.appendChild(s);
}
s246InstallStyles();


/* =========================================================
   NY ØVELSESBANK
========================================================= */

s13Exercises =
    function (
        target
    ) {

        s17EnsureExerciseData();

        const editing =
            s13Data.exercises.find(
                exercise =>
                    exercise.id ===
                    s13Exercise
            ) ||
            {
                id:
                    "",
                title:
                    "",
                theme:
                    "",
                duration:
                    15,
                players:
                    "",
                description:
                    "",
                focusPoint:
                    "",
                coaching:
                    "",
                progression:
                    "",
                regression:
                    "",
                attachments:
                    []
            };

        target.innerHTML = `

            <div class="s13grid">

                <section class="s13panel">

                    <div class="s13head">

                        <div>
                            <strong>ØVELSESBANK</strong>

                            <div class="s13mut">
                                Byg øvelser med tekst, fokuspunkt, billeder, videoer og links.
                            </div>
                        </div>

                        <div style="display:flex;gap:6px;flex-wrap:wrap">
                            <button
                                type="button"
                                id="s246NewFolder"
                                class="s13btn"
                            >
                                + NY MAPPE
                            </button>
                            <button
                                type="button"
                                id="s17NewExercise"
                                class="s13btn primary"
                            >
                                + NY ØVELSE
                            </button>
                        </div>

                    </div>


                    <div class="s246banklayout">
                        <aside class="s246folders">
                            <div class="s246folderhead"><strong>MAPPER</strong><button type="button" id="s246FolderPlus" class="s13btn">+</button></div>
                            <button type="button" class="s246folder ${window.s246ExerciseFolderFilter==="all"?"active":""}" data-s246-folder="all"><span>▦ Alle øvelser</span><small>${s13Data.exercises.length}</small></button>
                            <button type="button" class="s246folder ${window.s246ExerciseFolderFilter==="root"?"active":""}" data-s246-folder="root"><span>⌂ Uden mappe</span><small>${s13Data.exercises.filter(x=>!x.folderId).length}</small></button>
                            ${s246FolderTree()}
                            <div class="s246folderactions">
                                <button type="button" id="s246SubFolder" class="s13btn">+ UNDERMAPPE</button>
                                <button type="button" id="s246RenameFolder" class="s13btn">OMDØB</button>
                                <button type="button" id="s246MoveFolder" class="s13btn">FLYT</button>
                                <button type="button" id="s246DeleteFolder" class="s13btn">SLET</button>
                            </div>
                        </aside>
                        <div class="s13stack s246list">

                        ${
                            s13Data.exercises.length
                                ? s13Data.exercises
                                    .map(
                                        exercise => `

                                            <div class="s17-exercise-card" style="${s246ExerciseVisible(exercise)?"":"display:none"}">

                                                <div class="s17-exercise-preview">

                                                    <div
                                                        class="s17-exercise-thumb"
                                                        data-thumb-exercise="${s13Esc(exercise.id)}"
                                                    >
                                                        ${s246ExerciseCover(exercise)}
                                                    </div>


                                                    <div>

                                                        <div
                                                            style="
                                                                display:flex;
                                                                align-items:center;
                                                                gap:7px;
                                                                flex-wrap:wrap;
                                                            "
                                                        >

                                                            <div class="s13title">
                                                                ${
                                                                    s13Esc(
                                                                        exercise.title ||
                                                                        "Øvelse"
                                                                    )
                                                                }
                                                            </div>

                                                            <span class="s13badge">
                                                                ${
                                                                    Number(
                                                                        exercise.duration ||
                                                                        0
                                                                    )
                                                                } MIN
                                                            </span>

                                                        </div>


                                                        <div class="s13mut">
                                                            ${
                                                                s13Esc(
                                                                    exercise.theme ||
                                                                    "Intet tema"
                                                                )
                                                            }
                                                            ${
                                                                exercise.players
                                                                    ? ` · ${s13Esc(
                                                                        exercise.players
                                                                    )}`
                                                                    : ""
                                                            }
                                                        </div>


                                                        ${
                                                            exercise.focusPoint
                                                                ? `
                                                                    <div class="s17-focus">
                                                                        <strong>FOKUS:</strong>
                                                                        ${
                                                                            s13Esc(
                                                                                exercise.focusPoint
                                                                            )
                                                                        }
                                                                    </div>
                                                                `
                                                                : ""
                                                        }

                                                        ${exercise.folderId?`<span class="s246folderchip">📁 ${s13Esc(s246FolderPath(exercise.folderId))}</span>`:""}

                                                    </div>


                                                    <button
                                                        type="button"
                                                        class="s13btn"
                                                        data-edit-exercise="${
                                                            s13Esc(
                                                                exercise.id
                                                            )
                                                        }"
                                                    >
                                                        REDIGER
                                                    </button>

                                                </div>

                                            </div>

                                        `
                                    )
                                    .join(
                                        ""
                                    )
                                : `
                                    <div class="s13mut">
                                        Ingen øvelser endnu.
                                    </div>
                                `
                        }

                        </div>
                    </div>

                </section>


                <section class="s13panel">

                    <div class="s13head">

                        <div>
                            <strong>
                                ${
                                    editing.id
                                        ? "REDIGER ØVELSE"
                                        : "NY ØVELSE"
                                }
                            </strong>

                            <div class="s13mut">
                                Alt her følger med når øvelsen bruges i en træningsplan.
                            </div>
                        </div>

                    </div>


                    <div class="s13stack">

                        <label class="s13field">
                            Mappe
                            <select id="s246ExerciseFolder" class="s13sel">
                                ${s246FolderOptions()}
                            </select>
                        </label>

                        <label class="s13field">
                            Navn på øvelse

                            <input
                                id="s17ExerciseTitle"
                                class="s13in"
                                value="${
                                    s13Esc(
                                        editing.title
                                    )
                                }"
                                placeholder="Fx 4v2 rondo"
                            >
                        </label>


                        <div class="s13grid">

                            <label class="s13field">
                                Tema

                                <input
                                    id="s17ExerciseTheme"
                                    class="s13in"
                                    value="${
                                        s13Esc(
                                            editing.theme
                                        )
                                    }"
                                    placeholder="Fx spilbarhed"
                                >
                            </label>


                            <label class="s13field">
                                Varighed i minutter

                                <input
                                    id="s17ExerciseDuration"
                                    class="s13in"
                                    type="number"
                                    min="1"
                                    max="180"
                                    value="${
                                        Number(
                                            editing.duration ||
                                            15
                                        )
                                    }"
                                >
                            </label>

                        </div>


                        <label class="s13field">
                            Antal spillere / organisation

                            <input
                                id="s17ExercisePlayers"
                                class="s13in"
                                value="${
                                    s13Esc(
                                        editing.players
                                    )
                                }"
                                placeholder="Fx 6 spillere · 12x12 meter"
                            >
                        </label>


                        <label class="s13field">
                            Beskrivelse

                            <textarea
                                id="s17ExerciseDescription"
                                class="s13txt"
                                placeholder="Forklar øvelsen trin for trin..."
                            >${
                                s13Esc(
                                    editing.description
                                )
                            }</textarea>
                        </label>


                        <label class="s13field">
                            Fokuspunkt

                            <textarea
                                id="s17ExerciseFocus"
                                class="s13txt"
                                placeholder="Fx orientering før modtagelse, åbne hofter, spil på få berøringer..."
                            >${
                                s13Esc(
                                    editing.focusPoint
                                )
                            }</textarea>
                        </label>


                        <label class="s13field">
                            Coachingpunkter

                            <textarea
                                id="s17ExerciseCoaching"
                                class="s13txt"
                                placeholder="Hvad skal træneren især kigge efter og coache?"
                            >${
                                s13Esc(
                                    editing.coaching
                                )
                            }</textarea>
                        </label>


                        <div class="s13grid">

                            <label class="s13field">
                                Progression

                                <textarea
                                    id="s17ExerciseProgression"
                                    class="s13txt"
                                    placeholder="Hvordan gøres øvelsen sværere?"
                                >${
                                    s13Esc(
                                        editing.progression
                                    )
                                }</textarea>
                            </label>


                            <label class="s13field">
                                Regression

                                <textarea
                                    id="s17ExerciseRegression"
                                    class="s13txt"
                                    placeholder="Hvordan gøres øvelsen lettere?"
                                >${
                                    s13Esc(
                                        editing.regression
                                    )
                                }</textarea>
                            </label>

                        </div>


                        ${
                            editing.id
                                ? `

                                    <section class="s17-media-section">

                                        <div class="s13head">

                                            <div>
                                                <strong>MEDIER TIL ØVELSEN</strong>

                                                <div class="s13mut">
                                                    Tilføj fx banetegning, billede, demonstrationsvideo eller link.
                                                </div>
                                            </div>

                                        </div>


                                        <div
                                            id="s17ExerciseDrop"
                                            class="s17-exercise-drop"
                                        >

                                            <div>
                                                <strong>
                                                    DROP BILLEDE / VIDEO / FIL HER
                                                </strong>

                                                <div>
                                                    eller klik for at vælge
                                                </div>
                                            </div>

                                            <input
                                                id="s17ExerciseFileInput"
                                                type="file"
                                                multiple
                                                accept="image/*,video/*,.pdf"
                                                hidden
                                            >

                                        </div>


                                        <div
                                            style="
                                                display:grid;
                                                grid-template-columns:minmax(0,1fr) auto;
                                                gap:8px;
                                                margin-top:8px;
                                            "
                                        >

                                            <input
                                                id="s17ExerciseLink"
                                                class="s13in"
                                                placeholder="Link til YouTube, Drive, hjemmeside osv."
                                            >

                                            <button
                                                type="button"
                                                id="s17ExerciseAddLink"
                                                class="s13btn"
                                            >
                                                + LINK
                                            </button>

                                        </div>


                                        <div
                                            id="s17ExerciseMediaList"
                                            class="s17-media-grid"
                                            style="margin-top:9px;"
                                        >
                                            ${
                                                s17ExerciseAttachmentsHtml(
                                                    editing
                                                )
                                            }
                                        </div>

                                    </section>

                                `
                                : `
                                    <div class="s13mut">
                                        Gem øvelsen først. Derefter kan du tilføje billede, video og links.
                                    </div>
                                `
                        }


                        <div
                            style="
                                display:flex;
                                justify-content:flex-end;
                                gap:8px;
                            "
                        >

                            ${
                                editing.id
                                    ? `
                                        <button
                                            type="button"
                                            id="s17DeleteExercise"
                                            class="s13btn"
                                        >
                                            SLET
                                        </button>
                                    `
                                    : ""
                            }

                            <button
                                type="button"
                                id="s17SaveExercise"
                                class="s13btn primary"
                            >
                                GEM ØVELSE
                            </button>

                        </div>

                    </div>

                </section>

            </div>
        `;



        const s246FolderSelect=document.getElementById("s246ExerciseFolder");
        if(s246FolderSelect) s246FolderSelect.value=editing.folderId||"";

        const s246CreateFolder=(parentId="")=>{
            const name=window.prompt(parentId?"Navn på undermappe:":"Navn på mappe:");
            if(!name?.trim()) return;
            const f={id:s13Id("folder"),name:name.trim(),parentId:parentId||""};
            s246Folders().push(f);
            window.s246ExerciseFolderFilter=f.id;
            s13Save();
            s13Exercises(target);
        };
        document.getElementById("s246NewFolder")?.addEventListener("click",()=>s246CreateFolder(""));
        document.getElementById("s246FolderPlus")?.addEventListener("click",()=>s246CreateFolder(""));
        target.querySelectorAll("[data-s246-folder]").forEach(b=>b.addEventListener("click",()=>{
            window.s246ExerciseFolderFilter=b.dataset.s246Folder||"all";
            s13Exercises(target);
        }));
        document.getElementById("s246SubFolder")?.addEventListener("click",()=>{
            const id=String(window.s246ExerciseFolderFilter||"all");
            if(id==="all"||id==="root") return window.alert("Vælg først den mappe, undermappen skal ligge i.");
            s246CreateFolder(id);
        });
        document.getElementById("s246RenameFolder")?.addEventListener("click",()=>{
            const id=String(window.s246ExerciseFolderFilter||"all");
            const f=s246Folders().find(x=>String(x.id)===id);
            if(!f) return window.alert("Vælg først en mappe.");
            const name=window.prompt("Nyt navn:",f.name||"");
            if(!name?.trim()) return;
            f.name=name.trim(); s13Save(); s13Exercises(target);
        });
        document.getElementById("s246DeleteFolder")?.addEventListener("click",()=>{
            const id=String(window.s246ExerciseFolderFilter||"all");
            const f=s246Folders().find(x=>String(x.id)===id);
            if(!f) return window.alert("Vælg først en mappe.");
            if(!window.confirm(`Slet mappen "${f.name}" og dens undermapper? Øvelserne bliver ikke slettet.`)) return;
            const ids=s246FolderDescendants(id);
            s13Data.exercises.forEach(ex=>{if(ids.has(String(ex.folderId||""))) ex.folderId="";});
            s13Data.exerciseFolders=s246Folders().filter(x=>!ids.has(String(x.id)));
            window.s246ExerciseFolderFilter="all"; s13Save(); s13Exercises(target);
        });
        document.getElementById("s246MoveFolder")?.addEventListener("click",()=>{
            const id=String(window.s246ExerciseFolderFilter||"all");
            const f=s246Folders().find(x=>String(x.id)===id);
            if(!f) return window.alert("Vælg først en mappe.");
            const names=s246Folders().filter(x=>!s246FolderDescendants(id).has(String(x.id)));
            const choices=["0 = Rodmappe",...names.map((x,i)=>`${i+1} = ${s246FolderPath(x.id)}`)].join("\n");
            const answer=window.prompt("Flyt til:\n"+choices,"0");
            if(answer===null) return;
            const n=Number(answer);
            if(!Number.isInteger(n)||n<0||n>names.length) return window.alert("Ugyldigt valg.");
            f.parentId=n===0?"":names[n-1].id;
            s13Save(); s13Exercises(target);
        });

        target.querySelectorAll(
            "[data-edit-exercise]"
        )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            s13Exercise =
                                button.dataset
                                    .editExercise;

                            s13Exercises(
                                target
                            );

                        }
                    );

                }
            );


        document.getElementById(
            "s17NewExercise"
        )
            ?.addEventListener(
                "click",
                () => {

                    s13Exercise =
                        null;

                    s13Exercises(
                        target
                    );

                }
            );


        document.getElementById(
            "s17SaveExercise"
        )
            ?.addEventListener(
                "click",
                () => {

                    const value = {
                        ...editing,

                        id:
                            editing.id ||
                            s13Id(
                                "exercise"
                            ),

                        title:
                            document.getElementById(
                                "s17ExerciseTitle"
                            )?.value.trim() ||
                            "Ny øvelse",

                        theme:
                            document.getElementById(
                                "s17ExerciseTheme"
                            )?.value.trim() ||
                            "",

                        duration:
                            Number(
                                document.getElementById(
                                    "s17ExerciseDuration"
                                )?.value ||
                                15
                            ),

                        players:
                            document.getElementById(
                                "s17ExercisePlayers"
                            )?.value.trim() ||
                            "",

                        description:
                            document.getElementById(
                                "s17ExerciseDescription"
                            )?.value ||
                            "",

                        focusPoint:
                            document.getElementById(
                                "s17ExerciseFocus"
                            )?.value ||
                            "",

                        coaching:
                            document.getElementById(
                                "s17ExerciseCoaching"
                            )?.value ||
                            "",

                        progression:
                            document.getElementById(
                                "s17ExerciseProgression"
                            )?.value ||
                            "",

                        regression:
                            document.getElementById(
                                "s17ExerciseRegression"
                            )?.value ||
                            "",

                        folderId:
                            document.getElementById(
                                "s246ExerciseFolder"
                            )?.value ||
                            "",

                        attachments:
                            Array.isArray(
                                editing.attachments
                            )
                                ? editing.attachments
                                : []
                    };

                    const index =
                        s13Data.exercises
                            .findIndex(
                                item =>
                                    item.id ===
                                    value.id
                            );

                    if (
                        index === -1
                    ) {

                        s13Data.exercises.push(
                            value
                        );

                    } else {

                        s13Data.exercises[
                            index
                        ] =
                            value;

                    }

                    s13Exercise =
                        value.id;

                    s13Save();

                    s13Exercises(
                        target
                    );

                    visNotification?.(
                        "Øvelsen er gemt."
                    );

                }
            );


        document.getElementById(
            "s17DeleteExercise"
        )
            ?.addEventListener(
                "click",
                async () => {

                    if (
                        !editing.id ||
                        !window.confirm(
                            "Slet øvelsen?"
                        )
                    ) {
                        return;
                    }

                    for (
                        const attachment of
                        editing.attachments ||
                        []
                    ) {

                        if (
                            attachment.mediaId
                        ) {

                            try {

                                await s15DeleteBlob(
                                    attachment.mediaId
                                );

                            } catch {

                            }

                        }

                    }

                    s13Data.exercises =
                        s13Data.exercises
                            .filter(
                                item =>
                                    item.id !==
                                    editing.id
                            );

                    s13Exercise =
                        null;

                    s13Save();

                    s13Exercises(
                        target
                    );

                }
            );


        if (
            editing.id
        ) {

            const drop =
                document.getElementById(
                    "s17ExerciseDrop"
                );

            const input =
                document.getElementById(
                    "s17ExerciseFileInput"
                );

            drop?.addEventListener(
                "click",
                () =>
                    input?.click()
            );

            [
                "dragenter",
                "dragover"
            ]
                .forEach(
                    eventName => {

                        drop?.addEventListener(
                            eventName,
                            event => {

                                event.preventDefault();

                                drop.classList.add(
                                    "dragover"
                                );

                            }
                        );

                    }
                );

            [
                "dragleave",
                "drop"
            ]
                .forEach(
                    eventName => {

                        drop?.addEventListener(
                            eventName,
                            event => {

                                event.preventDefault();

                                drop.classList.remove(
                                    "dragover"
                                );

                            }
                        );

                    }
                );

            drop?.addEventListener(
                "drop",
                async event => {

                    await s17AddExerciseFiles(
                        editing,
                        [
                            ...(
                                event.dataTransfer
                                    ?.files ||
                                []
                            )
                        ]
                    );

                    s13Exercises(
                        target
                    );

                }
            );

            input?.addEventListener(
                "change",
                async event => {

                    await s17AddExerciseFiles(
                        editing,
                        [
                            ...(
                                event.target
                                    .files ||
                                []
                            )
                        ]
                    );

                    event.target.value =
                        "";

                    s13Exercises(
                        target
                    );

                }
            );


            document.getElementById(
                "s17ExerciseAddLink"
            )
                ?.addEventListener(
                    "click",
                    () => {

                        const field =
                            document.getElementById(
                                "s17ExerciseLink"
                            );

                        const url =
                            String(
                                field?.value ||
                                ""
                            )
                                .trim();

                        if (!url) {
                            return;
                        }

                        editing.attachments.push({
                            id:
                                s13Id(
                                    "exercise-link"
                                ),

                            kind:
                                "link",

                            name:
                                url,

                            url,

                            type:
                                "text/uri-list",

                            size:
                                0
                        });

                        s13Save();

                        s13Exercises(
                            target
                        );

                    }
                );


            document.querySelectorAll(
                "[data-exercise-attachment]"
            )
                .forEach(
                    row => {

                        const attachment =
                            editing.attachments
                                .find(
                                    item =>
                                        item.id ===
                                        row.dataset
                                            .exerciseAttachment
                                );

                        if (!attachment) {
                            return;
                        }

                        row.querySelector(
                            "[data-open]"
                        )
                            ?.addEventListener(
                                "click",
                                () =>
                                    s17OpenExerciseAttachment(
                                        attachment
                                    )
                            );

                        row.querySelector(
                            "[data-delete]"
                        )
                            ?.addEventListener(
                                "click",
                                async () => {

                                    if (
                                        attachment.mediaId
                                    ) {

                                        try {

                                            await s15DeleteBlob(
                                                attachment.mediaId
                                            );

                                        } catch {

                                        }

                                    }

                                    editing.attachments =
                                        editing.attachments
                                            .filter(
                                                item =>
                                                    item.id !==
                                                    attachment.id
                                            );

                                    const index =
                                        s13Data.exercises
                                            .findIndex(
                                                item =>
                                                    item.id ===
                                                    editing.id
                                            );

                                    if (
                                        index !== -1
                                    ) {

                                        s13Data.exercises[
                                            index
                                        ].attachments =
                                            editing.attachments;

                                    }

                                    s13Save();

                                    s13Exercises(
                                        target
                                    );

                                }
                            );

                    }
                );


            /*
                Indlæs preview-billede/video på venstresiden.
            */
            s13Data.exercises.forEach(
                exercise => {

                    s17LoadExerciseThumbnail(
                        exercise
                    );

                }
            );

        } else {

            s13Data.exercises.forEach(
                exercise => {

                    s17LoadExerciseThumbnail(
                        exercise
                    );

                }
            );

        }

    };


async function s17LoadExerciseThumbnail(
    exercise
) {

    const target =
        document.querySelector(
            `[data-thumb-exercise="${CSS.escape(
                exercise.id
            )}"]`
        );

    if (!target) {
        return;
    }

    if(exercise?.diagram?.frames?.[0]){
        target.innerHTML=s246ExerciseCover(exercise);
        return;
    }

    const media =
        (
            exercise.attachments ||
            []
        )
            .find(
                item =>
                    item.kind ===
                        "image" ||
                    item.kind ===
                        "video"
            );

    if (!media) {
        return;
    }

    if (
        media.kind ===
        "link"
    ) {
        return;
    }

    try {

        const stored =
            await s15GetBlob(
                media.mediaId
            );

        if (
            !stored?.blob
        ) {
            return;
        }

        const url =
            URL.createObjectURL(
                stored.blob
            );

        if (
            media.kind ===
            "image"
        ) {

            target.innerHTML = `
                <img
                    src="${url}"
                    alt=""
                >
            `;

        } else {

            target.innerHTML = `
                <video
                    src="${url}"
                    muted
                    preload="metadata"
                ></video>
            `;

        }

        setTimeout(
            () =>
                URL.revokeObjectURL(
                    url
                ),
            60000
        );

    } catch {

    }

}


/* =========================================================
   TRÆNINGSBLOKKE – VIS MERE FRA ØVELSEN
========================================================= */

function s17InjectBlockPreviews() {

    const container =
        document.getElementById(
            "s13sessionedit"
        );

    if (!container) {
        return;
    }

    container.querySelectorAll(
        "[data-b]"
    )
        .forEach(
            row => {

                row.querySelector(
                    ".s17-session-block-preview"
                )
                    ?.remove();

                const select =
                    row.querySelector(
                        '[data-f="exerciseId"]'
                    );

                const exercise =
                    s13Data.exercises.find(
                        item =>
                            item.id ===
                            select?.value
                    );

                if (!exercise) {
                    return;
                }

                const preview =
                    document.createElement(
                        "div"
                    );

                preview.className =
                    "s17-session-block-preview";

                preview.innerHTML = `

                    ${
                        exercise.description
                            ? `
                                <div>
                                    <strong>BESKRIVELSE:</strong>
                                    ${
                                        s13Esc(
                                            exercise.description
                                        )
                                    }
                                </div>
                            `
                            : ""
                    }

                    ${
                        exercise.focusPoint
                            ? `
                                <div
                                    style="
                                        margin-top:5px;
                                        color:var(--s11-primary);
                                    "
                                >
                                    <strong>FOKUS:</strong>
                                    ${
                                        s13Esc(
                                            exercise.focusPoint
                                        )
                                    }
                                </div>
                            `
                            : ""
                    }

                    ${
                        exercise.attachments
                            ?.length
                            ? `
                                <div
                                    style="margin-top:5px;"
                                >
                                    ${
                                        exercise.attachments
                                            .length
                                    } medie/link tilknyttet
                                </div>
                            `
                            : ""
                    }
                `;

                row.appendChild(
                    preview
                );

            }
        );

}


/*
    Kør preview efter session-editoren har renderet.
*/
if (
    typeof s13EditSession ===
    "function"
) {

    const s17EditSessionBefore =
        s13EditSession;

    s13EditSession =
        function (
            ...args
        ) {

            const result =
                s17EditSessionBefore(
                    ...args
                );

            setTimeout(
                s17InjectBlockPreviews,
                20
            );

            return result;

        };

}


/* =========================================================
   PDF – ØVELSESKORT MED BILLEDE / VIDEO / FOKUS
========================================================= */

async function s17ExercisePdfMedia(
    exercise
) {

    const attachments =
        Array.isArray(
            exercise.attachments
        )
            ? exercise.attachments
            : [];

    const image =
        attachments.find(
            item =>
                item.kind ===
                "image" &&
            item.mediaId
        );

    let imageHtml =
        "";

    if (image) {

        try {

            const stored =
                await s15GetBlob(
                    image.mediaId
                );

            if (
                stored?.blob
            ) {

                const dataUrl =
                    await s15ReadBlobAsDataUrl(
                        stored.blob
                    );

                imageHtml = `
                    <img
                        class="exercise-image"
                        src="${dataUrl}"
                        alt=""
                    >
                `;

            }

        } catch {

        }

    }

    const video =
        attachments.find(
            item =>
                item.kind ===
                "video"
        );

    const links =
        attachments.filter(
            item =>
                item.kind ===
                "link"
        );

    const mediaNotes = [];

    if (video) {

        mediaNotes.push(
            `Video: ${s13Esc(
                video.name
            )}`
        );

    }

    links.forEach(
        link => {

            mediaNotes.push(
                `Link: ${s13Esc(
                    link.url
                )}`
            );

        }
    );

    return {
        imageHtml,

        mediaNotesHtml:
            mediaNotes.length
                ? `
                    <div class="exercise-links">
                        ${
                            mediaNotes
                                .map(
                                    note => `
                                        <div>
                                            ${note}
                                        </div>
                                    `
                                )
                                .join(
                                    ""
                                )
                        }
                    </div>
                `
                : ""
    };

}


async function s17GenerateTrainingPdf(
    session
) {

    const meta =
        s13Meta();

    const theme =
        typeof start11V9GetActiveTheme ===
            "function"
            ? start11V9GetActiveTheme()
            : {};

    const primary =
        theme.primaryColor ||
        "#70D94A";

    const logo =
        theme.logo ||
        "";

    const blocks =
        session.blocks ||
        [];

    const exerciseCards = [];

    for (
        let index =
            0;
        index <
            blocks.length;
        index++
    ) {

        const block =
            blocks[
                index
            ];

        const exercise =
            s13Data.exercises.find(
                item =>
                    item.id ===
                    block.exerciseId
            ) ||
            {
                title:
                    block.title ||
                    "Øvelse",

                description:
                    "",

                focusPoint:
                    "",

                coaching:
                    block.note ||
                    "",

                progression:
                    "",

                regression:
                    "",

                attachments:
                    []
            };

        const media =
            await s17ExercisePdfMedia(
                exercise
            );

        exerciseCards.push(`
            <section class="exercise-card">

                <div class="exercise-head">

                    <div>
                        <div class="exercise-number">
                            ØVELSE ${index + 1}
                        </div>

                        <h2>
                            ${
                                s13Esc(
                                    exercise.title ||
                                    block.title ||
                                    "Øvelse"
                                )
                            }
                        </h2>

                        <div class="exercise-meta">
                            ${
                                s13Esc(
                                    exercise.theme ||
                                    ""
                                )
                            }
                            ${
                                exercise.players
                                    ? ` · ${s13Esc(
                                        exercise.players
                                    )}`
                                    : ""
                            }
                        </div>
                    </div>

                    <div class="exercise-duration">
                        ${
                            Number(
                                block.duration ||
                                exercise.duration ||
                                0
                            )
                        }
                        <span>MIN</span>
                    </div>

                </div>


                ${
                    media.imageHtml
                        ? `
                            <div class="exercise-media">
                                ${media.imageHtml}
                            </div>
                        `
                        : ""
                }


                ${
                    exercise.description
                        ? `
                            <div class="exercise-section">
                                <h3>BESKRIVELSE</h3>
                                <p>
                                    ${
                                        s13Esc(
                                            exercise.description
                                        )
                                    }
                                </p>
                            </div>
                        `
                        : ""
                }


                ${
                    exercise.focusPoint
                        ? `
                            <div class="focus-box">
                                <strong>FOKUSPUNKT</strong>
                                <p>
                                    ${
                                        s13Esc(
                                            exercise.focusPoint
                                        )
                                    }
                                </p>
                            </div>
                        `
                        : ""
                }


                ${
                    (
                        block.note ||
                        exercise.coaching
                    )
                        ? `
                            <div class="exercise-section">
                                <h3>COACHINGPUNKTER</h3>
                                <p>
                                    ${
                                        s13Esc(
                                            block.note ||
                                            exercise.coaching
                                        )
                                    }
                                </p>
                            </div>
                        `
                        : ""
                }


                ${
                    exercise.progression ||
                    exercise.regression
                        ? `
                            <div class="two-col">

                                <div class="exercise-section">
                                    <h3>PROGRESSION</h3>
                                    <p>
                                        ${
                                            s13Esc(
                                                exercise.progression ||
                                                "—"
                                            )
                                        }
                                    </p>
                                </div>

                                <div class="exercise-section">
                                    <h3>REGRESSION</h3>
                                    <p>
                                        ${
                                            s13Esc(
                                                exercise.regression ||
                                                "—"
                                            )
                                        }
                                    </p>
                                </div>

                            </div>
                        `
                        : ""
                }


                ${media.mediaNotesHtml}

            </section>
        `);

    }

    const printWindow =
        window.open(
            "",
            "_blank",
            "width=1100,height=850"
        );

    if (!printWindow) {

        visNotification?.(
            "Browseren blokerede PDF-vinduet. Tillad popups og prøv igen."
        );

        return;
    }

    printWindow.document.open();

    printWindow.document.write(`
<!doctype html>
<html lang="da">
<head>
<meta charset="utf-8">
<title>${s13Esc(session.title || "Træningsplan")}</title>
<style>
*{box-sizing:border-box}
body{margin:0;background:#fff;color:#111;font-family:Arial,Helvetica,sans-serif}
.page{width:210mm;min-height:297mm;margin:0 auto;padding:13mm}
header{display:flex;justify-content:space-between;align-items:center;gap:18px;padding-bottom:6mm;border-bottom:3px solid ${primary}}
.logo{width:21mm;height:21mm;object-fit:contain}
.brand{color:${primary};font-size:10px;font-weight:900;letter-spacing:1px}
h1{margin:2mm 0 1mm;font-size:24px}
.top-meta{color:#666;font-size:9px}
.summary{margin-top:7mm;padding:5mm;border:1px solid #ddd;border-radius:3mm}
.summary h2{margin:0 0 2mm;font-size:13px}
.summary p{margin:0;font-size:9.5px;line-height:1.5}
.exercise-card{margin-top:7mm;padding:5mm;border:1px solid #d8d8d8;border-radius:3mm;page-break-inside:avoid}
.exercise-head{display:flex;justify-content:space-between;align-items:flex-start;gap:8mm}
.exercise-number{color:${primary};font-size:8px;font-weight:900;letter-spacing:.6px}
.exercise-head h2{margin:1mm 0;font-size:17px}
.exercise-meta{color:#666;font-size:8.5px}
.exercise-duration{min-width:20mm;color:${primary};font-size:25px;font-weight:900;text-align:center}
.exercise-duration span{display:block;color:#666;font-size:7px}
.exercise-media{margin-top:4mm}
.exercise-image{width:100%;max-height:85mm;object-fit:contain;display:block;border:1px solid #ddd;border-radius:2mm;background:#fafafa}
.exercise-section{margin-top:4mm}
.exercise-section h3{margin:0 0 1.5mm;font-size:8px;letter-spacing:.4px;color:#666}
.exercise-section p{margin:0;font-size:9.5px;line-height:1.5;white-space:pre-wrap}
.focus-box{margin-top:4mm;padding:4mm;border-left:4px solid ${primary};background:#f5f8f5;border-radius:1.5mm}
.focus-box strong{color:${primary};font-size:8px}
.focus-box p{margin:1.5mm 0 0;font-size:10px;line-height:1.5;white-space:pre-wrap}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:5mm}
.exercise-links{margin-top:4mm;padding-top:3mm;border-top:1px solid #ddd;color:#555;font-size:8px;line-height:1.6;word-break:break-all}
@media print{
 .exercise-card{break-inside:avoid}
}
@page{size:A4 portrait;margin:0}
</style>
</head>
<body>

<section class="page">

<header>
<div>
<div class="brand">START11 · ${s13Esc(meta.clubName || "")}</div>
<h1>${s13Esc(session.title || "Træningsplan")}</h1>
<div class="top-meta">
${s13Date(session.date)}
${session.theme ? ` · ${s13Esc(session.theme)}` : ""}
${meta.teamName ? ` · ${s13Esc(meta.teamName)}` : ""}
</div>
</div>
${logo ? `<img class="logo" src="${s13Esc(logo)}">` : ""}
</header>

<div class="summary">
<h2>Træningens fokus</h2>
<p>${s13Esc(session.note || "Ingen trænernote.")}</p>
</div>

${exerciseCards.join("") || `<div class="summary"><p>Ingen øvelser tilføjet.</p></div>`}

</section>

</body>
</html>
    `);

    printWindow.document.close();

    setTimeout(
        () => {

            printWindow.focus();

            printWindow.print();

        },
        750
    );

}


/*
    Erstat V15's trænings-PDF med den nye øvelsesbaserede PDF.
*/
s15GenerateTrainingPdf =
    async function (
        session
    ) {

        return s17GenerateTrainingPdf(
            session
        );

    };


/* =========================================================
   INIT
========================================================= */

function s17Init() {

    s17EnsureExerciseData();

    s17InstallStyles();

}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        () =>
            setTimeout(
                s17Init,
                2900
            )
    );

} else {

    setTimeout(
        s17Init,
        2900
    );

}


