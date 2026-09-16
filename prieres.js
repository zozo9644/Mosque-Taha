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

const latitude = 33.5731;
const longitude = -7.5898;

const CACHE_KEY = "mosqueeTahaPrayerTimes30";

let prayerTimes = {};
let countdownInterval = null;


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(date) {

    const day =
        String(date.getDate()).padStart(2, "0");

    const month =
        String(date.getMonth() + 1).padStart(2, "0");

    const year =
        date.getFullYear();

    return `${day}-${month}-${year}`;
}


// ==========================================
// GET 30 DAYS
// ==========================================

async function load30Days() {

    try {

        const now = new Date();

        const year =
            now.getFullYear();

        const month =
            now.getMonth() + 1;


        // الشهر الحالي
        const url =
            `https://api.aladhan.com/v1/calendar/${year}/${month}` +
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


        let days =
            data.data;


        // ==========================================
        // الشهر الموالي
        // ==========================================

        const nextMonthDate =
            new Date(
                year,
                now.getMonth() + 1,
                1
            );


        const nextMonth =
            nextMonthDate.getMonth() + 1;

        const nextYear =
            nextMonthDate.getFullYear();


        const nextUrl =
            `https://api.aladhan.com/v1/calendar/${nextYear}/${nextMonth}` +
            `?latitude=${latitude}` +
            `&longitude=${longitude}` +
            `&method=21` +
            `&school=0` +
            `&midnightMode=0` +
            `&latitudeAdjustmentMethod=1` +
            `&iso8601=false`;


        const nextResponse =
            await fetch(nextUrl);


        if (nextResponse.ok) {

            const nextData =
                await nextResponse.json();


            if (nextData.code === 200) {

                days = [
                    ...days,
                    ...nextData.data
                ];

            }

        }


        // ==========================================
        // ناخدو 30 يوم ابتداءً من اليوم
        // ==========================================

        const today =
            new Date();

        today.setHours(
            0,
            0,
            0,
            0
        );


        const futureDays =
            days
                .filter(day => {

                    const [
                        dayNumber,
                        monthNumber,
                        yearNumber
                    ] =
                        day.date.gregorian.date
                            .split("-")
                            .map(Number);


                    const date =
                        new Date(
                            yearNumber,
                            monthNumber - 1,
                            dayNumber
                        );


                    return date >= today;

                })
                .slice(0, 30);


        // ==========================================
        // SAVE CACHE
        // ==========================================

        localStorage.setItem(
            CACHE_KEY,
            JSON.stringify(futureDays)
        );


        console.log(
            "تم حفظ مواقيت 30 يوم القادمة ✅"
        );


        return futureDays;


    } catch (error) {

        console.error(
            "خطأ في تحميل 30 يوم:",
            error
        );

        return null;

    }

}


// ==========================================
// GET SAVED DATA
// ==========================================

function getCachedDays() {

    const saved =
        localStorage.getItem(
            CACHE_KEY
        );


    if (!saved) {

        return null;

    }


    try {

        return JSON.parse(saved);

    } catch (error) {

        console.error(
            "Cache error:",
            error
        );

        return null;

    }

}


// ==========================================
// GET TODAY
// ==========================================

function getTodayData(days) {

    if (!days || !days.length) {

        return null;

    }


    const today =
        formatDate(
            new Date()
        );


    return days.find(day => {

        return day.date.gregorian.date === today;

    }) || days[0];

}


// ==========================================
// DISPLAY DATA
// ==========================================

function displayPrayerData(dayData) {

    if (!dayData) {

        return;

    }


    prayerTimes =
        dayData.timings;


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
    // GREGORIAN DATE
    // ==========================================

    document.getElementById(
        "gregorianDate"
    ).textContent =
        dayData.date.readable;


    // ==========================================
    // HIJRI DATE
    // ==========================================

    const hijri =
        dayData.date.hijri;


    document.getElementById(
        "hijriDate"
    ).textContent =
        `${hijri.day} ${hijri.month.ar} ${hijri.year} هـ`;


    // ==========================================
    // HIZB SABAH / MASSAE
    // ==========================================

    const hijriDay =
        Number(hijri.day);


    const hizbSbah =
        (hijriDay * 2) - 1;


    const hizbMassae =
        hijriDay * 2;


    const hizbSbahElement =
        document.getElementById(
            "hizbSbah"
        );


    const hizbMassaeElement =
        document.getElementById(
            "hizbMassae"
        );


    if (hizbSbahElement) {

        hizbSbahElement.textContent =
            `حزب ${hizbSbah}`;

    }


    if (hizbMassaeElement) {

        hizbMassaeElement.textContent =
            `حزب ${hizbMassae}`;

    }


    // ==========================================
    // HIZB JOMOA
    // ==========================================

    getHizbJomoa();


    // ==========================================
    // NEXT PRAYER
    // ==========================================

    updateNextPrayer();

}


// ==========================================
// HIZB JOMOA
// ==========================================

function getHizbJomoa() {

    const element =
        document.getElementById(
            "hizbJomoa"
        );


    // إلا ما كانش العنصر فالصفحة
    if (!element) {

        return;

    }


    const today =
        new Date();


    // الجمعة 11 شتنبر 2026 = حزب 7
    const referenceFriday =
        new Date(
            2026,
            8,
            11
        );


    const referenceHizb =
        8;


    const difference =
        today.getTime() -
        referenceFriday.getTime();


    const daysDifference =
        Math.floor(
            difference /
            (1000 * 60 * 60 * 24)
        );


    const weeks =
        Math.floor(
            daysDifference / 7
        );


    let hizb =
        referenceHizb + weeks;


    // الدوران من 60 إلى 1
    hizb =
        ((hizb - 1) % 60) + 1;


    element.textContent =
        `حزب ${hizb}`;

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
    // FAJR TOMORROW
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
    // HIGHLIGHT
    // ==========================================

    document
        .querySelectorAll(
            ".prayer-card"
        )
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


            initializePrayerTimes();

            return;

        }


        const hours =
            Math.floor(
                difference / 3600000
            );


        const minutes =
            Math.floor(
                (difference % 3600000) /
                60000
            );


        const seconds =
            Math.floor(
                (difference % 60000) /
                1000
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
// INITIALIZE
// ==========================================

async function initializePrayerTimes() {

    let days =
        getCachedDays();


    // ==========================================
    // ONLINE
    // ==========================================

    if (navigator.onLine) {

        const freshDays =
            await load30Days();


        if (freshDays) {

            days =
                freshDays;

        }

    }


    // ==========================================
    // OFFLINE
    // ==========================================

    if (!days) {

        console.log(
            "لا توجد بيانات محفوظة للعمل Offline."
        );

        return;

    }


    const todayData =
        getTodayData(days);


    displayPrayerData(
        todayData
    );

}


// ==========================================
// START
// ==========================================

initializePrayerTimes();


// ==========================================
// UPDATE EVERY 6 HOURS
// ==========================================

setInterval(
    initializePrayerTimes,
    6 * 60 * 60 * 1000
);