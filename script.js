// ==========================================
// MOSQUE TAHA - PRAYER TIMES CASABLANCA
// ==========================================

const prayers = [
    { name: "الفجر", key: "Fajr" },
    { name: "الظهر", key: "Dhuhr" },
    { name: "العصر", key: "Asr" },
    { name: "المغرب", key: "Maghrib" },
    { name: "العشاء", key: "Isha" }
];

let prayerTimes = {};
let countdownInterval = null;


// ==========================================
// GET PRAYER TIMES
// ==========================================

async function getPrayerTimes() {

    try {

        const now = new Date();

        const day =
            String(now.getDate()).padStart(2, "0");

        const month =
            String(now.getMonth() + 1).padStart(2, "0");

        const year =
            now.getFullYear();


        // ==========================================
        // CASABLANCA
        // ==========================================

        const latitude = 33.5731;
        const longitude = -7.5898;


        // ==========================================
        // ALADHAN API
        // ==========================================

        const url =
            `https://api.aladhan.com/v1/timings/${day}-${month}-${year}` +
            `?latitude=${latitude}` +
            `&longitude=${longitude}` +
            `&method=21` +
            `&school=0` +
            `&midnightMode=0` +
            `&latitudeAdjustmentMethod=1` +
            `&iso8601=false`;


        console.log(
            "Prayer API:",
            url
        );


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "API Error: " + response.status
            );

        }


        const data =
            await response.json();


        if (data.code !== 200) {

            throw new Error(
                "AlAdhan API Error"
            );

        }


        prayerTimes =
            data.data.timings;


        // ==========================================
        // DISPLAY PRAYER TIMES
        // ==========================================

        document.getElementById(
            "Fajr"
        ).textContent =
            cleanTime(prayerTimes.Fajr);


        document.getElementById(
            "Dhuhr"
        ).textContent =
            cleanTime(prayerTimes.Dhuhr);


        document.getElementById(
            "Asr"
        ).textContent =
            cleanTime(prayerTimes.Asr);


        document.getElementById(
            "Maghrib"
        ).textContent =
            cleanTime(prayerTimes.Maghrib);


        document.getElementById(
            "Isha"
        ).textContent =
            cleanTime(prayerTimes.Isha);


        // ==========================================
        // GREGORIAN DATE
        // ==========================================

        document.getElementById(
            "date"
        ).textContent =
            data.data.date.readable;


        // ==========================================
        // HIJRI DATE
        // ==========================================

        const hijri =
            data.data.date.hijri;


        // اليوم الهجري اللي رجعاتو API
        const apiHijriDay =
            Number(hijri.day);


        // ==========================================
        // ننقصو يوم واحد
        // ==========================================

        let hijriDay =
            apiHijriDay - 1;


        // ==========================================
        // حماية من 0
        // ==========================================

        if (hijriDay < 1) {

            hijriDay = 1;

        }


        // ==========================================
        // DEBUG
        // ==========================================

        console.log(
            "Hijri day from API:",
            apiHijriDay
        );


        console.log(
            "Hijri day corrected:",
            hijriDay
        );


        // ==========================================
        // DISPLAY HIJRI DATE
        // ==========================================

        document.getElementById(
            "hijriDate"
        ).textContent =
            `${hijriDay} ${hijri.month.ar} ${hijri.year} هـ`;


        // ==========================================
        // HIZB SABAH
        // ==========================================

        const hizbSbah =
            (hijriDay * 2) - 1;


        // ==========================================
        // HIZB MASSAE
        // ==========================================

        const hizbMassae =
            hijriDay * 2;


        // ==========================================
        // DISPLAY HIZB SABAH
        // ==========================================

        const hizbSbahElement =
            document.getElementById(
                "hizbSbah"
            );


        if (hizbSbahElement) {

            hizbSbahElement.textContent =
                `حزب ${hizbSbah}`;

        }


        // ==========================================
        // DISPLAY HIZB MASSAE
        // ==========================================

        const hizbMassaeElement =
            document.getElementById(
                "hizbMassae"
            );


        if (hizbMassaeElement) {

            hizbMassaeElement.textContent =
                `حزب ${hizbMassae}`;

        }


        // ==========================================
        // NEXT PRAYER
        // ==========================================

        updateNextPrayer();


    } catch (error) {

        console.error(
            "Erreur:",
            error
        );


        document.getElementById(
            "date"
        ).textContent =
            "Impossible de charger les horaires";


        document.getElementById(
            "hijriDate"
        ).textContent =
            "";


        document.getElementById(
            "nextPrayerName"
        ).textContent =
            "--";


        document.getElementById(
            "countdown"
        ).textContent =
            "--:--:--";

    }

}


// ==========================================
// CLEAN TIME
// ==========================================

function cleanTime(time) {

    if (!time) {

        return "--:--";

    }


    return time.split(" ")[0];

}


// ==========================================
// NEXT PRAYER
// ==========================================

function updateNextPrayer() {

    if (!prayerTimes.Fajr) {

        return;

    }


    const now =
        new Date();


    let nextPrayer =
        null;


    let nextTime =
        null;


    // ==========================================
    // CHERCHER LA PROCHAINE PRIÈRE
    // ==========================================

    for (const prayer of prayers) {

        const time =
            cleanTime(
                prayerTimes[
                    prayer.key
                ]
            );


        const [
            hours,
            minutes
        ] =
            time
                .split(":")
                .map(Number);


        const prayerDate =
            new Date();


        prayerDate.setHours(
            hours,
            minutes,
            0,
            0
        );


        if (prayerDate > now) {

            nextPrayer =
                prayer;


            nextTime =
                prayerDate;


            break;

        }

    }


    // ==========================================
    // FAJR DEMAIN
    // ==========================================

    if (!nextPrayer) {

        nextPrayer =
            prayers[0];


        const time =
            cleanTime(
                prayerTimes.Fajr
            );


        const [
            hours,
            minutes
        ] =
            time
                .split(":")
                .map(Number);


        nextTime =
            new Date();


        nextTime.setDate(
            nextTime.getDate() + 1
        );


        nextTime.setHours(
            hours,
            minutes,
            0,
            0
        );

    }


    // ==========================================
    // DISPLAY NEXT PRAYER
    // ==========================================

    document.getElementById(
        "nextPrayerName"
    ).textContent =
        nextPrayer.name;


    // ==========================================
    // REMOVE OLD HIGHLIGHT
    // ==========================================

    document.querySelectorAll(
        ".prayer-card"
    ).forEach(card => {

        card.classList.remove(
            "next"
        );

    });


    // ==========================================
    // HIGHLIGHT NEXT PRAYER
    // ==========================================

    const card =
        document.querySelector(
            `.prayer-card[data-prayer="${nextPrayer.key}"]`
        );


    if (card) {

        card.classList.add(
            "next"
        );

    }


    // ==========================================
    // START COUNTDOWN
    // ==========================================

    startCountdown(
        nextTime
    );

}


// ==========================================
// COUNTDOWN
// ==========================================

function startCountdown(targetTime) {

    // حذف الـtimer القديم
    if (countdownInterval) {

        clearInterval(
            countdownInterval
        );

    }


    function updateCountdown() {

        const now =
            new Date();


        const difference =
            targetTime.getTime() -
            now.getTime();


        // ==========================================
        // PRAYER TIME REACHED
        // ==========================================

        if (difference <= 0) {

            clearInterval(
                countdownInterval
            );


            getPrayerTimes();


            return;

        }


        // ==========================================
        // HOURS
        // ==========================================

        const hours =
            Math.floor(
                difference / 3600000
            );


        // ==========================================
        // MINUTES
        // ==========================================

        const minutes =
            Math.floor(
                (difference % 3600000) /
                60000
            );


        // ==========================================
        // SECONDS
        // ==========================================

        const seconds =
            Math.floor(
                (difference % 60000) /
                1000
            );


        // ==========================================
        // DISPLAY COUNTDOWN
        // ==========================================

        document.getElementById(
            "countdown"
        ).textContent =

            `${String(hours).padStart(2, "0")}:` +
            `${String(minutes).padStart(2, "0")}:` +
            `${String(seconds).padStart(2, "0")}`;

    }


    updateCountdown();


    countdownInterval =
        setInterval(
            updateCountdown,
            1000
        );

}


// ==========================================
// START
// ==========================================

getPrayerTimes();


// ==========================================
// UPDATE EVERY HOUR
// ==========================================

setInterval(
    getPrayerTimes,
    60 * 60 * 1000
);
