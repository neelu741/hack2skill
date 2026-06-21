// EcoSphere Core Application Javascript

// Custom adjusted constants for carbon calculations (kg CO2e)
const CO2_FACTORS = {
    car: 0.395,        // per mile
    transit: 0.12,     // per mile
    beef: 6.2,         // per meal
    vegetarian: 0.45,  // per meal
    electricity: 0.36, // per kWh
    waste: 1.6         // per trash bag
};

// Initial state fallback if localStorage is empty (adjusted seed data)
const INITIAL_LOGS = [
    { date: '2026-06-15', car: 22, transit: 8, beef: 1, vegetarian: 1, electricity: 11, waste: 1, total: 20.85, breakdown: { transport: 9.65, food: 6.65, energy: 3.96, waste: 1.6 } },
    { date: '2026-06-16', car: 8, transit: 12, beef: 0, vegetarian: 2, electricity: 9, waste: 0, total: 8.74, breakdown: { transport: 4.6, food: 0.9, energy: 3.24, waste: 0.0 } },
    { date: '2026-06-17', car: 28, transit: 0, beef: 2, vegetarian: 0, electricity: 13, waste: 2, total: 29.54, breakdown: { transport: 11.06, food: 12.4, energy: 4.68, waste: 3.2 } },
    { date: '2026-06-18', car: 0, transit: 18, beef: 0, vegetarian: 3, electricity: 8, waste: 1, total: 7.99, breakdown: { transport: 2.16, food: 1.35, energy: 2.88, waste: 1.6 } },
    { date: '2026-06-19', car: 12, transit: 4, beef: 1, vegetarian: 2, electricity: 10, waste: 0, total: 15.35, breakdown: { transport: 5.22, food: 7.1, energy: 3.6, waste: 0.0 } },
    { date: '2026-06-20', car: 4, transit: 22, beef: 0, vegetarian: 2, electricity: 9, waste: 1, total: 10.36, breakdown: { transport: 4.22, food: 0.9, energy: 3.24, waste: 1.6 } },
    { date: '2026-06-21', car: 10, transit: 8, beef: 1, vegetarian: 1, electricity: 9, waste: 1, total: 12.21, breakdown: { transport: 4.91, food: 6.65, energy: 3.24, waste: 1.6 } }
];

const AVAILABLE_ACTIONS = [
    { id: 'ev_car', title: 'Transition to Electric Mobility', desc: 'Swap combustion engine travel for electric vehicle commuting or green public fleets.', impact: 3300, category: 'transport', icon: 'zap' },
    { id: 'bike_commute', title: 'Pedal-Powered Commutes', desc: 'Replace short vehicular commutes with active cycling or walking routes.', impact: 900, category: 'transport', icon: 'bike' },
    { id: 'vegetarian_diet', title: 'Green Plate Lifestyle', desc: 'Opt out of resource-heavy meat dishes and eat plant-derived foods.', impact: 1500, category: 'food', icon: 'leaf' },
    { id: 'led_lights', title: 'Smart LED Retrofitting', desc: 'Upgrade household fixtures to energy-efficient smart LED bulbs.', impact: 320, category: 'energy', icon: 'lightbulb' },
    { id: 'solar_panels', title: 'Rooftop Solar Harvesting', desc: 'Install localized solar modules to generate emission-free electricity.', impact: 2900, category: 'energy', icon: 'sun' },
    { id: 'compost_waste', title: 'Zero-Waste Composting', desc: 'Properly segregate recyclables and compost organic waste to reduce landfills.', impact: 480, category: 'waste', icon: 'trash-2' }
];

const BADGES_LIST = [
    { id: 'badge_commute', title: 'Eco Rider', desc: 'Logged an active day with zero personal car usage.', criteria: '0 car miles in a log', unlocked: true, icon: 'bike' },
    { id: 'badge_green_chef', title: 'Herbivore Hero', desc: 'Logged a day consuming purely vegetarian and vegan meals.', criteria: 'No beef meals logged', unlocked: true, icon: 'utensils-crossed' },
    { id: 'badge_energy_saver', title: 'Watt Saver', desc: 'Kept residential electricity draw under 5 kWh.', criteria: 'Electricity < 5 kWh', unlocked: false, icon: 'zap-off' },
    { id: 'badge_zero_waste', title: 'Circular Champion', desc: 'Logged a zero-waste day without any discarded waste bags.', criteria: '0 trash bags logged', unlocked: false, icon: 'shield-check' }
];

// App State
let state = {
    logs: JSON.parse(localStorage.getItem('ecosphere_logs')) || INITIAL_LOGS,
    streak: parseInt(localStorage.getItem('ecosphere_streak')) || 3,
    committedActions: JSON.parse(localStorage.getItem('ecosphere_committed')) || [],
    badges: JSON.parse(localStorage.getItem('ecosphere_badges')) || BADGES_LIST
};

// Global Chart References
let breakdownChart = null;
let trendChart = null;

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initDashboard();
    initSimulator();
    initSandbox();
    initAchievements();
    initLoggerModal();
    lucide.createIcons();
});

// Save state helper
function saveState() {
    localStorage.setItem('ecosphere_logs', JSON.stringify(state.logs));
    localStorage.setItem('ecosphere_streak', state.streak.toString());
    localStorage.setItem('ecosphere_committed', JSON.stringify(state.committedActions));
    localStorage.setItem('ecosphere_badges', JSON.stringify(state.badges));
}

// 1. Navigation handling
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetTab = item.getAttribute('data-tab');
            
            navItems.forEach(nav => nav.classList.remove('active'));
            tabContents.forEach(tab => tab.classList.remove('active'));
            
            item.classList.add('active');
            
            const targetEl = document.getElementById(targetTab);
            targetEl.classList.add('active');

            // Force charts re-render if switching to dashboard
            if (targetTab === 'dashboard') {
                renderCharts();
            }
        });
    });

    // Update streak indicators
    document.getElementById('nav-streak').textContent = `${state.streak} Days`;
}

// 2. Dashboard Logic
function initDashboard() {
    // Trend timeline options
    const rangeButtons = document.querySelectorAll('.trend-tab');
    rangeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            rangeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateTrendChart(parseInt(btn.getAttribute('data-range')));
        });
    });

    renderDashboardData();
}

function renderDashboardData() {
    const todayLog = state.logs[state.logs.length - 1];
    
    // Set score indicator circle
    const scoreVal = todayLog.total.toFixed(1);
    document.getElementById('current-score').textContent = scoreVal;
    
    const circle = document.querySelector('.progress-ring__circle');
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    
    // Set ring fill percentage (Max daily average baseline is 25 kg)
    const percentage = Math.min(100, (todayLog.total / 25) * 100);
    const offset = circumference - (percentage / 100) * circumference;
    circle.style.strokeDashoffset = offset;

    // Change gradient & score text color/state
    const statusEl = document.getElementById('score-status');
    if (todayLog.total < 12) {
        statusEl.textContent = 'Excellent (Very Low)';
        statusEl.className = 'status-indicator low';
        circle.style.stroke = 'var(--emerald)';
    } else if (todayLog.total <= 20) {
        statusEl.textContent = 'Moderate (Avg)';
        statusEl.className = 'status-indicator medium';
        circle.style.stroke = 'var(--cyan)';
    } else {
        statusEl.textContent = 'High (Above Avg)';
        statusEl.className = 'status-indicator high';
        circle.style.stroke = 'var(--red)';
    }

    // Monthly Allowance progress estimation (e.g. sum last 30 logs or simulate)
    const totalMonthUsage = state.logs.reduce((sum, log) => sum + log.total, 0);
    const monthlyBudget = 400; // kg CO2 budget
    const budgetPct = Math.min(100, Math.round((totalMonthUsage / monthlyBudget) * 100));
    
    document.getElementById('budget-percentage').textContent = `${budgetPct}%`;
    document.getElementById('budget-bar').style.width = `${budgetPct}%`;
    document.getElementById('budget-used').textContent = `${Math.round(totalMonthUsage)} kg`;
    document.getElementById('budget-total').textContent = `${monthlyBudget} kg budget`;

    // Calculate Virtual Trees Saved (1 Tree = 22kg CO2e offset per year)
    let totalSavings = 0;
    const activeActions = AVAILABLE_ACTIONS.filter(act => state.committedActions.includes(act.id));
    activeActions.forEach(action => {
        totalSavings += action.impact;
    });
    const treesSaved = (totalSavings / 22).toFixed(1);
    const offsetTreesEl = document.getElementById('offset-trees');
    if (offsetTreesEl) {
        offsetTreesEl.textContent = treesSaved;
    }

    renderInsights(todayLog);
    renderCharts();
}

function renderInsights(todayLog) {
    const insightList = document.getElementById('dashboard-insights');
    insightList.innerHTML = '';

    // Find highest category
    const categories = todayLog.breakdown;
    let highestCat = 'transport';
    let maxEmissions = categories.transport;
    
    for (const [key, val] of Object.entries(categories)) {
        if (val > maxEmissions) {
            maxEmissions = val;
            highestCat = key;
        }
    }

    const tips = {
        transport: {
            title: 'Optimize Transit Impact',
            desc: `Transportation is your highest contributor at ${categories.transport.toFixed(1)} kg. Swapping drives for biking or combining errands can drastically cut this.`,
            isDanger: true,
            icon: 'bus'
        },
        food: {
            title: 'Adopt Plant-based Alternates',
            desc: `Food emissions represent ${categories.food.toFixed(1)} kg. Cutting red meat from just one meal a day saves over 5 kg of CO2e.`,
            isDanger: true,
            icon: 'utensils'
        },
        energy: {
            title: 'Grid Power Conservation',
            desc: `Home power accounted for ${categories.energy.toFixed(1)} kg. Unplug standby electronics or adjust thermostat values.`,
            isDanger: true,
            icon: 'zap'
        },
        waste: {
            title: 'Minimize Solid Waste',
            desc: `Your trash generated ${categories.waste.toFixed(1)} kg. Composting leftover organic materials eliminates methane landfills.`,
            isDanger: true,
            icon: 'trash-2'
        }
    };

    // If total score is incredibly low, show green success insight
    if (todayLog.total < 10) {
        insightList.innerHTML = `
            <div class="insight-item">
                <div class="insight-icon-container success">
                    <i data-lucide="award"></i>
                </div>
                <div class="insight-item-body">
                    <h4>Super Eco Warrior Day!</h4>
                    <p>Incredible job today. Your total footprint is well within the sustainable Paris Agreement model path.</p>
                </div>
            </div>
        `;
    } else {
        const primaryTip = tips[highestCat];
        insightList.innerHTML = `
            <div class="insight-item">
                <div class="insight-icon-container danger">
                    <i data-lucide="${primaryTip.icon}"></i>
                </div>
                <div class="insight-item-body">
                    <h4>${primaryTip.title}</h4>
                    <p>${primaryTip.desc}</p>
                </div>
            </div>
            <div class="insight-item">
                <div class="insight-icon-container success">
                    <i data-lucide="shield-check"></i>
                </div>
                <div class="insight-item-body">
                    <h4>Quick Win Checklist</h4>
                    <p>Check the Action Sandbox to commit to permanent savings goals and earn badges.</p>
                </div>
            </div>
        `;
    }
    
    lucide.createIcons();
}

function renderCharts() {
    const todayLog = state.logs[state.logs.length - 1];
    
    // 1. Doughnut Chart Initialization
    const breakdownCtx = document.getElementById('breakdownChart').getContext('2d');
    if (breakdownChart) breakdownChart.destroy();
    
    breakdownChart = new Chart(breakdownCtx, {
        type: 'doughnut',
        data: {
            labels: ['Transport', 'Diet/Food', 'Energy', 'Waste'],
            datasets: [{
                data: [
                    todayLog.breakdown.transport,
                    todayLog.breakdown.food,
                    todayLog.breakdown.energy,
                    todayLog.breakdown.waste
                ],
                backgroundColor: ['#06b6d4', '#10b981', '#f97316', '#8b5cf6'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#94a3b8', font: { family: 'Outfit', size: 12 } }
                }
            },
            cutout: '70%'
        }
    });

    // 2. Trend Chart (last 7 days default)
    updateTrendChart(7);
}

function updateTrendChart(days) {
    const trendCtx = document.getElementById('trendChart').getContext('2d');
    if (trendChart) trendChart.destroy();

    const chartLogs = state.logs.slice(-days);
    const labels = chartLogs.map(log => {
        const parts = log.date.split('-');
        return `${parts[1]}/${parts[2]}`;
    });
    const dataPoints = chartLogs.map(log => log.total);

    trendChart = new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Daily Footprint (kg CO₂e)',
                data: dataPoints,
                borderColor: '#06b6d4',
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#94a3b8', font: { family: 'Outfit' } }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8', font: { family: 'Outfit' } }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// 3. Simulator Logic
function initSimulator() {
    const inputs = ['driving', 'flights', 'clean-energy', 'meat', 'waste'];
    
    inputs.forEach(id => {
        const slider = document.getElementById(`sim-${id}`);
        slider.addEventListener('input', () => {
            updateSimulatorOutputs();
        });
    });

    updateSimulatorOutputs();
}

function updateSimulatorOutputs() {
    const driving = parseFloat(document.getElementById('sim-driving').value);
    const flights = parseFloat(document.getElementById('sim-flights').value);
    const cleanEnergy = parseFloat(document.getElementById('sim-clean-energy').value);
    const meat = parseFloat(document.getElementById('sim-meat').value);
    const waste = parseFloat(document.getElementById('sim-waste').value);

    // Update Slider text label display values
    document.getElementById('val-driving').textContent = `${driving} miles/week`;
    document.getElementById('val-flights').textContent = `${flights} hours/year`;
    document.getElementById('val-clean-energy').textContent = `${cleanEnergy}%`;
    document.getElementById('val-meat').textContent = `${meat} meals/week`;
    document.getElementById('val-waste').textContent = `${waste} bags/week`;

    // Calculations (outputs in Tons CO2e per year)
    const drivingAnnual = (driving * 52 * CO2_FACTORS.car) / 1000;
    const flightsAnnual = (flights * 90) / 1000; // 90 kg CO2 per flight hour avg
    const cleanEnergyFactor = (1 - (cleanEnergy / 100)) * 2500; // Base household energy usage (2500 kg CO2 avg)
    const energyAnnual = cleanEnergyFactor / 1000;
    const meatAnnual = (meat * 52 * CO2_FACTORS.beef) / 1000;
    const wasteAnnual = (waste * 52 * CO2_FACTORS.waste) / 1000;

    const totalAnnual = (drivingAnnual + flightsAnnual + energyAnnual + meatAnnual + wasteAnnual).toFixed(1);
    
    // Set UI outputs
    document.getElementById('sim-total-co2').textContent = totalAnnual;

    // Set comparison bar width
    // Max width represented by US avg (16.0 tons)
    const pctYou = Math.min(100, (parseFloat(totalAnnual) / 16) * 100);
    document.getElementById('sim-bar-you').style.width = `${pctYou}%`;
    document.getElementById('sim-val-you').textContent = `${totalAnnual}T`;

    // Alert Banner Styling
    const alertBox = document.getElementById('sim-alert-box');
    const alertTitle = document.getElementById('sim-alert-title');
    const alertDesc = document.getElementById('sim-alert-desc');
    const alertIconContainer = alertBox.querySelector('.alert-icon');

    if (totalAnnual < 3.0) {
        alertBox.className = 'gauge-alert green';
        alertTitle.textContent = 'Climate Hero Status!';
        alertDesc.textContent = 'Your choices align directly with limiting global temperature rise below 1.5°C.';
        alertIconContainer.innerHTML = '<i data-lucide="award"></i>';
    } else if (totalAnnual <= 10.0) {
        alertBox.className = 'gauge-alert orange';
        alertTitle.textContent = 'Excellent Progress!';
        alertDesc.textContent = 'You are beating national averages. Small changes in travel or food can push you even lower.';
        alertIconContainer.innerHTML = '<i data-lucide="thumbs-up"></i>';
    } else {
        alertBox.className = 'gauge-alert red';
        alertTitle.textContent = 'High Carbon footprint';
        alertDesc.textContent = 'Your projected emissions exceed sustainability targets. Try switching power options or public transit.';
        alertIconContainer.innerHTML = '<i data-lucide="alert-triangle"></i>';
    }
    lucide.createIcons();
}

// 4. Sandbox Actions Logic
function initSandbox() {
    const listEl = document.getElementById('actions-list');
    listEl.innerHTML = '';

    AVAILABLE_ACTIONS.forEach(action => {
        const isCommitted = state.committedActions.includes(action.id);
        const card = document.createElement('div');
        card.className = `card glass action-card ${isCommitted ? 'committed' : ''}`;
        card.setAttribute('data-id', action.id);
        
        card.innerHTML = `
            <div class="action-card-header">
                <div class="action-icon">
                    <i data-lucide="${action.icon}"></i>
                </div>
                <button class="action-toggle">
                    <i data-lucide="check"></i>
                </button>
            </div>
            <h3>${action.title}</h3>
            <p>${action.desc}</p>
            <div class="action-impact">-${action.impact} kg CO₂e / yr</div>
        `;

        card.addEventListener('click', () => toggleAction(action.id));
        listEl.appendChild(card);
    });

    updateSandboxSummary();
    lucide.createIcons();
}

function toggleAction(id) {
    const idx = state.committedActions.indexOf(id);
    if (idx > -1) {
        state.committedActions.splice(idx, 1);
    } else {
        state.committedActions.push(id);
        triggerConfetti(50); // Celebrate habit commitment
    }
    
    saveState();
    
    // Update card styling
    const cardEl = document.querySelector(`.action-card[data-id="${id}"]`);
    if (cardEl) {
        cardEl.classList.toggle('committed');
    }

    updateSandboxSummary();
    renderDashboardData();
}

function updateSandboxSummary() {
    const listContainer = document.getElementById('committed-habits');
    const savingsEl = document.getElementById('committed-savings');
    const countEl = document.getElementById('committed-count');
    
    listContainer.innerHTML = '';
    
    let totalSavings = 0;
    const activeActions = AVAILABLE_ACTIONS.filter(act => state.committedActions.includes(act.id));

    countEl.textContent = activeActions.length;

    if (activeActions.length === 0) {
        listContainer.innerHTML = '<p class="placeholder-text">Click the checkmark on cards to select and commit!</p>';
    } else {
        activeActions.forEach(action => {
            totalSavings += action.impact;
            const item = document.createElement('div');
            item.className = 'committed-item';
            item.innerHTML = `
                <span class="committed-item-title">${action.title}</span>
                <span class="committed-item-val">-${action.impact} kg/yr</span>
            `;
            listContainer.appendChild(item);
        });
    }

    savingsEl.textContent = `${totalSavings} kg`;
}

// 5. Achievements Logic
function initAchievements() {
    const container = document.getElementById('badges-container');
    container.innerHTML = '';

    state.badges.forEach(badge => {
        const card = document.createElement('div');
        card.className = `card glass badge-card ${badge.unlocked ? 'unlocked' : ''}`;
        card.setAttribute('data-id', badge.id);
        
        card.innerHTML = `
            <div class="lock-ribbon">
                <i data-lucide="${badge.unlocked ? 'unlock' : 'lock'}"></i>
            </div>
            <div class="badge-icon-wrapper">
                <i data-lucide="${badge.icon}"></i>
            </div>
            <h4>${badge.title}</h4>
            <p>${badge.desc}</p>
        `;

        card.addEventListener('click', () => {
            if (!badge.unlocked) {
                // Simulate badge unlocking dynamically
                badge.unlocked = true;
                saveState();
                card.classList.add('unlocked');
                const ribbonIcon = card.querySelector('.lock-ribbon i');
                ribbonIcon.setAttribute('data-lucide', 'unlock');
                triggerConfetti(120);
                lucide.createIcons();
            }
        });

        container.appendChild(card);
    });
    lucide.createIcons();
}

// 6. Logger Modal Logic
function initLoggerModal() {
    const modal = document.getElementById('logger-modal');
    const openBtn = document.getElementById('open-logger-btn');
    const closeBtn = document.getElementById('close-logger-btn');
    const cancelBtn = document.getElementById('cancel-logger-btn');
    const form = document.getElementById('logger-form');

    const openModal = () => modal.classList.add('active');
    const closeModal = () => modal.classList.remove('active');

    openBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const car = parseFloat(document.getElementById('log-car').value) || 0;
        const transit = parseFloat(document.getElementById('log-transit').value) || 0;
        const beef = parseFloat(document.getElementById('log-beef').value) || 0;
        const vegetarian = parseFloat(document.getElementById('log-vegetarian').value) || 0;
        const electricity = parseFloat(document.getElementById('log-electricity').value) || 0;
        const waste = parseFloat(document.getElementById('log-waste').value) || 0;

        // Perform score calculations
        const tTransport = (car * CO2_FACTORS.car) + (transit * CO2_FACTORS.transit);
        const tFood = (beef * CO2_FACTORS.beef) + (vegetarian * CO2_FACTORS.vegetarian);
        const tEnergy = electricity * CO2_FACTORS.electricity;
        const tWaste = waste * CO2_FACTORS.waste;
        const total = tTransport + tFood + tEnergy + tWaste;

        const newLog = {
            date: new Date().toISOString().split('T')[0],
            car,
            transit,
            beef,
            vegetarian,
            electricity,
            waste,
            total,
            breakdown: {
                transport: tTransport,
                food: tFood,
                energy: tEnergy,
                waste: tWaste
            }
        };

        // If today is logged already, overwrite it, otherwise push new one
        const todayDate = newLog.date;
        const existingIdx = state.logs.findIndex(log => log.date === todayDate);
        if (existingIdx > -1) {
            state.logs[existingIdx] = newLog;
        } else {
            state.logs.push(newLog);
            state.streak += 1;
        }

        // Check if new achievements criteria are met
        checkAchievementCriteria(newLog);

        saveState();
        renderDashboardData();
        closeModal();
        triggerConfetti(80);
        form.reset();
    });
}

function checkAchievementCriteria(log) {
    let unlockedAny = false;
    
    state.badges.forEach(badge => {
        if (!badge.unlocked) {
            if (badge.id === 'badge_energy_saver' && log.electricity < 5 && log.electricity > 0) {
                badge.unlocked = true;
                unlockedAny = true;
            }
            if (badge.id === 'badge_zero_waste' && log.waste === 0) {
                badge.unlocked = true;
                unlockedAny = true;
            }
        }
    });

    if (unlockedAny) {
        initAchievements(); // Re-render badges list
    }
}

// Visual celebrations
function triggerConfetti(count) {
    const container = document.getElementById('confetti-container');
    const colors = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#3b82f6'];

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'confetti-particle';
        
        // Random style setup
        const color = colors[Math.floor(Math.random() * colors.length)];
        const left = Math.random() * 100; // view width %
        const size = Math.random() * 8 + 6;
        const delay = Math.random() * 0.4;
        const duration = Math.random() * 1.5 + 1.2;

        particle.style.backgroundColor = color;
        particle.style.left = `${left}%`;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.animationDelay = `${delay}s`;
        particle.style.animationDuration = `${duration}s`;

        container.appendChild(particle);

        // Remove after animation completed
        setTimeout(() => {
            particle.remove();
        }, (duration + delay) * 1000);
    }
}
