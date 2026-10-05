// ===================== Category chart =====================
const ctx = document.getElementById('categoryChart');
if (ctx && window.Chart) {
  const inkSoft = '#55594C';
  const rule = 'rgba(35,38,31,0.16)';

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Shopping', 'Food', 'Bills', 'Other', 'Transport'],
      datasets: [{
        data: [12400, 7200, 5000, 5700, 2100],
        backgroundColor: ['#A23E36', '#2E4A34', '#2E4A34', '#2E4A34', '#2E4A34'],
        borderRadius: 1,
        maxBarThickness: 34
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false }, tooltip: {
        callbacks: { label: (item) => '\u20b9' + item.raw.toLocaleString('en-IN') }
      }},
      scales: {
        x: { grid: { display: false }, ticks: { color: inkSoft, font: { family: 'IBM Plex Sans', size: 11 } } },
        y: {
          grid: { color: rule },
          ticks: {
            color: inkSoft,
            font: { family: 'IBM Plex Mono', size: 10 },
            callback: (v) => '\u20b9' + (v / 1000) + 'k'
          }
        }
      }
    }
  });
}

// ===================== Health score ring =====================
const ring = document.getElementById('sealRing');
if (ring) {
  const circumference = 2 * Math.PI * 52; // ~326.7
  const score = 78;
  const offset = circumference - (score / 100) * circumference;
  requestAnimationFrame(() => {
    ring.style.strokeDashoffset = offset;
  });
}

// ===================== Assistant canned responses =====================
const chatWindow = document.getElementById('chatWindow');
const chatSuggestions = document.getElementById('chatSuggestions');

const RESPONSES = {
  why: {
    q: 'Why did I spend so much this month?',
    a: `<p>Total spending is up 23% on August. Two categories account for almost all of it:</p>
        <table>
          <tr><td>Shopping</td><td class="mono">+&#8377;2,100</td></tr>
          <tr><td>Food</td><td class="mono">+&#8377;1,850</td></tr>
        </table>
        <p style="margin-top:10px;">Everything else moved less than 5%.</p>`
  },
  afford: {
    q: 'Can I afford &#8377;5,000 shoes?',
    a: `<p>You can — but it isn't free. Buying them now would take projected savings from <strong>&#8377;8,000</strong> to <strong>&#8377;3,000</strong> this month, and push your bike goal back by roughly 3 weeks.</p>`
  },
  predict: {
    q: "What will next month look like?",
    a: `<p>Based on the last three months, here's the forecast:</p>
        <table>
          <tr><td>Food</td><td class="mono">&#8377;4,200 &rarr; &#8377;4,600</td></tr>
          <tr><td>Shopping</td><td class="mono">&#8377;3,800 &rarr; &#8377;4,500</td></tr>
          <tr><td>Bills</td><td class="mono">&#8377;5,000 &rarr; &#8377;5,000</td></tr>
        </table>
        <p style="margin-top:10px;">Estimated total: <strong>&#8377;16,400</strong>, about &#8377;1,300 more than this month.</p>`
  }
};

function addMessage(role, html) {
  const el = document.createElement('div');
  el.className = 'chat-msg ' + role;
  el.innerHTML = html;
  chatWindow.appendChild(el);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

if (chatSuggestions) {
  chatSuggestions.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const key = btn.getAttribute('data-q');
    const item = RESPONSES[key];
    if (!item) return;

    addMessage('user', '<p>' + item.q + '</p>');
    btn.disabled = true;

    const thinking = document.createElement('div');
    thinking.className = 'chat-msg bot';
    thinking.innerHTML = '<p>Reading the ledger&hellip;</p>';
    chatWindow.appendChild(thinking);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    setTimeout(() => {
      thinking.remove();
      addMessage('bot', item.a);
    }, 650);
  });
}

// ===================== What-if simulator =====================
const simAmount = document.getElementById('simAmount');
const simAmountLabel = document.getElementById('simAmountLabel');
const simHint = document.getElementById('simHint');
const simSavingsAfter = document.getElementById('simSavingsAfter');
const simGoalAfter = document.getElementById('simGoalAfter');
const simEmergency = document.getElementById('simEmergency');

const BASE_SAVINGS = 20000;
const BASE_GOAL_MONTHS = 8;
const EMERGENCY_FUND = 42000;

function formatINR(n) {
  return '\u20b9' + Math.max(0, Math.round(n)).toLocaleString('en-IN');
}

function hintFor(amount) {
  if (amount === 0) return 'no purchase';
  if (amount <= 10000) return 'e.g. new shoes or a phone accessory';
  if (amount <= 40000) return 'e.g. a phone upgrade';
  if (amount <= 90000) return 'e.g. a laptop';
  return 'e.g. a short trip or a big-ticket gadget';
}

function updateSimulator() {
  const amount = Number(simAmount.value);
  simAmountLabel.textContent = formatINR(amount);
  simHint.textContent = hintFor(amount);

  const savingsAfter = BASE_SAVINGS - amount;
  simSavingsAfter.textContent = formatINR(savingsAfter);
  simSavingsAfter.style.color = savingsAfter < 0 ? 'var(--stamp-red)' : '';

  const extraMonths = Math.round((amount / BASE_SAVINGS) * 3);
  simGoalAfter.textContent = (BASE_GOAL_MONTHS + extraMonths) + ' months';

  const fundAfterHit = amount > EMERGENCY_FUND * 0.6;
  simEmergency.textContent = fundAfterHit ? '\u26a0 Low' : 'Safe';
  simEmergency.classList.toggle('status-warn', fundAfterHit);
}

if (simAmount) {
  simAmount.addEventListener('input', updateSimulator);
  updateSimulator();
}
