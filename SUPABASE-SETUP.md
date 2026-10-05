# Supabase Setup Instructions

## ⚠️ Important: Disable Email Confirmation for Testing

By default, Supabase requires users to confirm their email before they can log in. For local testing and development, you should disable this.

### Step 1: Go to Supabase Dashboard

1. Open your browser and go to: **https://supabase.com/dashboard**
2. Sign in to your account
3. Select your project: **cynwexechtjqtrhatldw**

### Step 2: Disable Email Confirmation

1. Click on **"Authentication"** in the left sidebar
2. Click on **"Providers"** or **"Settings"**
3. Scroll down to **"Email Auth"** section
4. Find the setting: **"Enable email confirmations"**
5. **Toggle it OFF** (disable it)
6. Click **"Save"** at the bottom

### Step 3: Allow Test Email Domains (Optional)

If you want to use test emails like `test@example.com`:

1. Still in Authentication settings
2. Look for **"Site URL"** or **"Additional Settings"**
3. Some Supabase versions block certain email domains
4. **Recommendation:** Just use real email formats like:
   - `yourname@gmail.com`
   - `user@outlook.com`
   - Any real domain name

You don't need to actually own the email - Supabase won't send emails if confirmation is disabled!

### Step 4: Test Again

After disabling email confirmation:

1. Refresh your browser page: http://localhost:3000/test-auth.html
2. Change the email to a real domain format (e.g., `myname@gmail.com`)
3. Click **"Test Signup"**
4. Then click **"Test Login"**
5. Should work! ✅

---

## 🔍 What Email to Use?

### ❌ These DON'T work (blocked by Supabase):
- `test@example.com`
- `user@test.com`
- `demo@demo.com`

### ✅ These DO work:
- `rajesh@gmail.com`
- `testuser123@outlook.com`
- `myapp@yahoo.com`
- `yourname@yourdomain.com`

**Note:** You don't need to actually have access to these emails if email confirmation is disabled!

---

## 🐛 Troubleshooting

### Still getting "Invalid credentials" error?

1. Make sure you disabled email confirmations in Supabase dashboard
2. Try creating a NEW account with a different email
3. Use a real email domain like @gmail.com, @outlook.com, etc.

### "Email already exists" error?

Good! That means signup worked. Just try logging in with that email and password.

### Can't access Supabase dashboard?

You'll need the Supabase account credentials that were used to create the project with URL: `https://cynwexechtjqtrhatldw.supabase.co`

---

## 📝 Quick Test Checklist

- [ ] Disable email confirmation in Supabase dashboard
- [ ] Use real email domain (like @gmail.com)
- [ ] Password must be at least 6 characters
- [ ] Test signup first, then login
- [ ] Check server terminal for any errors

---

## 🎯 After Configuration

Once email confirmation is disabled, you can:
1. Create accounts instantly
2. Login immediately after signup
3. No email verification needed
4. Perfect for local development!
