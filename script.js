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
        element.classList.remove('cleared');
    } else {
        historyData[dateKey] = true;
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

// INITIALIZE MODAL DISPLAY
function confirmReset() {
    document.getElementById('custom-modal').style.display = 'flex';
}

// EXIT WITHOUT CHANGES
function closeModal() {
    document.getElementById('custom-modal').style.display = 'none';
}

// EXECUTE DATA PURGE (CORE LOGIC)
function executeReset() {
    historyData = {}; 
    localStorage.removeItem('NEKO_CHRONOS_DATA');     
    renderCalendar(); 
    updateStats(); 
    closeModal();
    console.log("SYSTEM PURGE COMPLETE. TIMELINE RESET.");
}