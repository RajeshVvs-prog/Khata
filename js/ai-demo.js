// AI Interaction Demo for Landing Page

function initAIDemo() {
  // Find the assistant section
  const assistantSection = document.getElementById('assistant');
  if (!assistantSection) return;
  
  // Add demo conversation
  const chatWindow = assistantSection.querySelector('#chatWindow');
  if (!chatWindow) return;
  
  // Clear existing content
  chatWindow.innerHTML = '<div class="chat-msg bot"><p>Hi, I\'ve gone through September\'s entries. Ask me anything about them.</p></div>';
  
  // Demo conversations
  const conversations = [
    {
      question: 'Can I afford a ₹15,000 purchase this month?',
      answer: `Yes, but it would put your discretionary spending 18% above your usual monthly pattern.<br><br>Based on your current spending, you have approximately <strong>₹21,300 available</strong> after recurring expenses.<br><br>A ₹15,000 purchase would leave you with ₹6,300 for the rest of the month.`
    },
    {
      question: 'Why did I spend more this month?',
      answer: `Your spending increased by <strong>₹4,200 (15%)</strong> compared to August. Here's the breakdown:<br><br><strong>Shopping:</strong> ₹12,400 (+286% from usual)<br>The Reliance Digital purchase of ₹12,400 is your biggest outlier.<br><br><strong>Food & Dining:</strong> ₹7,200 (+12%)<br>Slightly above average, mostly due to weekend orders.<br><br><strong>Transport:</strong> ₹2,100 (normal range)`
    },
    {
      question: 'What should I cut to save ₹5,000 next month?',
      answer: `Here's a realistic plan to save an extra ₹5,000:<br><br><strong>Reduce dining out by 40%:</strong> Save ₹2,000<br>Cook 3-4 more meals at home per week.<br><br><strong>Skip one large shopping trip:</strong> Save ₹2,500<br>Your average big purchase is ₹4,180.<br><br><strong>Limit small subscriptions:</strong> Save ₹500<br>Review what you actually use.<br><br>This won't feel restrictive and gets you to your goal.`
    }
  ];
  
  let currentConvo = 0;
  
  function showConversation(index) {
    const convo = conversations[index];
    
    // Add user question
    setTimeout(() => {
      const userMsg = document.createElement('div');
      userMsg.className = 'chat-msg user';
      userMsg.innerHTML = `<p>${convo.question}</p>`;
      chatWindow.appendChild(userMsg);
      chatWindow.scrollTop = chatWindow.scrollHeight;
      
      // Add thinking indicator
      setTimeout(() => {
        const thinking = document.createElement('div');
        thinking.className = 'chat-msg bot thinking-msg';
        thinking.innerHTML = '<p class="typing-indicator"><span></span><span></span><span></span></p>';
        chatWindow.appendChild(thinking);
        chatWindow.scrollTop = chatWindow.scrollHeight;
        
        // Add AI response
        setTimeout(() => {
          thinking.remove();
          const botMsg = document.createElement('div');
          botMsg.className = 'chat-msg bot';
          botMsg.innerHTML = `<p>${convo.answer}</p>`;
          chatWindow.appendChild(botMsg);
          chatWindow.scrollTop = chatWindow.scrollHeight;
        }, 1500);
      }, 500);
    }, 500);
  }
  
  // Show first conversation after page load
  setTimeout(() => {
    showConversation(0);
  }, 2000);
  
  // Cycle through conversations
  let cycleIndex = 0;
  setInterval(() => {
    // Clear chat except first message
    chatWindow.innerHTML = '<div class="chat-msg bot"><p>Hi, I\'ve gone through September\'s entries. Ask me anything about them.</p></div>';
    
    cycleIndex = (cycleIndex + 1) % conversations.length;
    showConversation(cycleIndex);
  }, 25000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initAIDemo();
});
