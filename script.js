let currentDisplayDate = new Date();
let historyData = JSON.parse(localStorage.getItem('NEKO_CHRONOS_DATA')) || {};

document.addEventListener('DOMContentLoaded', () => {
    updateClock();
    setInterval(updateClock, 1000);
    renderCalendar();
    updateStats();
});

function updateClock() {
    const now = new Date();
    const clock = document.getElementById('real-time-clock');
    clock.textContent = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    const monthLabel = document.getElementById('current-month-display');
    const yearLabel = document.getElementById('current-year-display');

    grid.innerHTML = '';
    const year = currentDisplayDate.getFullYear();
    const month = currentDisplayDate.getMonth();

    monthLabel.textContent = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(currentDisplayDate).toUpperCase();
    yearLabel.textContent = year;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.classList.add('day-cell', 'empty');
        grid.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('div');
        cell.classList.add('day-cell');

        cell.innerHTML = `<span class="day-num">${day}</span><span class="cross-alt"></span>`;

        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if (historyData[dateKey]) cell.classList.add('cleared');

        if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            cell.classList.add('today');
        }

        cell.onclick = () => toggleDay(dateKey, cell);
        grid.appendChild(cell);
    }
}

function toggleDay(dateKey, element) {
    if (historyData[dateKey]) {
        delete historyData[dateKey];
        removeXP();
        element.classList.remove('cleared');
    } else {
        historyData[dateKey] = true;
        addXP();
        element.classList.add('cleared');
    }

    localStorage.setItem('NEKO_CHRONOS_DATA', JSON.stringify(historyData));
    updateStats();
}

function updateStats() {
    const year = currentDisplayDate.getFullYear();
    const month = currentDisplayDate.getMonth() + 1;
    const daysInMonth = new Date(year, month, 0).getDate();

    let monthCleared = 0;
    const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;

    let yearCleared = 0;
    const yearPrefix = `${year}-`;

    Object.keys(historyData).forEach(key => {
        if (key.startsWith(monthPrefix)) monthCleared++;
        if (key.startsWith(yearPrefix)) yearCleared++;
    });

    const monthPerc = Math.round((monthCleared / daysInMonth) * 100);
    document.getElementById('month-ratio').textContent = `${monthCleared}/${daysInMonth}`;
    document.getElementById('month-bar').style.width = `${monthPerc}%`;
    document.querySelector('.stat-box:nth-child(1) .stat-label').setAttribute('data-percent', `${monthPerc}%`);

    const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    const daysInYear = isLeap ? 366 : 365;
    const yearPerc = Math.round((yearCleared / daysInYear) * 100);
    document.getElementById('year-ratio').textContent = `${yearCleared}/${daysInYear}`;
    document.getElementById('year-bar').style.width = `${yearPerc}%`;
    document.querySelector('.stat-box:nth-child(2) .stat-label').setAttribute('data-percent', `${yearPerc}%`);

    calculateStreak();
}

function calculateStreak() {
    let streak = 0;
    let today = new Date();
    today.setHours(0, 0, 0, 0);

    let checkDate = new Date(today);

    const getBtnKey = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    let todayKey = getBtnKey(checkDate);
    if (!historyData[todayKey]) {
        checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
        let key = getBtnKey(checkDate);
        if (historyData[key]) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }

    const streakElement = document.getElementById('streak-count');
    if (streakElement) {
        streakElement.textContent = `${streak} DAYS`;

        if (streak > 0) {
            streakElement.style.color = "var(--system-blue)";
            streakElement.style.textShadow = "0 0 15px var(--system-blue)";
        } else {
            streakElement.style.color = "var(--system-red)";
            streakElement.style.textShadow = "0 0 5px var(--system-red)";
        }
    }
}

function changeMonth(offset) {
    currentDisplayDate.setMonth(currentDisplayDate.getMonth() + offset);
    renderCalendar();
    updateStats();
}

function confirmReset() {
    document.getElementById('custom-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('custom-modal').style.display = 'none';
}

function executeReset() {
    historyData = {};
    localStorage.removeItem('NEKO_CHRONOS_DATA');
    renderCalendar();
    updateStats();
    closeModal();
    console.log("SYSTEM PURGE COMPLETE. TIMELINE RESET.");
    localStorage.removeItem("NEKO_CHRONOS_LEVEL_DATA");
    currentLevel = 0;
    currentXP = 0;
    totalXP = 0;
    updateLevelDisplay();
}

// ==========================================================================
// RECALIBRATED HARDWARE PROTOCOL: 7-DAY WEEKLY ASCENSION CYCLE
// LEVEL 1 = EXACTLY 7 SUCCESSFUL MARKS
// ==========================================================================
let currentLevel = 0;
let currentXP = 0; // Stored as a clean number from 0 to 6 (representing progress items)
let totalXP = 0;

function initializeLevelSystem() {
    const savedData = localStorage.getItem('NEKO_CHRONOS_LEVEL_DATA');
    if (savedData) {
        const data = JSON.parse(savedData);
        currentLevel = data.level || 0;
        currentXP = data.xp || 0;
        totalXP = data.totalXP || 0;

        // CORRECTION BACKWARD COMPLIANCE: If loading old 10-base data, safely downscale it to 7-base
        if (currentXP > 6) {
            currentXP = Math.floor((currentXP / 100) * 7);
            if (currentXP > 6) currentXP = 0;
        }
    }
    updateLevelDisplay();
}

function updateLevelDisplay() {
    document.querySelector('.level-value').textContent = currentLevel;
    // Calculate progress percentage accurately based on 7 increments: (currentXP / 7) * 100
    const progressPercent = Math.min(100, Math.round((currentXP / 7) * 100));
    document.getElementById('level-bar').style.width = `${progressPercent}%`;
}

function addXP() {
    currentXP += 1; // Increment by 1 milestone unit out of 7
    totalXP += 1;

    if (currentXP >= 7) {
        currentXP = 0; // Reset step counter
        currentLevel += 1; // Level Up
    }

    saveLevelData();
    updateLevelDisplay();
}

function removeXP() {
    currentXP -= 1;
    totalXP -= 1;

    if (currentXP < 0 && currentLevel > 0) {
        currentLevel -= 1;
        currentXP = 6; // Revert back to peak of previous level (6/7)
    } else if (currentXP < 0) {
        currentXP = 0;
    }
    if (totalXP < 0) totalXP = 0;

    saveLevelData();
    updateLevelDisplay();
}

function saveLevelData() {
    const levelData = {
        level: currentLevel,
        xp: currentXP,
        totalXP: totalXP
    };
    localStorage.setItem('NEKO_CHRONOS_LEVEL_DATA', JSON.stringify(levelData));
}

document.addEventListener('DOMContentLoaded', function () {
    initializeLevelSystem();
});