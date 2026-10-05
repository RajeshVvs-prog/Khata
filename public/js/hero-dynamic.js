// Dynamic Hero Animations for Khata Landing Page

// 1. Dynamic rotating text under the lede
function initDynamicLede() {
  const phrases = [
    'understands where it went.',
    'spots what changed.',
    'learns your spending patterns.',
    'shows you what comes next.'
  ];
  
  let currentIndex = 0;
  
  // Create dynamic text container
  const ledeEl = document.querySelector('.hero-copy .lede');
  if (!ledeEl) return;
  
  // Split the static part and dynamic part
  const staticText = 'Every rupee leaves a clue. Khata ';
  ledeEl.innerHTML = `${staticText}<span class="dynamic-phrase">${phrases[0]}</span>`;
  
  const dynamicEl = ledeEl.querySelector('.dynamic-phrase');
  
  // Rotate phrases
  setInterval(() => {
    dynamicEl.classList.add('fade-out');
    
    setTimeout(() => {
      currentIndex = (currentIndex + 1) % phrases.length;
      dynamicEl.textContent = phrases[currentIndex];
      dynamicEl.classList.remove('fade-out');
      dynamicEl.classList.add('fade-in');
      
      setTimeout(() => {
        dynamicEl.classList.remove('fade-in');
      }, 500);
    }, 400);
  }, 3500);
}

// 2. Dynamic ledger - show transactions appearing
function initDynamicLedger() {
  const tbody = document.getElementById('hero-rows');
  if (!tbody) return;
  
  // Store original rows
  const transactions = [
    { date: '03 Sep', desc: 'Salary — Sept', withdrawal: '', deposit: '40,000', balance: '52,180', flag: false },
    { date: '04 Sep', desc: 'Zomato — Biryani', withdrawal: '320', deposit: '', balance: '51,860', flag: false },
    { date: '06 Sep', desc: 'Netflix, monthly', withdrawal: '649', deposit: '', balance: '51,211', flag: false },
    { date: '09 Sep', desc: 'Big Bazaar — Shopping', withdrawal: '4,180', deposit: '', balance: '47,031', flag: false },
    { date: '09 Sep', desc: 'Reliance Digital', withdrawal: '12,400', deposit: '', balance: '34,631', flag: true }
  ];
  
  // Clear and show "reading" state
  function showReadingState() {
    tbody.innerHTML = `
      <tr class="reading-state">
        <td colspan="5" style="text-align:center; padding:32px; color:var(--ink-soft);">
          <div class="reading-indicator">
            <span>Khata is reading your month</span>
            <span class="reading-dots"><span>.</span><span>.</span><span>.</span></span>
          </div>
        </td>
      </tr>
    `;
  }
  
  // Show transactions one by one
  function showTransactions() {
    tbody.innerHTML = '';
    
    transactions.forEach((tx, index) => {
      setTimeout(() => {
        const row = document.createElement('tr');
        row.className = 'row-in-live';
        if (tx.flag) row.classList.add('flag');
        
        row.innerHTML = `
          <td>${tx.date}</td>
          <td>${tx.desc}${tx.flag ? ' ⚠' : ''}</td>
          <td${tx.withdrawal ? ' class="debit"' : ''}>${tx.withdrawal}</td>
          <td>${tx.deposit}</td>
          <td>${tx.balance}</td>
        `;
        
        tbody.appendChild(row);
        
        // Show anomaly alert after last transaction
        if (index === transactions.length - 1) {
          setTimeout(() => {
            animateAnomalyNote();
          }, 500);
        }
      }, index * 600);
    });
  }
  
  // Animate the anomaly note
  function animateAnomalyNote() {
    const note = document.querySelector('.passbook-note');
    if (note) {
      note.classList.add('note-pulse');
      setTimeout(() => note.classList.remove('note-pulse'), 1000);
    }
  }
  
  // Start the animation cycle
  function startCycle() {
    showReadingState();
    setTimeout(() => {
      showTransactions();
    }, 2000);
  }
  
  // Initial load
  setTimeout(() => {
    startCycle();
  }, 1000);
  
  // Repeat cycle every 20 seconds
  setInterval(() => {
    startCycle();
  }, 20000);
}

// 3. Update stats to be more credible
function updateStats() {
  const stats = document.querySelector('.hero-stats');
  if (!stats) return;
  
  stats.innerHTML = `
    <div>
      <dt>Transactions<br>supported</dt>
      <dd>1,000+</dd>
    </div>
    <div>
      <dt>Spending<br>categories</dt>
      <dd>20+</dd>
    </div>
    <div>
      <dt>Insight<br>speed</dt>
      <dd>Real-time</dd>
    </div>
  `;
}

// 4. Add dynamic tagline option (Option C - premium/minimal)
function addDynamicTagline() {
  const heroCopy = document.querySelector('.hero-copy');
  if (!heroCopy) return;
  
  const questions = [
    'Where did my money go?',
    'What changed this month?',
    'What will I spend next?',
    'What doesn't look right?'
  ];
  
  let qIndex = 0;
  
  // Insert after lede, before actions
  const ledeEl = heroCopy.querySelector('.lede');
  const actionsEl = heroCopy.querySelector('.hero-actions');
  
  const taglineContainer = document.createElement('div');
  taglineContainer.className = 'hero-tagline';
  taglineContainer.innerHTML = `
    <p class="tagline-static">One ledger. Different questions.</p>
    <p class="tagline-dynamic">${questions[0]}</p>
  `;
  
  heroCopy.insertBefore(taglineContainer, actionsEl);
  
  const dynamicQuestion = taglineContainer.querySelector('.tagline-dynamic');
  
  // Rotate questions
  setInterval(() => {
    dynamicQuestion.classList.add('fade-out');
    
    setTimeout(() => {
      qIndex = (qIndex + 1) % questions.length;
      dynamicQuestion.textContent = questions[qIndex];
      dynamicQuestion.classList.remove('fade-out');
      dynamicQuestion.classList.add('fade-in');
      
      setTimeout(() => {
        dynamicQuestion.classList.remove('fade-in');
      }, 500);
    }, 400);
  }, 4000);
}

// 5. Add "Your month, at a glance" cards below hero
function addMonthGlanceSection() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  
  const glanceSection = document.createElement('section');
  glanceSection.className = 'month-glance wrap';
  glanceSection.innerHTML = `
    <h3 class="glance-title">Your month, at a glance.</h3>
    <div class="glance-cards">
      <div class="glance-card">
        <div class="glance-amount mono">₹18,240</div>
        <div class="glance-label">Spent this month</div>
        <div class="glance-meta">↓ 8% from August</div>
      </div>
      <div class="glance-card">
        <div class="glance-amount mono">₹6,420</div>
        <div class="glance-label">Food & dining</div>
        <div class="glance-meta">24% of spending</div>
      </div>
      <div class="glance-card glance-alert">
        <div class="glance-amount mono">⚠ ₹12,400</div>
        <div class="glance-label">Unusual purchase</div>
        <div class="glance-meta">2.8× your usual</div>
      </div>
    </div>
  `;
  
  hero.parentNode.insertBefore(glanceSection, hero.nextSibling);
}

// Initialize all animations
document.addEventListener('DOMContentLoaded', () => {
  initDynamicLede();
  initDynamicLedger();
  updateStats();
  addDynamicTagline();
  addMonthGlanceSection();
});
