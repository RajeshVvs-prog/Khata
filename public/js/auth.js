const API_URL = '/api';

const tabs = document.querySelectorAll('.auth-tab');
const forms = document.querySelectorAll('.auth-form');

// Tab switching
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    const target = tab.getAttribute('data-tab');
    forms.forEach(f => f.classList.toggle('hidden', f.getAttribute('data-panel') !== target));
  });
});

// Show toast notification
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `auth-toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Login form handler
const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const btn = loginForm.querySelector('button[type="submit"]');
  const originalText = btn.textContent;
  btn.textContent = 'Logging in…';
  btn.disabled = true;
  
  const email = loginForm.querySelector('input[type="email"]').value;
  const password = loginForm.querySelector('input[type="password"]').value;
  
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Store session data
      localStorage.setItem('khata_session', JSON.stringify(data.session));
      localStorage.setItem('khata_user', JSON.stringify(data.user));
      
      showToast('Login successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = 'app.html';
      }, 500);
    } else {
      showToast(data.error || 'Login failed', 'error');
      btn.textContent = originalText;
      btn.disabled = false;
    }
  } catch (error) {
    console.error('Login error:', error);
    showToast('Connection error. Make sure the server is running.', 'error');
    btn.textContent = originalText;
    btn.disabled = false;
  }
});

// Signup form handler
const signupForm = document.getElementById('signupForm');
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const btn = signupForm.querySelector('button[type="submit"]');
  const originalText = btn.textContent;
  btn.textContent = 'Creating account…';
  btn.disabled = true;
  
  const fullName = document.getElementById('signupName').value;
  const monthlyIncome = document.getElementById('signupIncome').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  
  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, fullName, monthlyIncome })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showToast('Account created! Please log in.', 'success');
      // Switch to login tab
      setTimeout(() => {
        tabs[0].click();
        loginForm.querySelector('input[type="email"]').value = email;
      }, 1000);
    } else {
      showToast(data.error || 'Signup failed', 'error');
    }
    
    btn.textContent = originalText;
    btn.disabled = false;
  } catch (error) {
    console.error('Signup error:', error);
    showToast('Connection error. Make sure the server is running.', 'error');
    btn.textContent = originalText;
    btn.disabled = false;
  }
});
