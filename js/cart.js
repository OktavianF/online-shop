import { formatCurrency, showToast } from './main.js';

// DOM Elements
const cartItemsContainer = document.getElementById('cart-items-container');
const emptyCartElement = document.getElementById('empty-cart');
const cartSummaryElement = document.getElementById('cart-summary');
const subtotalElement = document.getElementById('subtotal');
const shippingElement = document.getElementById('shipping');
const taxElement = document.getElementById('tax');
const totalElement = document.getElementById('total');
const checkoutBtn = document.getElementById('checkout-btn');

// Constants
const TAX_RATE = 0.11; // 11% tax rate
const SHIPPING_RATE = 15000; // Rp 15,000 flat shipping rate
const FREE_SHIPPING_THRESHOLD = 500000; // Free shipping for orders over Rp 500,000

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  loadCartItems();
  
  // Check if user is authenticated before checkout
  checkoutBtn?.addEventListener('click', (e) => {
    const isAuthenticated = localStorage.getItem('token') !== null;
    
    if (!isAuthenticated) {
      e.preventDefault();
      showToast('Please login to continue to checkout', 'warning');
      
      // Store the return URL for after login
      localStorage.setItem('returnUrl', '../pages/checkout.html');
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        window.location.href = '../pages/login.html';
      }, 1500);
    }
  });
});

// Load Cart Items
function loadCartItems() {
  try {
    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Hide loader
    const loader = cartItemsContainer?.querySelector('.cart-loader');
    if (loader) loader.classList.add('hidden');
    
    // If cart is empty, show empty message
    if (cart.length === 0) {
      if (emptyCartElement) emptyCartElement.classList.remove('hidden');
      if (cartSummaryElement) cartSummaryElement.classList.add('hidden');
      return;
    }
    
    // Show cart summary
    if (cartSummaryElement) cartSummaryElement.classList.remove('hidden');
    
    // Create cart items elements
    const cartItemsElement = document.createElement('div');
    cartItemsElement.className = 'cart-items';
    
    // Add each cart item
    cart.forEach(item => {
      const cartItemElement = createCartItemElement(item);
      cartItemsElement.appendChild(cartItemElement);
    });
    
    // Add to container
    if (cartItemsContainer) {
      cartItemsContainer.innerHTML = '';
      cartItemsContainer.appendChild(cartItemsElement);
    }
    
    // Update summary
    updateCartSummary(cart);
  } catch (error) {
    console.error('Failed to load cart items:', error);
    showToast('Failed to load cart items', 'error');
  }
}

// Create Cart Item Element
function createCartItemElement(item) {
  const cartItem = document.createElement('div');
  cartItem.className = 'cart-item';
  cartItem.dataset.id = item.id;

  const imageSrc = item.image.startsWith('http') ? item.image : `../${item.image}`;
  
  cartItem.innerHTML = `
    <img src="${imageSrc}" alt="${item.name}" class="cart-item-image">
    <div class="cart-item-details">
      <h3 class="cart-item-name">${item.name}</h3>
      <p class="cart-item-price">${formatCurrency(item.price)}</p>
      <div class="cart-item-actions">
        <div class="quantity-control">
          <button class="quantity-btn decrease-btn" data-id="${item.id}">-</button>
          <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="99" data-id="${item.id}">
          <button class="quantity-btn increase-btn" data-id="${item.id}">+</button>
        </div>
        <button class="remove-item" data-id="${item.id}">
          <span class="material-icons">delete</span> Remove
        </button>
      </div>
    </div>
  `;
  
  // Add event listeners for quantity control
  const decreaseBtn = cartItem.querySelector('.decrease-btn');
  const increaseBtn = cartItem.querySelector('.increase-btn');
  const quantityInput = cartItem.querySelector('.quantity-input');
  const removeBtn = cartItem.querySelector('.remove-item');
  
  decreaseBtn.addEventListener('click', () => {
    updateCartItemQuantity(item.id, Math.max(1, item.quantity - 1));
  });
  
  increaseBtn.addEventListener('click', () => {
    updateCartItemQuantity(item.id, Math.min(99, item.quantity + 1));
  });
  
  quantityInput.addEventListener('change', (e) => {
    const newQuantity = parseInt(e.target.value, 10);
    if (isNaN(newQuantity) || newQuantity < 1) {
      e.target.value = item.quantity;
      return;
    }
    updateCartItemQuantity(item.id, Math.min(99, newQuantity));
  });
  
  removeBtn.addEventListener('click', () => {
    removeCartItem(item.id);
  });
  
  return cartItem;
}

// Update Cart Item Quantity
function updateCartItemQuantity(id, newQuantity) {
  try {
    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Find item index
    const itemIndex = cart.findIndex(item => item.id === id);
    
    if (itemIndex === -1) return;
    
    // Update quantity
    cart[itemIndex].quantity = newQuantity;
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update UI
    const quantityInput = document.querySelector(`.quantity-input[data-id="${id}"]`);
    if (quantityInput) quantityInput.value = newQuantity;
    
    // Update cart summary
    updateCartSummary(cart);
    
    // Update cart count in header
    updateCartCount();
  } catch (error) {
    console.error('Failed to update cart item quantity:', error);
    showToast('Failed to update quantity', 'error');
  }
}

// Remove Cart Item
function removeCartItem(id) {
  try {
    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Remove item
    const updatedCart = cart.filter(item => item.id !== id);
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    // Update UI
    const cartItem = document.querySelector(`.cart-item[data-id="${id}"]`);
    if (cartItem) {
      cartItem.style.opacity = '0';
      cartItem.style.transform = 'translateX(30px)';
      
      setTimeout(() => {
        cartItem.remove();
        
        // If cart is empty now, show empty message
        if (updatedCart.length === 0) {
          if (emptyCartElement) emptyCartElement.classList.remove('hidden');
          if (cartSummaryElement) cartSummaryElement.classList.add('hidden');
        }
      }, 300);
    }
    
    // Update cart summary
    updateCartSummary(updatedCart);
    
    // Update cart count in header
    updateCartCount();
    
    // Show toast
    showToast('Item removed from cart', 'info');
  } catch (error) {
    console.error('Failed to remove cart item:', error);
    showToast('Failed to remove item', 'error');
  }
}

// Update Cart Summary
function updateCartSummary(cart) {
  if (!subtotalElement || !shippingElement || !taxElement || !totalElement) return;
  
  // Calculate subtotal
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Calculate shipping (free shipping above threshold)
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_RATE;
  
  // Calculate tax
  const tax = subtotal * TAX_RATE;
  
  // Calculate total
  const total = subtotal + shipping + tax;
  
  // Update UI
  subtotalElement.textContent = formatCurrency(subtotal);
  shippingElement.textContent = shipping === 0 ? 'Free' : formatCurrency(shipping);
  taxElement.textContent = formatCurrency(tax);
  totalElement.textContent = formatCurrency(total);
  
  // Save cart summary for checkout
  localStorage.setItem('cartSummary', JSON.stringify({
    subtotal,
    shipping,
    tax,
    total
  }));
}

// Update Cart Count (imported from main.js, but redefined here for completeness)
function updateCartCount() {
  // Get cart from localStorage
  try {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
      cartCountElement.textContent = itemCount.toString();
    }
  } catch (error) {
    console.error('Failed to parse cart data:', error);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
      cartCountElement.textContent = '0';
    }
  }
}