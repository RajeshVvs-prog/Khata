// AI-Powered Financial Assistant using Groq
const API_URL = '/api';

// Get user's financial data for AI context
function getUserFinancialData() {
  const { expenses, savings, rate, byCategory } = computeTotals();
  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
  
  // Get recent transactions as text
  const recentTransactions = state.transactions
    .slice(-10)
    .map(t => `- ${t.merchant}: ₹${t.amount.toLocaleString('en-IN')}`)
    .join('\n');
  
  return {
    income: formatINR(state.income),
    expenses: formatINR(expenses),
    savings: formatINR(savings),
    savingsRate: rate.toFixed(1) + '%',
    topCategory: topCategory ? `${topCategory[0]} - ${formatINR(topCategory[1])}` : 'None',
    healthScore: computeScore(rate) + '/100',
    transactions: recentTransactions,
    goals: state.goals.map(g => `${g.emoji} ${g.name}: ${formatINR(g.saved)}/${formatINR(g.target)}`).join('\n')
  };
}

// Send message to AI assistant
async function askAI(message, onResponse, onError) {
  try {
    const userData = getUserFinancialData();
    
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        message, 
        userData 
      })
    });

    const data = await response.json();

    if (response.ok) {
      onResponse(data.response);
    } else {
      onError(data.error || 'Failed to get AI response');
    }
  } catch (error) {
    console.error('AI request error:', error);
    onError('Connection error. Make sure the server is running.');
  }
}

// Wire up AI chat for a window
function wireAIChat(windowId, suggestionsId, inputFormId, inputId) {
  const win = document.getElementById(windowId);
  const sugg = document.getElementById(suggestionsId);
  const form = document.getElementById(inputFormId);
  const input = document.getElementById(inputId);

  function addMsg(role, html, typing = false) {
    const el = document.createElement('div');
    el.className = 'chat-msg ' + role;
    if (typing) el.classList.add('typing');
    el.innerHTML = html;
    win.appendChild(el);
    win.scrollTop = win.scrollHeight;
    return el;
  }

  // Predefined questions mapping
  const questions = {
    why: 'Why did I spend so much this month?',
    afford: 'Can I afford ₹5,000 shoes?',
    predict: 'What will next month look like?',
    goal: 'Am I on track for my goals?'
  };

  // Handle suggestion clicks
  if (sugg) {
    sugg.addEventListener('click', async (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;

      const question = questions[btn.getAttribute('data-q')];
      if (!question) return;

      // Add user message
      addMsg('user', '<p>' + question + '</p>');

      // Show typing indicator
      const thinking = addMsg('bot', '<p class="typing-indicator"><span></span><span></span><span></span></p>', true);

      // Get AI response
      askAI(
        question,
        (response) => {
          thinking.remove();
          // Format response with paragraphs
          const formatted = response.split('\n').map(p => p.trim()).filter(p => p).map(p => `<p>${p}</p>`).join('');
          addMsg('bot', formatted);
        },
        (error) => {
          thinking.remove();
          addMsg('bot', `<p>Sorry, I encountered an error: ${error}</p>`);
        }
      );
    });
  }

  // Handle custom input
  if (form && input) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;

      // Add user message
      addMsg('user', '<p>' + text.replace(/</g, '&lt;') + '</p>');
      input.value = '';

      // Show typing indicator
      const thinking = addMsg('bot', '<p class="typing-indicator"><span></span><span></span><span></span></p>', true);

      // Get AI response
      askAI(
        text,
        (response) => {
          thinking.remove();
          // Format response with paragraphs
          const formatted = response.split('\n').map(p => p.trim()).filter(p => p).map(p => `<p>${p}</p>`).join('');
          addMsg('bot', formatted);
        },
        (error) => {
          thinking.remove();
          addMsg('bot', `<p>Sorry, I encountered an error: ${error}</p>`);
        }
      );
    });
  }
}

// Initialize AI assistant when page loads
if (document.getElementById('appChatWindow')) {
  // Wait for state to be loaded
  setTimeout(() => {
    wireAIChat('appChatWindow', 'appChatSuggestions', 'chatInputForm', 'chatFreeInput');
  }, 500);
}
