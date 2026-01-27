// --- INITIALIZATION ---
let currentDisplayDate = new Date();
// DATA STRUCTURE: { "YYYY-MM-DD": true/false }
let historyData = JSON.parse(localStorage.getItem('NEKO_CHRONOS_DATA')) || {};

// --- CORE BOOT SEQUENCE ---
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

    // 1. Create Padding Cells for previous month
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.classList.add('day-cell', 'empty');
        grid.appendChild(empty);
    }

    // 2. Build Month Days
    // Locate the day loop in your renderCalendar function
for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement('div');
    cell.classList.add('day-cell');
    
    // Updated: Wrapping the day in a span for layering
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

// --- INTERACTION LOGIC ---
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

// --- RATIO & PROGRESS CALCULATION ---
function updateStats() {
    const year = currentDisplayDate.getFullYear();
    const month = currentDisplayDate.getMonth() + 1;
    const daysInMonth = new Date(year, month, 0).getDate();
    
    // Monthly Calculation (e.g., 28/31)
    let monthCleared = 0;
    const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
    
    // Yearly Calculation (e.g., 28/365)
    let yearCleared = 0;
    const yearPrefix = `${year}-`;

    Object.keys(historyData).forEach(key => {
        if (key.startsWith(monthPrefix)) monthCleared++;
        if (key.startsWith(yearPrefix)) yearCleared++;
    });

    // Update UI Elements
    document.getElementById('month-ratio').textContent = `${monthCleared}/${daysInMonth}`;
    document.getElementById('month-bar').style.width = `${(monthCleared / daysInMonth) * 100}%`;
    
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    const daysInYear = isLeap ? 366 : 365;
    document.getElementById('year-ratio').textContent = `${yearCleared}/${daysInYear}`;
    document.getElementById('year-bar').style.width = `${(yearCleared / daysInYear) * 100}%`;

    // Calculate Streak
    calculateStreak();
}

function calculateStreak() {
    let streak = 0;
    let checkDate = new Date();
    
    while (true) {
        const key = checkDate.toISOString().split('T')[0];
        if (historyData[key]) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }
    document.getElementById('streak-count').textContent = `${streak} DAYS`;
}

// --- NAVIGATION MODULE ---
function changeMonth(offset) {
    currentDisplayDate.setMonth(currentDisplayDate.getMonth() + offset);
    renderCalendar();
    updateStats();
}

// --- DESTRUCTIVE RESET ---
function confirmReset() {
    if (confirm("SYSTEM WARNING: THIS WILL ERASE YOUR 2026 TIMELINE. PROCEED?")) {
        historyData = {};
        localStorage.removeItem('NEKO_CHRONOS_DATA');
        renderCalendar();
        updateStats();
    }
}