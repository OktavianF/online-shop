// Global variables
let isAuthenticated = false;
let userData = null;

// DOM Elements
const userMenuToggle = document.getElementById('user-menu-toggle');
const userDropdown = document.getElementById('user-dropdown');
const authSection = document.getElementById('auth-section');
const userSection = document.getElementById('user-section');
const searchToggle = document.getElementById('search-toggle');
const searchBar = document.getElementById('search-bar');
const logoutBtn = document.getElementById('logout-btn');
const cartCountElement = document.getElementById('cart-count');
const sellerDashboardLink = document.getElementById('seller-dashboard-link');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  initApp();
  
  // User menu toggle
  userMenuToggle?.addEventListener('click', () => {
    userDropdown.classList.toggle('active');
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#user-menu') && userDropdown?.classList.contains('active')) {
      userDropdown.classList.remove('active');
    }
  });
  
  // Search toggle
  searchToggle?.addEventListener('click', () => {
    searchBar.classList.toggle('active');
    if (searchBar.classList.contains('active')) {
      document.getElementById('search-input').focus();
    }
  });
  
  // Logout button
  logoutBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  });
});

// Initialize Application
function initApp() {
  checkAuthStatus();
  updateCartCount();
}

// Check Authentication Status
function checkAuthStatus() {
  const token = localStorage.getItem('token');
  
  if (token) {
    // In a real app, we would validate the token with the server
    // For this demo, we'll just check if it exists
    isAuthenticated = true;
    
    // Get user data from localStorage (in a real app, you'd fetch from server)
    try {
      userData = JSON.parse(localStorage.getItem('user'));
      updateUIForAuthenticatedUser();
    } catch (error) {
      console.error('Failed to parse user data:', error);
      logout(); // Clear invalid data
    }
  } else {
    isAuthenticated = false;
    updateUIForUnauthenticatedUser();
  }
}

// Update UI for authenticated user
function updateUIForAuthenticatedUser() {
  if (authSection) authSection.classList.add('hidden');
  if (userSection) userSection.classList.remove('hidden');
  
  // Show seller dashboard link if user is a seller
  if (userData && userData.is_seller && sellerDashboardLink) {
    sellerDashboardLink.classList.remove('hidden');
  }
}

// Update UI for unauthenticated user
function updateUIForUnauthenticatedUser() {
  if (authSection) authSection.classList.remove('hidden');
  if (userSection) userSection.classList.add('hidden');
  if (sellerDashboardLink) sellerDashboardLink.classList.add('hidden');
}

// Logout Function
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  isAuthenticated = false;
  userData = null;
  updateUIForUnauthenticatedUser();
  
  // Redirect to home page if we're on a protected page
  const currentPath = window.location.pathname;
  if (
    currentPath.includes('../pages/profile.html') || 
    currentPath.includes('../pages/orders.html') ||
    currentPath.includes('../pages/seller-dashboard.php')
  ) {
    window.location.href = '/';
  }
}

// Update Cart Count
function updateCartCount() {
  // Get cart from localStorage
  try {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
    if (cartCountElement) {
      cartCountElement.textContent = itemCount.toString();
    }
  } catch (error) {
    console.error('Failed to parse cart data:', error);
    if (cartCountElement) {
      cartCountElement.textContent = '0';
    }
  }
}

// Add to Cart Function
function addToCart(productId, productName, price, quantity = 1, image) {
  try {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex(item => item.id === productId);
    
    if (existingItemIndex !== -1) {
      // Update quantity if product exists
      cart[existingItemIndex].quantity += quantity;
    } else {
      // Add new product to cart
      cart.push({
        id: productId,
        name: productName,
        price: price,
        quantity: quantity,
        image: image
      });
    }
    
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
    
    // Show success message
    showToast('Added to cart successfully!', 'success');
  } catch (error) {
    console.error('Failed to add item to cart:', error);
    showToast('Failed to add item to cart', 'error');
  }
}

// Toast notification
function showToast(message, type = 'info') {
  // Create toast element if it doesn't exist
  let toastContainer = document.querySelector('.toast-container');
  
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
    
    // Add styles for toast container
    toastContainer.style.position = 'fixed';
    toastContainer.style.bottom = '20px';
    toastContainer.style.right = '20px';
    toastContainer.style.zIndex = '1000';
  }
  
  // Create toast
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  // Add styles for toast
  toast.style.backgroundColor = type === 'success' ? '#02c39a' : 
                               type === 'error' ? '#d90429' : 
                               type === 'warning' ? '#ffdd00' : '#3a86ff';
  toast.style.color = type === 'warning' ? '#212121' : '#ffffff';
  toast.style.padding = '12px 16px';
  toast.style.borderRadius = '8px';
  toast.style.marginTop = '8px';
  toast.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
  toast.style.transition = 'all 0.3s ease';
  toast.style.opacity = '0';
  toast.style.transform = 'translateY(20px)';
  
  // Add to container
  toastContainer.appendChild(toast);
  
  // Trigger animation
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  }, 10);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      toastContainer.removeChild(toast);
    }, 300);
  }, 3000);
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
}

// Export functions for use in other modules
export {
  isAuthenticated,
  userData,
  addToCart,
  updateCartCount,
  showToast,
  formatCurrency
};