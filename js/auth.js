document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');

  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }

  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);

    // Toggle password visibility
    const toggleBtn = loginForm.querySelector('.toggle-password');
    const passwordInput = loginForm.querySelector('#login-password');
    if (toggleBtn && passwordInput) {
      toggleBtn.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        toggleBtn.querySelector('.material-icons').textContent = isPassword ? 'visibility_off' : 'visibility';
      });
    }
  }
});

async function handleRegister(e) {
  e.preventDefault();

  const name = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value.trim();
  const phone = document.getElementById('register-phone').value.trim();

  const payload = {
    action: 'register',
    name,
    email,
    password,
    phone
  };

  try {
    const response = await fetch('/online-shop/php/api/auth.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include'
    });

    const text = await response.text();
    console.log('Raw response:', text);
    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      throw new Error('Invalid JSON from server');
    }

    if (result.success) {
      alert('Registration successful! Please login.');
      window.location.href = '/online-shop/pages/login.html';
    } else {
      alert(result.message || 'Registration failed');
    }
  } catch (err) {
    console.error('Registration error:', err);
    alert('Failed to connect to server');
  }
}

async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value.trim();

  const payload = {
    action: 'login',
    email,
    password
  };

  try {
    const response = await fetch('/online-shop/php/api/auth.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include'
    });

    const text = await response.text();
    console.log('Raw response:', text);
    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      throw new Error('Invalid JSON from server');
    }

    if (result.success) {
      localStorage.setItem('user', JSON.stringify(result.user));
      alert('Login successful!');
      window.location.href = `../pages/seller-dashboard.php`;
      // ?user=${result.user.id}
      
    } else {
      alert(result.message || 'Login failed');
    }
    
  } catch (err) {
    console.error('Login error:', err);
    alert('Failed to connect to server');
  }
}