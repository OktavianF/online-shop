// DOM Elements
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');
const registerSuccess = document.getElementById('register-success');
const togglePasswordButtons = document.querySelectorAll('.toggle-password');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Handle login form submission
  loginForm?.addEventListener('submit', handleLogin);
  
  // Handle register form submission
  registerForm?.addEventListener('submit', handleRegister);
  
  // Handle password visibility toggle
  togglePasswordButtons.forEach(button => {
    button.addEventListener('click', togglePasswordVisibility);
  });
});

// Handle Login
async function handleLogin(e) {
  e.preventDefault();
  
  // Hide previous error message
  if (loginError) loginError.classList.add('hidden');
  
  // Get form data
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const remember = document.getElementById('remember')?.checked || false;
  
  try {
    // Call login API
    const response = await fetch('../php/api/auth.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'login',
        email,
        password,
        remember
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    
    // Login successful
    // Store token and user data in localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Redirect to homepage
    window.location.href = '/';
  } catch (error) {
    console.error('Login error:', error);
    
    // Show error message
    if (loginError) {
      loginError.textContent = error.message || 'Failed to login. Please try again.';
      loginError.classList.remove('hidden');
    }
    
    // For development purposes, simulate successful login
    if (process.env.NODE_ENV !== 'production') {
      simulateSuccessfulLogin(email);
    }
  }
}

// Handle Register
async function handleRegister(e) {
  e.preventDefault();
  
  // Hide previous messages
  if (registerError) registerError.classList.add('hidden');
  if (registerSuccess) registerSuccess.classList.add('hidden');
  
  // Get form data
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone')?.value || '';
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  
  // Validate passwords match
  if (password !== confirmPassword) {
    if (registerError) {
      registerError.textContent = 'Passwords do not match';
      registerError.classList.remove('hidden');
    }
    return;
  }
  
  try {
    // Call register API
    const response = await fetch('../php/api/auth.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'register',
        name,
        email,
        phone,
        password
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    
    // Registration successful
    if (registerSuccess) {
      registerSuccess.textContent = 'Registration successful! You can now login.';
      registerSuccess.classList.remove('hidden');
    }
    
    // Clear the form
    registerForm.reset();
    
    // Redirect to login page after a delay
    setTimeout(() => {
      window.location.href = '../pages/login.html';
    }, 2000);
  } catch (error) {
    console.error('Registration error:', error);
    
    // Show error message
    if (registerError) {
      registerError.textContent = error.message || 'Failed to register. Please try again.';
      registerError.classList.remove('hidden');
    }
    
    // For development purposes, simulate successful registration
    if (process.env.NODE_ENV !== 'production') {
      simulateSuccessfulRegistration();
    }
  }
}

// Toggle Password Visibility
function togglePasswordVisibility(e) {
  const button = e.currentTarget;
  const passwordField = button.parentElement.querySelector('input');
  const icon = button.querySelector('.material-icons');
  
  if (passwordField.type === 'password') {
    passwordField.type = 'text';
    icon.textContent = 'visibility_off';
  } else {
    passwordField.type = 'password';
    icon.textContent = 'visibility';
  }
}

// Development Only - Simulate successful login
function simulateSuccessfulLogin(email) {
  // Create mock user data
  const mockUser = {
    id: 1,
    name: email.split('@')[0],
    email: email,
    is_seller: email.includes('seller'),
    created_at: new Date().toISOString()
  };
  
  // Store mock token and user data
  localStorage.setItem('token', 'mock-token-' + Math.random().toString(36).substring(2));
  localStorage.setItem('user', JSON.stringify(mockUser));
  
  // Redirect after a short delay
  setTimeout(() => {
    window.location.href = '/';
  }, 1000);
}

// Development Only - Simulate successful registration
function simulateSuccessfulRegistration() {
  if (registerSuccess) {
    registerSuccess.textContent = 'Registration successful! You can now login.';
    registerSuccess.classList.remove('hidden');
  }
  
  // Clear the form
  if (registerForm) registerForm.reset();
  
  // Redirect to login page after a delay
  setTimeout(() => {
    window.location.href = '../pages/login.html';
  }, 2000);
}