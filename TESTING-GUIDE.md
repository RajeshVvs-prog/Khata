# Khata Testing Guide - Zero State to Full Persistence

## Prerequisites ✅

Before testing, ensure:

1. **Database Tables Created**
   - Run `database-schema.sql` in Supabase SQL Editor
   - Verify 6 tables exist: `user_profiles`, `transactions`, `categories`, `goals`, `subscriptions`, `budgets`

2. **Server Running**
   ```bash
   node server.js
   ```
   - Should see: "Server running on http://localhost:3000"

3. **Environment Variables**
   - `.env` file contains valid Supabase credentials
   - `GROQ_API_KEY` is set

## Test Scenario 1: New User Empty State 🆕

### Expected Behavior
A brand new user should see:
- ₹0 income
- ₹0 expenses
- ₹0 savings
- "No transactions yet" message
- "No goals yet" message
- Empty charts/graphs

### Steps
1. **Create New Account**
   - Go to `http://localhost:3000/login.html`
   - Click "Create Account"
   - Enter:
     - Full Name: "Test User"
     - Email: "testuser@gmail.com" (use real domain)
     - Password: "Test@123456"
     - Monthly Income: ₹0 (leave empty or enter 0)
   - Click "Create Account"

2. **Verify Empty Dashboard**
   - Income should show: ₹0
   - Expenses should show: ₹0
   - Savings should show: ₹0
   - Recent transactions: "No transactions yet. Add your first transaction to get started!"
   - Chart: "No expenses yet"

3. **Verify Other Views**
   - **Transactions**: "No transactions yet. Click + Add entry..."
   - **Goals**: "No goals yet. Set your first financial goal below!"
   - **Subscriptions**: "No recurring subscriptions detected yet."
   - **Reports**: All ₹0 values

## Test Scenario 2: Add Income ₹50,000 💰

### Expected Behavior
Income updates across all views and persists after refresh

### Steps
1. **Update Income**
   - Click "Settings" in sidebar
   - Change "Monthly income" to: ₹50,000
   - Click "Save changes"
   - Should see toast: "Income updated!"

2. **Verify Dashboard Updates**
   - Income stat: ₹50,000
   - Expenses: ₹0 (unchanged)
   - Savings: ₹50,000 (income - expenses)
   - Savings rate: "100.0% of income"

3. **Verify Persistence**
   - **Refresh page** (F5)
   - Income should still show ₹50,000
   - **Open new tab** to `http://localhost:3000/app.html`
   - Income should show ₹50,000
   - **Close browser completely**
   - Reopen `http://localhost:3000/app.html`
   - Income should STILL show ₹50,000

## Test Scenario 3: Add First Transaction 🛒

### Expected Behavior
Transaction appears immediately and persists across sessions

### Steps
1. **Add Transaction**
   - Click "+ Add entry" button (top right)
   - Enter: "Bought groceries from Big Bazaar ₹2500"
   - Click "Add to ledger"
   - Should see toast: "Transaction added!"

2. **Verify Updates**
   - **Dashboard**:
     - Expenses: ₹2,500
     - Savings: ₹47,500
     - Savings rate: "95.0% of income"
     - Recent entries: Shows "Big Bazaar ₹2,500"
     - Chart: Shows "Shopping" category with ₹2,500
   
   - **Transactions Tab**:
     - Shows 1 row with transaction
     - Filter chips show: "All" and "Shopping"
   
   - **Reports Tab**:
     - Expenses: ₹2,500
     - Top category: "Shopping — ₹2,500"

3. **Test Persistence**
   - **Switch tabs**: Dashboard → Transactions → Goals → back to Dashboard
   - Transaction should still be visible
   - **Refresh page** (F5)
   - Transaction should persist
   - **Close and reopen browser**
   - Transaction should STILL be there

## Test Scenario 4: Add Multiple Transactions 🛍️

### Expected Behavior
All transactions saved, categorized correctly, charts update

### Steps
1. **Add 5 More Transactions**
   ```
   1. "Zomato biryani ₹320"
   2. "Netflix subscription ₹649"
   3. "Uber ride home ₹180"
   4. "Purchased shoes from Amazon ₹2400"
   5. "Electricity bill ₹1800"
   ```

2. **Verify Categorization**
   - Biryani → Food
   - Netflix → Subscriptions
   - Uber → Transport
   - Shoes → Shopping
   - Electricity → Bills

3. **Verify Math**
   - Total expenses: ₹7,849
   - Savings: ₹42,151
   - Savings rate: ~84.3%

4. **Verify Chart**
   - Chart shows 5 categories
   - Shopping highest (₹4,900)
   - Transport lowest (₹180)

5. **Verify Subscriptions Detection**
   - Go to "Subscriptions" tab
   - If Netflix appears 2+ times, should be detected as recurring
   - Shows monthly/yearly totals

## Test Scenario 5: Add Financial Goal 🎯

### Expected Behavior
Goal saved with progress bar, persists across sessions

### Steps
1. **Add Goal**
   - Go to "Goals" tab
   - Enter:
     - Goal name: "Buy a new bike"
     - Target: 80000
     - Already saved: 10000
   - Click "Add goal"

2. **Verify Goal Display**
   - Shows "🎯 Buy a new bike"
   - Progress bar: 12.5% filled (₹10,000 of ₹80,000)
   - Percentage shown: "12.5%"

3. **Test Persistence**
   - Refresh page
   - Goal should persist
   - Close/reopen browser
   - Goal should STILL be there

## Test Scenario 6: Multi-Tab Sync Test 🔄

### Critical Test for Data Consistency

### Steps
1. **Open Two Tabs**
   - Tab A: `http://localhost:3000/app.html`
   - Tab B: `http://localhost:3000/app.html`

2. **Add Transaction in Tab A**
   - Tab A: Add "Coffee from Starbucks ₹450"
   - Note current expenses

3. **Switch to Tab B**
   - **Refresh Tab B** (F5)
   - Should show the Starbucks transaction
   - Expenses should match Tab A

4. **Add Goal in Tab B**
   - Tab B: Add goal "New Laptop" ₹60,000 saved ₹5,000
   
5. **Switch to Tab A**
   - **Refresh Tab A** (F5)
   - Should show the new laptop goal

**Expected**: Both tabs show same data after refresh (manual sync)

## Test Scenario 7: Anomaly Detection 🚨

### Expected Behavior
Unusually high transactions flagged on dashboard

### Steps
1. **Add High-Value Transaction**
   - Add: "Shopping spree at mall ₹8000"
   - Category: Shopping

2. **Check Anomaly Box**
   - Dashboard → "Anomaly watch" section
   - Should show: "⚠ Shopping spree at mall (₹8,000) is unusually high for Shopping."

3. **Add Normal Transaction**
   - Add: "Lunch at restaurant ₹500"
   - Should NOT be flagged

## Test Scenario 8: AI Assistant Test 🤖

### Expected Behavior
AI responds with personalized financial advice

### Steps
1. **Go to Assistant Tab**
   - Click "Assistant" in sidebar

2. **Test Suggested Questions**
   - Click "Why did I spend so much this month?"
   - Should receive AI response with:
     - Analysis of spending categories
     - Specific amounts referenced
     - Actionable suggestions

3. **Test Custom Question**
   - Type: "Can I afford a ₹5,000 purchase?"
   - AI should:
     - Consider current savings (₹42,151)
     - Give yes/no recommendation
     - Explain reasoning

4. **Test With No Data (New User)**
   - Create fresh account with ₹0 income
   - Ask AI a question
   - Should handle gracefully: "No financial data available yet"

## Test Scenario 9: Session Persistence 🔐

### Critical Security Test

### Steps
1. **Login and Add Data**
   - Login as "testuser@gmail.com"
   - Add 3 transactions
   - Note current state

2. **Logout**
   - Click "Log out" in sidebar
   - Should redirect to login page

3. **Login Again**
   - Login with same credentials
   - **All data should be exactly as before logout**
   - Transactions, goals, income all preserved

4. **Test Different User**
   - Logout
   - Create NEW account: "user2@gmail.com"
   - Should see **completely empty state**
   - ₹0 income, no transactions, no goals
   - Should NOT see testuser@gmail.com's data

## Test Scenario 10: Browser Restart Test 💻

### Steps
1. **Add Significant Data**
   - Income: ₹80,000
   - 10 transactions totaling ₹25,000
   - 3 goals
   - Note exact numbers

2. **Close Browser Completely**
   - Exit Chrome/Edge completely
   - Wait 10 seconds

3. **Reopen Browser**
   - Navigate to `http://localhost:3000/app.html`
   - Should auto-login (session saved)
   - **All data exactly as before**
   - Income: ₹80,000
   - 10 transactions visible
   - 3 goals visible

## Common Issues & Solutions 🔧

### Issue: "No authorization token"
**Cause**: Not logged in or session expired
**Fix**: Logout and login again

### Issue: "Failed to load user data"
**Cause**: Database tables not created
**Fix**: Run `database-schema.sql` in Supabase

### Issue: Income shows ₹0 after setting to ₹50,000
**Cause**: Not saved to database
**Fix**: Check server logs, verify API call succeeded

### Issue: Transactions added but disappear after refresh
**Cause**: Not being saved to Supabase
**Fix**: 
1. Check server logs for errors
2. Verify Supabase connection
3. Check browser console for API errors

### Issue: "Model not found" in AI chat
**Cause**: Wrong Groq model name
**Fix**: Verify `server.js` uses `llama-3.1-8b-instant`

### Issue: Multiple demo transactions (₹500, ₹600) appearing
**Cause**: Old `app.js` with mock data
**Fix**: Verify `app.js` has NO transactions array, only empty state

## Success Checklist ✅

Complete this checklist to verify full implementation:

- [ ] New user sees ₹0 empty state
- [ ] No fake/demo transactions appear
- [ ] Income saves and persists across refresh
- [ ] Transactions save to Supabase
- [ ] Transactions persist after browser restart
- [ ] Charts show empty state when no data
- [ ] Goals save and show progress bars
- [ ] Goals persist across sessions
- [ ] Subscriptions detected from recurring transactions
- [ ] AI assistant responds with context
- [ ] Anomaly detection flags high transactions
- [ ] Settings updates save to database
- [ ] Multi-tab data consistency (after refresh)
- [ ] Different users see different data
- [ ] Logout clears session properly
- [ ] Login restores all user data

## Performance Expectations ⚡

- Initial load: < 2 seconds
- Add transaction: < 500ms
- Dashboard refresh: < 200ms
- AI response: 2-5 seconds
- Tab switch: Instant (no reload needed)

## Database Verification 🗄️

**Supabase Dashboard Checks:**

1. **user_profiles table**
   - Should have 1 row per user
   - `monthly_income` column populated
   - `full_name` matches signup

2. **transactions table**
   - Each transaction has correct `user_id`
   - `amount`, `category`, `merchant` all correct
   - `date` in proper format (YYYY-MM-DD)

3. **goals table**
   - Each goal has `target_amount` and `current_amount`
   - `emoji` defaults to 🎯

---

## Next Steps After Testing

Once all tests pass:
1. Test with real-world usage (1 week)
2. Add bulk transaction import (CSV)
3. Add expense categories customization
4. Add budget alerts
5. Add monthly/yearly reports
6. Add data export feature
