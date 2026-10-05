// ===================== REAL USER DATA ONLY - NO MOCK DATA =====================
let nextId = 100;
const CATEGORY_RANGES = {
  Food: [2000, 5500], Shopping: [1000, 4500], Bills: [3000, 6500],
  Transport: [800, 3200], Entertainment: [400, 2200], Rent: [2500, 6000],
  Subscriptions: [200, 1500], Healthcare: [0, 3000], Education: [0, 4000], Other: [300, 3000]
};

// REMOVED: PREV_MONTH_TOTALS - no fake comparison data
// REMOVED: Mock transactions - no demo data for production users

// Empty state by default - will be populated from database
// Exposed globally so database.js can update it
// database.js initializes this first, we just ensure it exists
if (!window.state) {
  window.state = {
    income: 0,
    transactions: [],
    goals: [],
    subscriptions: [],
    isLoading: true,
    hasError: false
  };
}

// Shorthand for local access
const state = window.state;

const KEYWORD_CATEGORY = {
  zomato: 'Food', swiggy: 'Food', biryani: 'Food', dinner: 'Food', lunch: 'Food', breakfast: 'Food', food: 'Food', restaurant: 'Food', canteen: 'Food',
  netflix: 'Subscriptions', spotify: 'Subscriptions', prime: 'Subscriptions', subscription: 'Subscriptions',
  uber: 'Transport', ola: 'Transport', auto: 'Transport', fuel: 'Transport', petrol: 'Transport', bus: 'Transport', train: 'Transport', transport: 'Transport', cab: 'Transport',
  shopping: 'Shopping', amazon: 'Shopping', flipkart: 'Shopping', clothes: 'Shopping', shoes: 'Shopping', digital: 'Shopping', mall: 'Shopping',
  rent: 'Rent',
  bill: 'Bills', electricity: 'Bills', recharge: 'Bills', wifi: 'Bills', internet: 'Bills',
  medicine: 'Healthcare', doctor: 'Healthcare', hospital: 'Healthcare', pharmacy: 'Healthcare',
  book: 'Education', course: 'Education', tuition: 'Education', fees: 'Education',
  movie: 'Entertainment', entertainment: 'Entertainment', game: 'Entertainment', concert: 'Entertainment'
};

// ===================== Helpers =====================
function formatINR(n) { return '₹' + Math.round(n).toLocaleString('en-IN'); }

function computeTotals() {
  const expenses = state.transactions
    .filter(t => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);
  
  const income = state.income || 0;
  const savings = income - expenses;
  const rate = income ? (savings / income) * 100 : 0;
  
  const byCategory = {};
  state.transactions
    .filter(t => t.type === 'expense')
    .forEach(t => { 
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount; 
    });
  
  return { expenses, savings, rate, byCategory };
}

function computeScore(rate) {
  return Math.max(0, Math.min(100, Math.round(45 + rate)));
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 3200);
}

function parseEntry(text) {
  const amountMatch = text.match(/(?:₹|rs\.?|inr)?\s?([\d,]+(?:\.\d+)?)/i);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;
  const lower = text.toLowerCase();
  let category = 'Other';
  for (const key in KEYWORD_CATEGORY) {
    if (lower.includes(key)) { category = KEYWORD_CATEGORY[key]; break; }
  }
  let merchant = text.replace(amountMatch ? amountMatch[0] : '', '').replace(/rupees|rs\.?|inr/gi, '').trim();
  merchant = merchant.replace(/\s{2,}/g, ' ');
  if (!merchant) merchant = category;
  merchant = merchant.charAt(0).toUpperCase() + merchant.slice(1);
  return { amount, category, merchant };
}

function isAnomaly(category, amount) {
  const range = CATEGORY_RANGES[category] || [0, 3000];
  return amount > range[1] * 1.4;
}

// ===================== Navigation =====================
const views = document.querySelectorAll('.app-view');
const navButtons = document.querySelectorAll('#sideNav button');
const viewTitle = document.getElementById('viewTitle');

const TITLES = {
  dashboard: 'Dashboard', transactions: 'Transactions', goals: 'Goals',
  subscriptions: 'Subscriptions', reports: 'Monthly report', assistant: 'Assistant', settings: 'Settings'
};

navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-view');
    navButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    views.forEach(v => v.classList.remove('active'));
    const targetView = document.getElementById('view-' + target);
    if (targetView) targetView.classList.add('active');
    if (viewTitle) viewTitle.textContent = TITLES[target] || 'Dashboard';
  });
});

// ===================== Dashboard =====================
function refreshDashboard() {
  const { expenses, savings, rate, byCategory } = computeTotals();
  const score = computeScore(rate);

  // Update stats
  const statIncome = document.getElementById('statIncome');
  const statExpenses = document.getElementById('statExpenses');
  const statSavings = document.getElementById('statSavings');
  const statSavingsRate = document.getElementById('statSavingsRate');
  const statScore = document.getElementById('statScore');

  if (statIncome) statIncome.textContent = formatINR(state.income);
  if (statExpenses) statExpenses.textContent = formatINR(expenses);
  if (statSavings) statSavings.textContent = formatINR(savings);
  if (statSavingsRate) statSavingsRate.textContent = rate.toFixed(1) + '% of income';
  if (statScore) statScore.textContent = score + '/100';

  // Update chart
  updateDashChart(byCategory);

  // Update recent transactions
  updateRecentTx();

  // Update anomaly box
  updateAnomalyBox();
}

function updateDashChart(byCategory) {
  const canvas = document.getElementById('dashChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  
  // Destroy existing chart
  if (window.dashChartInstance) {
    window.dashChartInstance.destroy();
  }

  const categories = Object.keys(byCategory);
  const amounts = Object.values(byCategory);

  if (categories.length === 0) {
    // Empty state
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '14px IBM Plex Sans';
    ctx.fillStyle = '#999';
    ctx.textAlign = 'center';
    ctx.fillText('No expenses yet', canvas.width / 2, canvas.height / 2);
    return;
  }

  window.dashChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: categories,
      datasets: [{
        data: amounts,
        backgroundColor: '#2E4A34',
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { callback: v => '₹' + v.toLocaleString('en-IN') } }
      }
    }
  });
}

function updateRecentTx() {
  const list = document.getElementById('recentTx');
  if (!list) return;

  if (state.transactions.length === 0) {
    list.innerHTML = '<li style="color: #999; text-align: center; padding: 20px;">No transactions yet. Add your first transaction to get started!</li>';
    return;
  }

  const recent = state.transactions.slice(0, 5);
  list.innerHTML = recent.map(t => `
    <li><span>${t.merchant}</span><span class="mono debit">${formatINR(t.amount)}</span></li>
  `).join('');
}

function updateAnomalyBox() {
  const box = document.getElementById('anomalyBox');
  if (!box) return;

  const anomalies = state.transactions.filter(t => isAnomaly(t.category, t.amount));

  if (anomalies.length === 0) {
    box.innerHTML = '<p style="color: #999;">No unusual spending detected. All transactions look normal.</p>';
    return;
  }

  box.innerHTML = anomalies.slice(0, 3).map(a => `
    <p>⚠ <strong>${a.merchant}</strong> (${formatINR(a.amount)}) is unusually high for ${a.category}.</p>
  `).join('');
}

// ===================== Transactions =====================
function refreshTransactions() {
  const tbody = document.getElementById('txTableBody');
  if (!tbody) return;

  if (state.transactions.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 40px; color: #999;">No transactions yet. Click "+ Add entry" to record your first transaction.</td></tr>';
    return;
  }

  tbody.innerHTML = state.transactions.map(t => `
    <tr>
      <td>${t.date}</td>
      <td>${t.merchant}</td>
      <td>${t.category}</td>
      <td class="mono debit">${formatINR(t.amount)}</td>
    </tr>
  `).join('');

  // Update filter chips
  updateFilterChips();
}

function updateFilterChips() {
  const container = document.getElementById('categoryFilters');
  if (!container) return;

  const categories = ['All', ...new Set(state.transactions.map(t => t.category))];
  
  container.innerHTML = categories.map(cat => `
    <button class="${cat === 'All' ? 'active' : ''}" data-cat="${cat}">${cat}</button>
  `).join('');

  container.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-cat');
      container.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterTransactions(cat);
    });
  });
}

function filterTransactions(category) {
  const tbody = document.getElementById('txTableBody');
  if (!tbody) return;

  const filtered = category === 'All' 
    ? state.transactions 
    : state.transactions.filter(t => t.category === category);

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 40px; color: #999;">No transactions in this category.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(t => `
    <tr>
      <td>${t.date}</td>
      <td>${t.merchant}</td>
      <td>${t.category}</td>
      <td class="mono debit">${formatINR(t.amount)}</td>
    </tr>
  `).join('');
}

// ===================== Goals =====================
function refreshGoals() {
  const grid = document.getElementById('goalsGrid');
  if (!grid) return;

  if (state.goals.length === 0) {
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">No goals yet. Set your first financial goal below!</div>';
    return;
  }

  grid.innerHTML = state.goals.map(g => {
    const pct = ((g.saved / g.target) * 100).toFixed(1);
    return `
      <div class="goal-card">
        <h4>${g.emoji} ${g.name}</h4>
        <div class="goal-progress-bar">
          <div class="goal-progress-fill" style="width: ${pct}%"></div>
        </div>
        <div class="goal-stats">
          <span>${formatINR(g.saved)} of ${formatINR(g.target)}</span>
          <span>${pct}%</span>
        </div>
      </div>
    `;
  }).join('');
}

// ===================== Subscriptions =====================
function refreshSubscriptions() {
  const list = document.getElementById('subList');
  const totalMonth = document.getElementById('subTotalMonth');
  const totalYear = document.getElementById('subTotalYear');

  if (!list) return;

  // Combine manually added subscriptions from database
  const subs = state.subscriptions || [];

  if (subs.length === 0) {
    list.innerHTML = '<li style="color:#999;padding:20px 0;">No subscriptions yet. Add one below!</li>';
    if (totalMonth) totalMonth.textContent = '₹0';
    if (totalYear) totalYear.textContent = '₹0';
    return;
  }

  list.innerHTML = subs.map(s => {
    const freq = s.frequency === 'yearly' ? '/yr' : s.frequency === 'weekly' ? '/wk' : '/mo';
    return `
      <li>
        <span>${s.name} <small style="color:#999;">(${s.category})</small></span>
        <span class="mono">${formatINR(s.amount)}<small style="color:#999;font-size:11px;">${freq}</small></span>
      </li>
    `;
  }).join('');

  // Calculate monthly totals (convert yearly/weekly to monthly)
  const monthlyTotal = subs.reduce((sum, s) => {
    if (s.frequency === 'yearly') return sum + s.amount / 12;
    if (s.frequency === 'weekly') return sum + s.amount * 4.33;
    return sum + s.amount;
  }, 0);

  if (totalMonth) totalMonth.textContent = formatINR(monthlyTotal);
  if (totalYear) totalYear.textContent = formatINR(monthlyTotal * 12);
}

// ===================== Add Subscription Form =====================
const addSubForm = document.getElementById('addSubForm');
if (addSubForm) {
  addSubForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('subName');
    const amountInput = document.getElementById('subAmount');
    const frequencyInput = document.getElementById('subFrequency');
    const categoryInput = document.getElementById('subCategory');

    const name = nameInput.value.trim();
    const amount = parseFloat(amountInput.value) || 0;
    const frequency = frequencyInput.value;
    const category = categoryInput.value;

    if (!name || amount <= 0) {
      showToast('Please enter a name and amount');
      return;
    }

    const btn = addSubForm.querySelector('button[type="submit"]');
    btn.textContent = 'Saving…';
    btn.disabled = true;

    try {
      // Save to subscriptions table
      await Database.saveSubscription(name, amount, frequency, category);

      // Also save as a transaction so it shows in expenses/dashboard/reports
      await Database.saveTransaction(name, amount, category, 'expense');

      // Clear form
      nameInput.value = '';
      amountInput.value = '';
      frequencyInput.value = 'monthly';
      categoryInput.value = 'Subscriptions';

      // Refresh all views so expenses, dashboard, reports all update
      refreshSubscriptions();
      refreshDashboard();
      refreshTransactions();
      refreshReports();

      showToast(`${name} added to subscriptions and expenses!`);
    } catch (error) {
      console.error('Failed to add subscription:', error);
      showToast('Failed to add subscription. Try again.');
    } finally {
      btn.textContent = 'Add subscription';
      btn.disabled = false;
    }
  });
}

// ===================== Reports =====================
function refreshReports() {
  const { expenses, savings, rate, byCategory } = computeTotals();
  const score = computeScore(rate);

  const repIncome = document.getElementById('repIncome');
  const repExpenses = document.getElementById('repExpenses');
  const repSavings = document.getElementById('repSavings');
  const repRate = document.getElementById('repRate');
  const repTop = document.getElementById('repTop');
  const repScore = document.getElementById('repScore');

  if (repIncome) repIncome.textContent = formatINR(state.income);
  if (repExpenses) repExpenses.textContent = formatINR(expenses);
  if (repSavings) repSavings.textContent = formatINR(savings);
  if (repRate) repRate.textContent = rate.toFixed(1) + '%';
  if (repScore) repScore.textContent = score + ' / 100';

  if (repTop) {
    const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0) {
      repTop.textContent = `${sorted[0][0]} — ${formatINR(sorted[0][1])}`;
    } else {
      repTop.textContent = 'No expenses yet';
    }
  }
}

// ===================== Add Transaction =====================
const quickAddBtn = document.getElementById('quickAddBtn');
const addModal = document.getElementById('addModal');
const cancelAdd = document.getElementById('cancelAdd');
const addTxForm = document.getElementById('addTxForm');

if (quickAddBtn) {
  quickAddBtn.addEventListener('click', () => {
    if (addModal) addModal.classList.remove('hidden');
  });
}

if (cancelAdd) {
  cancelAdd.addEventListener('click', () => {
    if (addModal) addModal.classList.add('hidden');
  });
}

if (addTxForm) {
  addTxForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('txFreeInput');
    if (!input) return;

    const text = input.value.trim();
    if (!text) return;

    await addTransaction(text);
    
    input.value = '';
    if (addModal) addModal.classList.add('hidden');
  });
}

async function addTransaction(text) {
  const { amount, category, merchant } = parseEntry(text);
  if (amount === 0) {
    showToast('Could not parse amount from entry');
    return;
  }

  try {
    // Save to database
    await Database.saveTransaction(merchant, amount, category, 'expense');
    
    // Refresh all views
    refreshDashboard();
    refreshTransactions();
    refreshSubscriptions();
    refreshReports();
    
    showToast('Transaction added!');
  } catch (error) {
    console.error('Failed to add transaction:', error);
    showToast('Failed to add transaction');
  }
}

// ===================== Add Goal =====================
const addGoalForm = document.getElementById('addGoalForm');
if (addGoalForm) {
  addGoalForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nameInput = document.getElementById('goalName');
    const targetInput = document.getElementById('goalTarget');
    const savedInput = document.getElementById('goalSaved');
    
    if (!nameInput || !targetInput || !savedInput) return;

    const name = nameInput.value.trim();
    const target = parseInt(targetInput.value) || 0;
    const saved = parseInt(savedInput.value) || 0;
    
    if (!name || target <= 0) {
      showToast('Please fill all fields');
      return;
    }

    try {
      await Database.saveGoal(name, target, saved);
      
      nameInput.value = '';
      targetInput.value = '';
      savedInput.value = '0';
      
      refreshGoals();
      showToast('Goal added!');
    } catch (error) {
      console.error('Failed to add goal:', error);
      showToast('Failed to add goal');
    }
  });
}

// ===================== Settings =====================
const settingsForm = document.getElementById('settingsForm');
if (settingsForm) {
  settingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const incomeInput = document.getElementById('settingsIncome');
    if (!incomeInput) return;

    const incomeText = incomeInput.value.replace(/[₹,]/g, '').trim();
    const income = parseFloat(incomeText) || 0;

    if (income <= 0) {
      showToast('Please enter valid income');
      return;
    }

    try {
      // Update state
      state.income = income;

      // Save to database
      const user = JSON.parse(localStorage.getItem('khata_user') || '{}');
      await Database.ProfileAPI.update({
        full_name: user.user_metadata?.full_name || 'User',
        monthly_income: income,
        currency: 'INR'
      });

      // Refresh dashboard
      refreshDashboard();
      refreshReports();
      
      showToast('Income updated!');
    } catch (error) {
      console.error('Failed to update income:', error);
      showToast('Failed to update income');
    }
  });
}

// ===================== Loading State =====================
function showLoadingState() {
  const dashboard = document.getElementById('view-dashboard');
  if (!dashboard) return;

  const loadingHtml = `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 400px; flex-direction: column;">
      <div class="typing-indicator" style="margin-bottom: 20px;">
        <span></span><span></span><span></span>
      </div>
      <p style="color: #999;">Loading your financial data...</p>
    </div>
  `;

  dashboard.innerHTML = loadingHtml;
}

function hideLoadingState() {
  // Restore original dashboard HTML
  state.isLoading = false;
  
  const dashboard = document.getElementById('view-dashboard');
  if (!dashboard) return;

  // Restore the full dashboard structure
  dashboard.innerHTML = `
    <div class="stat-row">
      <div class="stat-card">
        <span>Income</span>
        <strong class="mono" id="statIncome">₹0</strong>
      </div>
      <div class="stat-card">
        <span>Expenses</span>
        <strong class="mono debit" id="statExpenses">₹0</strong>
      </div>
      <div class="stat-card">
        <span>Savings</span>
        <strong class="mono" id="statSavings">₹0</strong>
        <small id="statSavingsRate">0% of income</small>
      </div>
      <div class="stat-card">
        <span>Health score</span>
        <strong class="mono" id="statScore">0/100</strong>
      </div>
    </div>

    <div class="snapshot-grid">
      <div class="ledger-card">
        <h3>Spending by category</h3>
        <canvas id="dashChart" height="220"></canvas>
      </div>
      <div class="ledger-card">
        <h3>Recent entries</h3>
        <ul class="ledger-list" id="recentTx"></ul>
        <button class="btn btn-text" data-view-link="transactions">See all transactions →</button>
      </div>
      <div class="ledger-card">
        <h3>Anomaly watch</h3>
        <div id="anomalyBox"></div>
      </div>
    </div>
  `;
}

// ===================== Error State =====================
function showErrorState() {
  const dashboard = document.getElementById('view-dashboard');
  if (!dashboard) return;

  const errorHtml = `
    <div style="text-align: center; padding: 60px 20px;">
      <h3 style="color: #A23E36; margin-bottom: 16px;">Failed to load your data</h3>
      <p style="color: #999; margin-bottom: 24px;">We couldn't retrieve your financial information.</p>
      <button class="btn btn-primary" onclick="location.reload()">Retry</button>
    </div>
  `;

  dashboard.innerHTML = errorHtml;
  state.hasError = true;
}

// ===================== DATABASE INTEGRATION =====================
async function initializeApp() {
  try {
    showLoadingState();
    console.log('🔄 Loading user data...');

    // Load data from database
    const loaded = await Database.loadUserData();
    
    if (!loaded) {
      console.log('⚠ No data loaded - showing empty state');
    } else {
      console.log('✅ Data loaded successfully');
    }

    hideLoadingState();

    // Initial refresh of all views
    refreshDashboard();
    refreshTransactions();
    refreshGoals();
    refreshSubscriptions();
    refreshReports();

    console.log('✅ App initialized');
    console.log('💰 Income:', formatINR(state.income));
    console.log('📝 Transactions:', state.transactions.length);
    console.log('🎯 Goals:', state.goals.length);
    console.log('📊 Subscriptions:', state.subscriptions.length);
    
  } catch (error) {
    console.error('❌ App initialization error:', error);
    console.error('Stack:', error.stack);
    showErrorState();
  }
}

// Initialize when DOM and database.js are both ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for database.js to load
    setTimeout(initializeApp, 100);
  });
} else {
  setTimeout(initializeApp, 100);
}
