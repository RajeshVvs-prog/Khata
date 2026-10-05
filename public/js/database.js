// Database service for Khata - Real-time Supabase integration

const DB_API = '/api';

// Initialize state here so it's available before app.js loads
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

// Get auth token from localStorage
function getAuthToken() {
  const session = localStorage.getItem('khata_session');
  if (!session) return null;
  
  try {
    const parsed = JSON.parse(session);
    return parsed.access_token;
  } catch (e) {
    return null;
  }
}

// Fetch with auth header
async function authFetch(url, options = {}) {
  const token = getAuthToken();
  if (!token) {
    console.warn('⚠️ No auth token - returning empty response');
    // Return a safe empty response instead of throwing
    if (url.includes('/profile')) return { profile: null };
    if (url.includes('/transactions')) return { transactions: [] };
    if (url.includes('/goals')) return { goals: [] };
    if (url.includes('/subscriptions')) return { subscriptions: [] };
    return {};
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };

  console.log(`📡 API: ${options.method || 'GET'} ${url}`);
  const response = await fetch(url, { ...options, headers });
  const data = await response.json();

  if (!response.ok) {
    console.error(`❌ API Error ${response.status}:`, data.error || data);
    throw new Error(data.error || 'API request failed');
  }

  return data;
}

// ===================== PROFILE API =====================
const ProfileAPI = {
  async get() {
    return authFetch(`${DB_API}/profile`);
  },

  async update(profile) {
    return authFetch(`${DB_API}/profile`, {
      method: 'PUT',
      body: JSON.stringify(profile)
    });
  }
};

// ===================== TRANSACTIONS API =====================
const TransactionsAPI = {
  async getAll() {
    return authFetch(`${DB_API}/transactions`);
  },

  async add(transaction) {
    return authFetch(`${DB_API}/transactions`, {
      method: 'POST',
      body: JSON.stringify(transaction)
    });
  }
};

// ===================== GOALS API =====================
const GoalsAPI = {
  async getAll() {
    return authFetch(`${DB_API}/goals`);
  },

  async add(goal) {
    return authFetch(`${DB_API}/goals`, {
      method: 'POST',
      body: JSON.stringify(goal)
    });
  }
};

// ===================== SUBSCRIPTIONS API =====================
const SubscriptionsAPI = {
  async getAll() {
    return authFetch(`${DB_API}/subscriptions`);
  },

  async add(subscription) {
    return authFetch(`${DB_API}/subscriptions`, {
      method: 'POST',
      body: JSON.stringify(subscription)
    });
  }
};

// ===================== LOAD DATA FROM DATABASE =====================
async function loadUserData() {
  console.log('🔄 Loading user data...');
  const state = window.state;
  if (!state) {
    console.error('❌ State object not found');
    return false;
  }

  try {
    // Use Promise.allSettled to continue even if some APIs fail
    const results = await Promise.allSettled([
      ProfileAPI.get().catch(e => ({ profile: null, error: e.message })),
      TransactionsAPI.getAll().catch(e => ({ transactions: [], error: e.message })),
      GoalsAPI.getAll().catch(e => ({ goals: [], error: e.message })),
      SubscriptionsAPI.getAll().catch(e => ({ subscriptions: [], error: e.message }))
    ]);

    // Process profile
    const profileData = results[0].status === 'fulfilled' ? results[0].value : { profile: null };
    if (profileData.profile) {
      state.income = Number(profileData.profile.monthly_income) || 0;
      console.log('✅ Income loaded:', state.income);
    } else {
      console.log('⚠️ No profile found, using ₹0');
    }

    // Process transactions
    const transactionsData = results[1].status === 'fulfilled' ? results[1].value : { transactions: [] };
    if (transactionsData.transactions && transactionsData.transactions.length > 0) {
      state.transactions = transactionsData.transactions.map(t => ({
        id: t.id,
        date: new Date(t.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        merchant: t.merchant,
        category: t.category,
        amount: Number(t.amount),
        type: t.type,
        flagged: t.is_flagged
      }));
      console.log('✅ Transactions loaded:', state.transactions.length);
    } else {
      state.transactions = [];
      console.log('⚠️ No transactions found');
    }

    // Process goals
    const goalsData = results[2].status === 'fulfilled' ? results[2].value : { goals: [] };
    if (goalsData.goals && goalsData.goals.length > 0) {
      state.goals = goalsData.goals.map(g => ({
        id: g.id,
        name: g.name,
        emoji: g.emoji || '🎯',
        target: Number(g.target_amount),
        saved: Number(g.current_amount)
      }));
      console.log('✅ Goals loaded:', state.goals.length);
    } else {
      state.goals = [];
      console.log('⚠️ No goals found');
    }

    // Process subscriptions
    const subscriptionsData = results[3].status === 'fulfilled' ? results[3].value : { subscriptions: [] };
    if (subscriptionsData.subscriptions && subscriptionsData.subscriptions.length > 0) {
      state.subscriptions = subscriptionsData.subscriptions.map(s => ({
        id: s.id,
        name: s.name,
        amount: Number(s.amount),
        frequency: s.frequency || 'monthly',
        category: s.category || 'Subscriptions',
        next_billing_date: s.next_billing_date,
        is_active: s.is_active !== false
      }));
      console.log('✅ Subscriptions loaded:', state.subscriptions.length);
    } else {
      state.subscriptions = [];
      console.log('⚠️ No subscriptions found');
    }

    console.log('✅ Data loading complete - showing UI');
    return true;
  } catch (error) {
    console.error('❌ Error loading user data:', error);
    // Still return true to show UI with empty state
    state.transactions = [];
    state.goals = [];
    state.subscriptions = [];
    return true;
  }
}

// ===================== SAVE DATA TO DATABASE =====================
async function saveTransaction(description, amount, category, type = 'expense') {
  try {
    const transaction = {
      date: new Date().toISOString().split('T')[0],
      merchant: description,
      description: description,
      category: category,
      amount: amount,
      type: type
    };

    const result = await TransactionsAPI.add(transaction);
    
    // Add to local state
    const state = window.state;
    if (state && state.transactions) {
      state.transactions.unshift({
        id: result.transaction.id,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        merchant: description,
        category: category,
        amount: amount,
        type: type
      });
    }

    return result.transaction;
  } catch (error) {
    console.error('Failed to save transaction:', error);
    throw error;
  }
}

async function saveGoal(name, targetAmount, currentAmount = 0, emoji = '🎯') {
  try {
    const goal = {
      name: name,
      emoji: emoji,
      target_amount: targetAmount,
      current_amount: currentAmount
    };

    const result = await GoalsAPI.add(goal);
    
    // Add to local state
    const state = window.state;
    if (state && state.goals) {
      state.goals.push({
        id: result.goal.id,
        name: name,
        emoji: emoji,
        target: targetAmount,
        saved: currentAmount
      });
    }

    return result.goal;
  } catch (error) {
    console.error('Failed to save goal:', error);
    throw error;
  }
}

async function saveSubscription(name, amount, frequency = 'monthly', category = 'Subscriptions') {
  try {
    const nextBilling = new Date();
    if (frequency === 'monthly') nextBilling.setMonth(nextBilling.getMonth() + 1);
    else if (frequency === 'yearly') nextBilling.setFullYear(nextBilling.getFullYear() + 1);
    else if (frequency === 'weekly') nextBilling.setDate(nextBilling.getDate() + 7);

    const subscription = {
      name: name,
      amount: amount,
      frequency: frequency,
      next_billing_date: nextBilling.toISOString().split('T')[0],
      category: category
    };

    const result = await SubscriptionsAPI.add(subscription);

    // Add to local state immediately so UI updates without reload
    const state = window.state;
    if (state) {
      if (!state.subscriptions) state.subscriptions = [];
      state.subscriptions.push({
        id: result.subscription?.id,
        name: name,
        amount: Number(amount),
        frequency: frequency,
        category: category,
        next_billing_date: nextBilling.toISOString().split('T')[0],
        is_active: true
      });
    }

    return result.subscription;
  } catch (error) {
    console.error('Failed to save subscription:', error);
    throw error;
  }
}

// Export API
if (typeof window !== 'undefined') {
  window.Database = {
    ProfileAPI,
    TransactionsAPI,
    GoalsAPI,
    SubscriptionsAPI,
    loadUserData,
    saveTransaction,
    saveGoal,
    saveSubscription
  };
}
