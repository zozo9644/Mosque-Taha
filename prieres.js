// ==========================================
// MOSQUE TAHA - PRAYER PAGE
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


        // Casablanca
        const latitude = 33.5731;
        const longitude = -7.5898;


        const url =
            `https://api.aladhan.com/v1/timings/${day}-${month}-${year}` +
            `?latitude=${latitude}` +
            `&longitude=${longitude}` +
            `&method=21` +
            `&school=0` +
            `&midnightMode=0` +
            `&latitudeAdjustmentMethod=1` +
            `&iso8601=false`;


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
        // PRAYER TIMES
        // ==========================================

        document.getElementById("Fajr").textContent =
            cleanTime(prayerTimes.Fajr);

        document.getElementById("Dhuhr").textContent =
            cleanTime(prayerTimes.Dhuhr);

        document.getElementById("Asr").textContent =
            cleanTime(prayerTimes.Asr);

        document.getElementById("Maghrib").textContent =
            cleanTime(prayerTimes.Maghrib);

        document.getElementById("Isha").textContent =
            cleanTime(prayerTimes.Isha);


        // ==========================================
        // DATES
        // ==========================================

        document.getElementById(
            "gregorianDate"
        ).textContent =
            data.data.date.readable;


        const hijri =
            data.data.date.hijri;


        document.getElementById(
            "hijriDate"
        ).textContent =
            `${hijri.day} ${hijri.month.ar} ${hijri.year} هـ`;


        // ==========================================
        // HIZB
        // ==========================================

        const hijriDay =
            Number(hijri.day);


        const hizbSbah =
            (hijriDay * 2) - 1;


        const hizbMassae =
            hijriDay * 2;


        document.getElementById(
            "hizbSbah"
        ).textContent =
            `حزب ${hizbSbah}`;


        document.getElementById(
            "hizbMassae"
        ).textContent =
            `حزب ${hizbMassae}`;


        // ==========================================
        // NEXT PRAYER
        // ==========================================

        updateNextPrayer();


    } catch (error) {

        console.error(
            "Erreur:",
            error
        );

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


    let nextPrayer = null;
    let nextTime = null;


    for (const prayer of prayers) {

        const time =
            cleanTime(
                prayerTimes[prayer.key]
            );


        const [hours, minutes] =
            time.split(":").map(Number);


        const prayerDate =
            new Date();


        prayerDate.setHours(
            hours,
            minutes,
            0,
            0
        );


        if (prayerDate > now) {

            nextPrayer = prayer;

            nextTime = prayerDate;

            break;

        }

    }


    // ==========================================
    // FAJR TOMORROW
    // ==========================================

    if (!nextPrayer) {

        nextPrayer = prayers[0];


        const time =
            cleanTime(
                prayerTimes.Fajr
            );


        const [hours, minutes] =
            time.split(":").map(Number);


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
    // DISPLAY
    // ==========================================

    document.getElementById(
        "nextPrayerName"
    ).textContent =
        nextPrayer.name;


    // ==========================================
    // HIGHLIGHT
    // ==========================================

    document
        .querySelectorAll(".prayer-card")
        .forEach(card => {

            card.classList.remove(
                "next"
            );

        });


    const card =
        document.querySelector(
            `.prayer-card[data-prayer="${nextPrayer.key}"]`
        );


    if (card) {

        card.classList.add(
            "next"
        );

    }


    startCountdown(
        nextTime
    );

}


// ==========================================
// COUNTDOWN
// ==========================================

function startCountdown(targetTime) {

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


        if (difference <= 0) {

            clearInterval(
                countdownInterval
            );


            getPrayerTimes();

            return;

        }


        const hours =
            Math.floor(
                difference / 3600000
            );


        const minutes =
            Math.floor(
                (difference % 3600000) / 60000
            );


        const seconds =
            Math.floor(
                (difference % 60000) / 1000
            );


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
