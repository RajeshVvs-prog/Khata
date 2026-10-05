# 🚀 Quick Start Guide - Khata Personal Finance App

## What Was Fixed

Your app previously had **mock/demo data** hardcoded (fake ₹500/₹600 transactions, ₹50,000 income). This has been **completely removed** and replaced with:

✅ **Empty state for new users** (₹0 income, no transactions)  
✅ **Real data persistence** using Supabase database  
✅ **Cross-session persistence** (data survives browser restarts)  
✅ **Per-user data isolation** (each user sees only their data)

---

## 🔧 Setup (One-Time)

### Step 1: Install Database Tables

1. Open Supabase Dashboard: https://cynwexechtjqtrhatldw.supabase.co
2. Go to **SQL Editor** (left sidebar)
3. Open the file: `database-schema.sql`
4. Copy all contents
5. Paste into Supabase SQL Editor
6. Click **"Run"**
7. Verify: Go to **Table Editor** → you should see 6 tables:
   - `user_profiles`
   - `transactions`
   - `categories`
   - `goals`
   - `subscriptions`
   - `budgets`

### Step 2: Start the Server

```bash
cd khata-demo
node server.js
```

You should see:
```
Server running on http://localhost:3000
```

**Keep this terminal open!**

---

## 🧪 Quick Test (5 minutes)

### Test 1: New User Empty State

1. Open browser: `http://localhost:3000/login.html`
2. Click **"Create Account"**
3. Fill in:
   - **Full Name**: "Test User"
   - **Email**: "testuser@gmail.com" (MUST be real domain like @gmail.com, @yahoo.com)
   - **Password**: "Test@123456" (min 6 chars)
   - **Monthly Income**: Leave empty or enter `0`
4. Click **"Create Account"**

**Expected Result**:
- ✅ Dashboard shows:
  - Income: ₹0
  - Expenses: ₹0
  - Savings: ₹0
  - "No transactions yet. Add your first transaction to get started!"
  - Chart says "No expenses yet"
- ✅ NO fake ₹500 or ₹600 transactions
- ✅ NO hardcoded ₹50,000 income

### Test 2: Add Income

1. Click **"Settings"** in sidebar
2. Change **"Monthly income"** to: `50000`
3. Click **"Save changes"**
4. Toast message: "Income updated!"

**Expected Result**:
- ✅ Dashboard now shows:
  - Income: ₹50,000
  - Expenses: ₹0
  - Savings: ₹50,000
  - Savings rate: 100.0% of income

### Test 3: Data Persistence

1. **Refresh the page** (press F5)
   - ✅ Income still shows ₹50,000
2. **Open new tab**: `http://localhost:3000/app.html`
   - ✅ Income shows ₹50,000 (same data)
3. **Close browser completely**
4. **Reopen browser**: `http://localhost:3000/app.html`
   - ✅ Income STILL shows ₹50,000
   - ✅ Data survived browser restart!

### Test 4: Add Transaction

1. Click **"+ Add entry"** button (top right)
2. Enter: `Bought groceries from supermarket ₹2500`
3. Click **"Add to ledger"**
4. Toast: "Transaction added!"

**Expected Result**:
- ✅ Dashboard updates:
  - Expenses: ₹2,500
  - Savings: ₹47,500
  - Savings rate: 95.0%
  - Recent entries shows "Supermarket ₹2,500"
  - Chart shows "Shopping" bar with ₹2,500
- ✅ Go to "Transactions" tab → shows 1 transaction

### Test 5: Transaction Persistence

1. **Refresh page** → Transaction still there ✅
2. **Close and reopen browser** → Transaction STILL there ✅

---

## ✅ Success Criteria

Your app is working correctly if:

- [ ] New users see ₹0 empty state (not ₹50,000)
- [ ] No fake demo transactions appear (no ₹500/₹600 entries)
- [ ] Income entered in Settings persists after refresh
- [ ] Transactions added persist after browser restart
- [ ] Charts show "No expenses yet" when empty (no errors)
- [ ] Different users see different data (isolated)

---

## 📖 Detailed Documentation

For comprehensive testing and troubleshooting:

- **TESTING-GUIDE.md** - 10 detailed test scenarios
- **IMPLEMENTATION-STATUS.md** - Technical details of changes made
- **database-schema.sql** - Database table definitions

---

## 🐛 Common Issues

### Issue: "Failed to load user data"
**Cause**: Database tables not created  
**Fix**: Run `database-schema.sql` in Supabase (see Step 1 above)

### Issue: Email validation error
**Cause**: Using `test@example.com` (Supabase blocks example.com)  
**Fix**: Use real email domain like `@gmail.com`, `@yahoo.com`

### Issue: "No authorization token"
**Cause**: Not logged in  
**Fix**: Logout and login again

### Issue: Server not responding
**Cause**: Server not running or wrong port  
**Fix**: 
1. Make sure `node server.js` is running
2. Check it says "Server running on http://localhost:3000"
3. Make sure you're accessing `localhost:3000` (not 8000 or other port)

---

## 🎯 What Happens Behind the Scenes

### When You Add a Transaction:

```
You type: "Zomato biryani ₹320"
    ↓
App parses: merchant="Zomato", amount=320, category="Food"
    ↓
Saves to Supabase database (transactions table)
    ↓
Updates local state.transactions array
    ↓
Refreshes all views (Dashboard, Transactions, Reports)
    ↓
Data persists forever (survives refresh, browser restart, etc.)
```

### When You Open the App:

```
Browser loads app.html
    ↓
auth-check.js verifies you're logged in
    ↓
database.js calls 4 API endpoints in parallel:
  - GET /api/profile (your income)
  - GET /api/transactions (your transactions)
  - GET /api/goals (your financial goals)
  - GET /api/subscriptions (your subscriptions)
    ↓
Updates window.state object with YOUR data
    ↓
app.js renders dashboard with YOUR numbers
    ↓
If no data → shows empty state messages
```

---

## 🔒 Security

- ✅ Each user can only see their own data (RLS policies)
- ✅ Authentication via JWT tokens
- ✅ Server validates tokens on every request
- ✅ Database queries filtered by `user_id`

---

## 🚀 Next Features to Add

After confirming basic functionality works:

1. **Bulk import** - Upload CSV of transactions
2. **Budget alerts** - Notify when spending exceeds limits
3. **Expense categories** - Customize your own categories
4. **Monthly trends** - Charts comparing month-over-month
5. **Data export** - Download all your data as CSV/PDF
6. **Recurring transactions** - Auto-add monthly bills

---

## 📞 Need Help?

1. Check **browser console** (F12 → Console tab) for errors
2. Check **server logs** (terminal running `node server.js`)
3. Check **Supabase logs** (Dashboard → Logs)
4. Verify **database tables exist** (Table Editor)

---

## 🎉 You're Done!

If all 5 tests pass, your app is fully functional with:
- ✅ No mock data
- ✅ Empty state for new users
- ✅ Real database persistence
- ✅ Data survives browser restarts

**Enjoy your personal finance app! 💰**
