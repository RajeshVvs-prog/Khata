// Check if user is authenticated
function checkAuth() {
  const session = localStorage.getItem('khata_session');
  const user = localStorage.getItem('khata_user');
  
  if (!session || !user) {
    // Not authenticated, redirect to login
    window.location.href = 'login.html';
    return null;
  }
  
  return {
    session: JSON.parse(session),
    user: JSON.parse(user)
  };
}

// Update UI with user info
function updateUserUI() {
  const auth = checkAuth();
  if (!auth) return;
  
  const user = auth.user;
  
  // Update demo badge with user name
  const demoBadge = document.querySelector('.demo-badge');
  if (demoBadge && user.user_metadata?.full_name) {
    demoBadge.textContent = user.user_metadata.full_name;
  }
  
  // Update settings form with user data
  const settingsForm = document.querySelector('#view-settings');
  if (settingsForm) {
    const nameInput = settingsForm.querySelector('input[type="text"]');
    if (nameInput && user.user_metadata?.full_name) {
      nameInput.value = user.user_metadata.full_name;
    }
    
    const incomeInput = settingsForm.querySelector('#settingsIncome');
    if (incomeInput && user.user_metadata?.monthly_income) {
      incomeInput.value = user.user_metadata.monthly_income;
      
      // Also update the dashboard income stat
      const statIncome = document.getElementById('statIncome');
      if (statIncome) {
        statIncome.textContent = user.user_metadata.monthly_income;
      }
      
      // Update report income
      const repIncome = document.getElementById('repIncome');
      if (repIncome) {
        repIncome.textContent = user.user_metadata.monthly_income;
      }
    }
  }
}

// Logout function
function logout() {
  localStorage.removeItem('khata_session');
  localStorage.removeItem('khata_user');
  window.location.href = 'login.html';
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    updateUserUI();
    
    // Add logout handler
    const logoutBtn = document.querySelector('.sidebar-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
      });
    }

    // Debug: check session
    const session = localStorage.getItem('khata_session');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        console.log('✅ Session found, token:', parsed.access_token ? 'exists' : 'MISSING');
      } catch (e) {
        console.error('❌ Session JSON parse error - clearing bad session');
        localStorage.removeItem('khata_session');
        localStorage.removeItem('khata_user');
        window.location.href = 'login.html';
      }
    } else {
      console.warn('⚠️ No session in localStorage');
    }
  });
} else {
  updateUserUI();
}
