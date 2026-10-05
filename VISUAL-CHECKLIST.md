# ✅ Visual Improvements Checklist

## Open: http://localhost:3000

---

## 🎯 Hero Section

### Look For:
- [ ] **Cleaner hero headline** - More prominent than passbook table
- [ ] **Simplified passbook** - No heavy borders, subtle 1px lines
- [ ] **Row striping** - Hover effects on table rows
- [ ] **Minimal flag** - ⚠ emoji with light background (not heavy box)
- [ ] **Clean stats cards** - 3-column grid with uppercase labels
- [ ] **Better CTAs** - Primary button stands out, secondary is subtler
- [ ] **Generous spacing** - 80px between sections

---

## 📊 Dashboard Section (Scroll to "Written Like a Ledger")

### Look For:
- [ ] **Uniform card heights** - All three panels aligned
- [ ] **24px padding** - Consistent across all cards
- [ ] **Clean borders** - 1px solid #E2E0D2
- [ ] **Single-color bars** - Muted green (no random highlights)
- [ ] **Simplified gauge** - Just the circular meter, no competing bars below
- [ ] **Better alignment** - Content properly spaced

---

## 🔢 Six Habits Section

### Look For:
- [ ] **2x3 Grid** - Two columns, not vertical stack
- [ ] **Muted numbers** - 01, 02 in light gray
- [ ] **No heavy lines** - Just clean gaps between cards
- [ ] **Sans-serif headings** - Not serif
- [ ] **40px gaps** - Nice breathing room

---

## 🧮 Calculator Section ("What if I bought it?")

### Look For:
- [ ] **Centered layout** - Slider has room to breathe
- [ ] **40px padding** - Not cramped
- [ ] **3-column results** - Clean grid below slider
- [ ] **Larger amount display** - 2.6rem size
- [ ] **Better spacing** - All elements properly separated

---

## 🦶 Footer

### Look For:
- [ ] **64px top padding** - Feels grounded
- [ ] **Top border** - 1px line separation
- [ ] **2-column grid** - Description left, links right
- [ ] **Better alignment** - Doesn't float awkwardly

---

## 🔐 Login Page (http://localhost:3000/login.html)

### Look For:
- [ ] **Centered card** - 440px max width
- [ ] **Clean tabs** - Active state with bottom border
- [ ] **Better inputs** - 12px padding, clear focus states
- [ ] **Monthly income field** - Has ID and captures value
- [ ] **Toast notifications** - Success/error messages appear top-right

---

## 📱 App Dashboard (http://localhost:3000/app.html)

### Look For:
- [ ] **Clean sidebar** - 240px width, clear navigation
- [ ] **Active states** - Green left border on active nav item
- [ ] **Stat cards** - 4-column grid with large numbers
- [ ] **Transactions table** - Clean hover states
- [ ] **Chat interface** - 720px max width, rounded messages
- [ ] **Typing indicator** - Animated dots when AI responds

---

## 🤖 AI Assistant (Click "Assistant" in sidebar)

### Look For:
- [ ] **Clean chat bubbles** - 85% max width, rounded corners
- [ ] **Bot messages** - Light background, left-aligned
- [ ] **User messages** - Green background, right-aligned
- [ ] **Suggestion chips** - Bottom bar with preset questions
- [ ] **Input row** - Clean design with send button
- [ ] **Typing animation** - Three bouncing dots while AI thinks

---

## 🎨 Global Design Checks

### Typography:
- [ ] **Serif only in h1/h2** - All other text is sans-serif
- [ ] **Monospace numbers** - All currency/stats use mono font
- [ ] **Consistent sizing** - Clear hierarchy

### Colors:
- [ ] **Better contrast** - Text is clearly readable
- [ ] **Subtle borders** - #E2E0D2 not too dark/light
- [ ] **Clean backgrounds** - White cards on cream paper

### Spacing:
- [ ] **1200px max width** - Content doesn't stretch too wide
- [ ] **80px sections** - Consistent gaps
- [ ] **24px card padding** - All cards match

### Interactions:
- [ ] **Button hovers** - Smooth transitions
- [ ] **Input focus** - Green border appears
- [ ] **Table hover** - Subtle background change
- [ ] **Link hovers** - Color change to green

---

## 📱 Mobile Test (Resize Browser < 900px)

### Look For:
- [ ] **Single column** - Hero stacks vertically
- [ ] **Stats 2-column** - Dashboard stats in 2 cols
- [ ] **Habits stack** - Features go to single column
- [ ] **Sidebar horizontal** - App sidebar becomes top bar
- [ ] **Scrollable nav** - Can scroll through nav items

---

## 🐛 Test All Features

### Authentication:
- [ ] **Create account** - Captures name, income, email, password
- [ ] **Login** - Works with credentials
- [ ] **Income displays** - Shows YOUR income (not ₹50,000)
- [ ] **Logout** - Clears session

### AI Chat:
- [ ] **Click preset question** - AI responds in 1-2 seconds
- [ ] **Type custom question** - Works with any question
- [ ] **Typing indicator** - Shows while waiting
- [ ] **Response formatting** - Paragraphs formatted nicely
- [ ] **Context awareness** - AI knows your financial data

### Dashboard:
- [ ] **Stats update** - Income shows YOUR amount
- [ ] **Charts render** - Bar chart displays
- [ ] **Navigation works** - All sidebar items work
- [ ] **Add transaction** - Modal opens/closes
- [ ] **Goals display** - Cards show properly

---

## ✨ Overall Feel

The design should feel:
- ✅ **Clean** - No visual clutter
- ✅ **Professional** - Consistent and polished
- ✅ **Readable** - Easy to scan and understand
- ✅ **Spacious** - Generous white space
- ✅ **Cohesive** - Everything follows same design language
- ✅ **Modern** - Contemporary UI patterns

---

## 🎉 Success Criteria

If you can check most of these boxes, the design refinement is complete!

**Any issues?** Check the browser console (F12) for errors.

**Need to revert?** Original CSS is backed up in `css/style-backup.css`
