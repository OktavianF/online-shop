import { formatCurrency, showToast } from './main.js';

// DOM Elements - Steps
const shippingStep = document.getElementById('shipping-step');
const paymentStep = document.getElementById('payment-step');
const reviewStep = document.getElementById('review-step');
const orderSuccess = document.getElementById('order-success');

// DOM Elements - Progress
const progressSteps = document.querySelectorAll('.progress-step');
const progressLines = document.querySelectorAll('.progress-line');

// DOM Elements - Navigation Buttons
const toPaymentBtn = document.getElementById('to-payment-btn');
const backToShippingBtn = document.getElementById('back-to-shipping-btn');
const toReviewBtn = document.getElementById('to-review-btn');
const backToPaymentBtn = document.getElementById('back-to-payment-btn');
const editShippingBtn = document.getElementById('edit-shipping-btn');
const editPaymentBtn = document.getElementById('edit-payment-btn');
const placeOrderBtn = document.getElementById('place-order-btn');

// DOM Elements - Forms
const checkoutForm = document.getElementById('checkout-form');
const savedAddresses = document.getElementById('saved-addresses');
const addressForm = document.getElementById('address-form');
const addNewAddressBtn = document.getElementById('add-new-address-btn');

// DOM Elements - Payment Methods
const paymentMethods = document.querySelectorAll('input[name="payment_method"]');
const creditCardForm = document.getElementById('credit-card-form');
const bankTransferForm = document.getElementById('bank-transfer-form');
const eWalletForm = document.getElementById('e-wallet-form');

// DOM Elements - Review
const reviewItems = document.getElementById('review-items');
const reviewAddress = document.getElementById('review-address');
const reviewPayment = document.getElementById('review-payment');
const reviewSubtotal = document.getElementById('review-subtotal');
const reviewShipping = document.getElementById('review-shipping');
const reviewTax = document.getElementById('review-tax');
const reviewTotal = document.getElementById('review-total');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  initCheckout();
  
  // Navigation buttons
  toPaymentBtn?.addEventListener('click', goToPaymentStep);
  backToShippingBtn?.addEventListener('click', goToShippingStep);
  toReviewBtn?.addEventListener('click', goToReviewStep);
  backToPaymentBtn?.addEventListener('click', goToPaymentStep);
  editShippingBtn?.addEventListener('click', goToShippingStep);
  editPaymentBtn?.addEventListener('click', goToPaymentStep);
  
  // Add new address
  addNewAddressBtn?.addEventListener('click', toggleAddressForm);
  
  // Payment method change
  paymentMethods.forEach(method => {
    method.addEventListener('change', handlePaymentMethodChange);
  });
  
  // Form submission
  checkoutForm?.addEventListener('submit', handleOrderSubmission);
});

// Initialize Checkout
function initCheckout() {
  // Check if user is authenticated
  const isAuthenticated = localStorage.getItem('token') !== null;
  
  if (!isAuthenticated) {
    // Redirect to login page
    window.location.href = '../pages/login.html';
    return;
  }
  
  // Check if cart has items
  try {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
      // Redirect to cart page
      window.location.href = '../pages/cart.html';
      return;
    }
    
    // Load cart summary
    const cartSummary = JSON.parse(localStorage.getItem('cartSummary')) || {
      subtotal: 0,
      shipping: 0,
      tax: 0,
      total: 0
    };
    
    // Set review summary values
    if (reviewSubtotal) reviewSubtotal.textContent = formatCurrency(cartSummary.subtotal);
    if (reviewShipping) reviewShipping.textContent = cartSummary.shipping === 0 ? 'Free' : formatCurrency(cartSummary.shipping);
    if (reviewTax) reviewTax.textContent = formatCurrency(cartSummary.tax);
    if (reviewTotal) reviewTotal.textContent = formatCurrency(cartSummary.total);
    
    // Load saved addresses
    loadSavedAddresses();
    
    // Load user data into form
    prefillUserData();
    
    // Load cart items for review
    loadCartItemsForReview(cart);
  } catch (error) {
    console.error('Failed to initialize checkout:', error);
    showToast('Failed to initialize checkout', 'error');
  }
}

// Load Saved Addresses
function loadSavedAddresses() {
  // Get saved addresses from localStorage
  try {
    const addresses = JSON.parse(localStorage.getItem('addresses')) || [];
    
    if (addresses.length > 0 && savedAddresses && addressForm) {
      savedAddresses.classList.remove('hidden');
      addressForm.classList.add('hidden');
      
      const addressList = document.getElementById('address-list');
      addressList.innerHTML = '';
      
      addresses.forEach((address, index) => {
        const addressCard = createAddressCard(address, index);
        addressList.appendChild(addressCard);
      });
    }
  } catch (error) {
    console.error('Failed to load saved addresses:', error);
  }
}

// Create Address Card
function createAddressCard(address, index) {
  const card = document.createElement('div');
  card.className = 'address-card';
  card.dataset.index = index;
  
  card.innerHTML = `
    <div class="address-card-header">
      <div class="address-name">${address.full_name}</div>
      <div class="address-actions">
        <button type="button" class="edit-address" title="Edit address">
          <span class="material-icons">edit</span>
        </button>
        <button type="button" class="delete-address" title="Delete address">
          <span class="material-icons">delete</span>
        </button>
      </div>
    </div>
    <div class="address-content">
      <p>${address.address_line1}</p>
      ${address.address_line2 ? `<p>${address.address_line2}</p>` : ''}
      <p>${address.city}, ${address.postal_code}</p>
      <p>${address.province}, ${address.country}</p>
      <p>Phone: ${address.phone}</p>
    </div>
  `;
  
  // Select address
  card.addEventListener('click', (e) => {
    if (!e.target.closest('.address-actions')) {
      // Remove selected class from all address cards
      document.querySelectorAll('.address-card').forEach(card => {
        card.classList.remove('selected');
      });
      
      // Add selected class to clicked card
      card.classList.add('selected');
      
      // Set selected address for order
      localStorage.setItem('selectedAddress', index.toString());
    }
  });
  
  // Edit address
  const editBtn = card.querySelector('.edit-address');
  editBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    editAddress(index);
  });
  
  // Delete address
  const deleteBtn = card.querySelector('.delete-address');
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    deleteAddress(index);
  });
  
  return card;
}

// Edit Address
function editAddress(index) {
  try {
    const addresses = JSON.parse(localStorage.getItem('addresses')) || [];
    const address = addresses[index];
    
    if (!address) return;
    
    // Show address form
    if (savedAddresses) savedAddresses.classList.add('hidden');
    if (addressForm) addressForm.classList.remove('hidden');
    
    // Fill form with address data
    document.getElementById('full-name').value = address.full_name;
    document.getElementById('phone').value = address.phone;
    document.getElementById('address-line1').value = address.address_line1;
    document.getElementById('address-line2').value = address.address_line2 || '';
    document.getElementById('city').value = address.city;
    document.getElementById('postal-code').value = address.postal_code;
    document.getElementById('province').value = address.province;
    document.getElementById('country').value = address.country;
    
    // Set edit mode
    addressForm.dataset.editIndex = index;
  } catch (error) {
    console.error('Failed to edit address:', error);
    showToast('Failed to edit address', 'error');
  }
}

// Delete Address
function deleteAddress(index) {
  try {
    const addresses = JSON.parse(localStorage.getItem('addresses')) || [];
    
    // Remove address at index
    addresses.splice(index, 1);
    
    // Save updated addresses
    localStorage.setItem('addresses', JSON.stringify(addresses));
    
    // Reload addresses
    loadSavedAddresses();
    
    // Show toast
    showToast('Address deleted successfully', 'success');
  } catch (error) {
    console.error('Failed to delete address:', error);
    showToast('Failed to delete address', 'error');
  }
}

// Toggle Address Form
function toggleAddressForm() {
  if (savedAddresses) savedAddresses.classList.toggle('hidden');
  if (addressForm) {
    addressForm.classList.toggle('hidden');
    
    // Clear form and edit mode
    if (!addressForm.classList.contains('hidden')) {
      addressForm.reset();
      delete addressForm.dataset.editIndex;
    }
  }
}

// Prefill User Data
function prefillUserData() {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (user && document.getElementById('full-name')) {
      document.getElementById('full-name').value = user.name || '';
    }
  } catch (error) {
    console.error('Failed to prefill user data:', error);
  }
}

// Load Cart Items For Review
function loadCartItemsForReview(cart) {
  if (!reviewItems) return;
  
  reviewItems.innerHTML = '';
  
  cart.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.className = 'review-item';
    
    itemElement.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="review-item-image">
      <div class="review-item-details">
        <div class="review-item-name">${item.name}</div>
        <div class="review-item-price">${formatCurrency(item.price)}</div>
        <div class="review-item-quantity">Quantity: ${item.quantity}</div>
      </div>
    `;
    
    reviewItems.appendChild(itemElement);
  });
}

// Handle Payment Method Change
function handlePaymentMethodChange(e) {
  const method = e.target.value;
  
  // Hide all payment forms
  hideAllPaymentForms();
  
  // Show the selected payment form
  switch (method) {
    case 'credit_card':
      creditCardForm.classList.remove('hidden');
      break;
    case 'bank_transfer':
      bankTransferForm.classList.remove('hidden');
      break;
    case 'e_wallet':
      eWalletForm.classList.remove('hidden');
      break;
  }
}

// Hide All Payment Forms
function hideAllPaymentForms() {
  if (creditCardForm) creditCardForm.classList.add('hidden');
  if (bankTransferForm) bankTransferForm.classList.add('hidden');
  if (eWalletForm) eWalletForm.classList.add('hidden');
}

// Go To Shipping Step
function goToShippingStep() {
  // Hide all steps
  hideAllSteps();
  
  // Show shipping step
  if (shippingStep) shippingStep.classList.add('active');
  
  // Update progress
  updateProgress(0);
}

// Go To Payment Step
function goToPaymentStep() {
  // Validate shipping form
  if (!validateShippingStep()) return;
  
  // Hide all steps
  hideAllSteps();
  
  // Show payment step
  if (paymentStep) paymentStep.classList.add('active');
  
  // Update progress
  updateProgress(1);
}

// Go To Review Step
function goToReviewStep() {
  // Validate payment form
  if (!validatePaymentStep()) return;
  
  // Hide all steps
  hideAllSteps();
  
  // Show review step
  if (reviewStep) reviewStep.classList.add('active');
  
  // Update review data
  updateReviewData();
  
  // Update progress
  updateProgress(2);
}

// Hide All Steps
function hideAllSteps() {
  if (shippingStep) shippingStep.classList.remove('active');
  if (paymentStep) paymentStep.classList.remove('active');
  if (reviewStep) reviewStep.classList.remove('active');
}

// Update Progress
function updateProgress(step) {
  progressSteps.forEach((s, i) => {
    if (i < step) {
      s.classList.add('completed');
      s.classList.remove('active');
    } else if (i === step) {
      s.classList.add('active');
      s.classList.remove('completed');
    } else {
      s.classList.remove('active');
      s.classList.remove('completed');
    }
  });
  
  progressLines.forEach((line, i) => {
    if (i < step) {
      line.classList.add('active');
    } else {
      line.classList.remove('active');
    }
  });
}

// Validate Shipping Step
function validateShippingStep() {
  // Check if an address is selected
  const selectedAddressIndex = localStorage.getItem('selectedAddress');
  
  if (selectedAddressIndex && !addressForm.classList.contains('hidden')) {
    return true;
  }
  
  // Validate form fields
  const fullName = document.getElementById('full-name').value;
  const phone = document.getElementById('phone').value;
  const addressLine1 = document.getElementById('address-line1').value;
  const city = document.getElementById('city').value;
  const postalCode = document.getElementById('postal-code').value;
  const province = document.getElementById('province').value;
  
  if (!fullName || !phone || !addressLine1 || !city || !postalCode || !province) {
    showToast('Please fill all required fields', 'error');
    return false;
  }
  
  // Save address if checkbox is checked
  const saveAddress = document.getElementById('save-address').checked;
  
  if (saveAddress) {
    saveAddressToStorage();
  }
  
  return true;
}

// Save Address To Storage
function saveAddressToStorage() {
  try {
    const addresses = JSON.parse(localStorage.getItem('addresses')) || [];
    const editIndex = addressForm.dataset.editIndex;
    
    const addressData = {
      full_name: document.getElementById('full-name').value,
      phone: document.getElementById('phone').value,
      address_line1: document.getElementById('address-line1').value,
      address_line2: document.getElementById('address-line2').value,
      city: document.getElementById('city').value,
      postal_code: document.getElementById('postal-code').value,
      province: document.getElementById('province').value,
      country: document.getElementById('country').value
    };
    
    if (editIndex !== undefined) {
      // Update existing address
      addresses[editIndex] = addressData;
    } else {
      // Add new address
      addresses.push(addressData);
    }
    
    // Save to localStorage
    localStorage.setItem('addresses', JSON.stringify(addresses));
    
    // Set as selected address
    localStorage.setItem('selectedAddress', (editIndex !== undefined ? editIndex : addresses.length - 1).toString());
  } catch (error) {
    console.error('Failed to save address:', error);
    showToast('Failed to save address', 'error');
  }
}

// Validate Payment Step
function validatePaymentStep() {
  const paymentMethod = document.querySelector('input[name="payment_method"]:checked').value;
  
  // Validate fields based on payment method
  switch (paymentMethod) {
    case 'credit_card':
      const cardNumber = document.getElementById('card-number').value;
      const expiryDate = document.getElementById('expiry-date').value;
      const cvv = document.getElementById('cvv').value;
      const cardName = document.getElementById('card-name').value;
      
      if (!cardNumber || !expiryDate || !cvv || !cardName) {
        showToast('Please fill all credit card details', 'error');
        return false;
      }
      break;
      
    case 'e_wallet':
      const phoneNumber = document.getElementById('phone-number').value;
      
      if (!phoneNumber) {
        showToast('Please enter your phone number', 'error');
        return false;
      }
      break;
  }
  
  // Save payment method
  localStorage.setItem('paymentMethod', paymentMethod);
  
  return true;
}

// Update Review Data
function updateReviewData() {
  // Update address review
  updateAddressReview();
  
  // Update payment review
  updatePaymentReview();
}

// Update Address Review
function updateAddressReview() {
  if (!reviewAddress) return;
  
  try {
    const selectedAddressIndex = localStorage.getItem('selectedAddress');
    
    if (selectedAddressIndex) {
      // Get from saved addresses
      const addresses = JSON.parse(localStorage.getItem('addresses')) || [];
      const address = addresses[selectedAddressIndex];
      
      if (address) {
        reviewAddress.innerHTML = `
          <p><strong>${address.full_name}</strong></p>
          <p>${address.address_line1}</p>
          ${address.address_line2 ? `<p>${address.address_line2}</p>` : ''}
          <p>${address.city}, ${address.postal_code}</p>
          <p>${address.province}, ${address.country}</p>
          <p>Phone: ${address.phone}</p>
        `;
        return;
      }
    }
    
    // If no saved address, get from form
    const fullName = document.getElementById('full-name').value;
    const phone = document.getElementById('phone').value;
    const addressLine1 = document.getElementById('address-line1').value;
    const addressLine2 = document.getElementById('address-line2').value;
    const city = document.getElementById('city').value;
    const postalCode = document.getElementById('postal-code').value;
    const province = document.getElementById('province').value;
    const country = document.getElementById('country').value;
    
    reviewAddress.innerHTML = `
      <p><strong>${fullName}</strong></p>
      <p>${addressLine1}</p>
      ${addressLine2 ? `<p>${addressLine2}</p>` : ''}
      <p>${city}, ${postalCode}</p>
      <p>${province}, ${country}</p>
      <p>Phone: ${phone}</p>
    `;
  } catch (error) {
    console.error('Failed to update address review:', error);
    reviewAddress.innerHTML = '<p>Address information unavailable</p>';
  }
}

// Update Payment Review
function updatePaymentReview() {
  if (!reviewPayment) return;
  
  try {
    const paymentMethod = localStorage.getItem('paymentMethod');
    
    switch (paymentMethod) {
      case 'credit_card':
        const cardNumber = document.getElementById('card-number').value;
        const lastFourDigits = cardNumber.slice(-4);
        reviewPayment.innerHTML = `
          <p><strong>Credit/Debit Card</strong></p>
          <p>Card ending in ${lastFourDigits}</p>
        `;
        break;
        
      case 'bank_transfer':
        reviewPayment.innerHTML = `
          <p><strong>Bank Transfer</strong></p>
          <p>Bank: Bank Central Asia (BCA)</p>
          <p>Account: 1234567890</p>
        `;
        break;
        
      case 'e_wallet':
        const eWalletProvider = document.querySelector('input[name="e_wallet_provider"]:checked').value;
        const providerName = eWalletProvider.charAt(0).toUpperCase() + eWalletProvider.slice(1);
        reviewPayment.innerHTML = `
          <p><strong>E-Wallet: ${providerName}</strong></p>
          <p>Phone: ${document.getElementById('phone-number').value}</p>
        `;
        break;
        
      default:
        reviewPayment.innerHTML = '<p>Payment method not selected</p>';
    }
  } catch (error) {
    console.error('Failed to update payment review:', error);
    reviewPayment.innerHTML = '<p>Payment information unavailable</p>';
  }
}

// Handle Order Submission
function handleOrderSubmission(e) {
  e.preventDefault();
  
  // Check if terms are accepted
  const agreeTerms = document.getElementById('agree-terms').checked;
  
  if (!agreeTerms) {
    showToast('Please agree to the terms and conditions', 'error');
    return;
  }
  
  // Get order data
  const orderData = collectOrderData();
  
  // Submit order
  submitOrder(orderData);
}

// Collect Order Data
function collectOrderData() {
  // Get cart
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Get cart summary
  const cartSummary = JSON.parse(localStorage.getItem('cartSummary')) || {
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0
  };
  
  // Get shipping address
  let shippingAddress = {};
  const selectedAddressIndex = localStorage.getItem('selectedAddress');
  
  if (selectedAddressIndex) {
    // Get from saved addresses
    const addresses = JSON.parse(localStorage.getItem('addresses')) || [];
    shippingAddress = addresses[selectedAddressIndex] || {};
  } else {
    // Get from form
    shippingAddress = {
      full_name: document.getElementById('full-name').value,
      phone: document.getElementById('phone').value,
      address_line1: document.getElementById('address-line1').value,
      address_line2: document.getElementById('address-line2').value,
      city: document.getElementById('city').value,
      postal_code: document.getElementById('postal-code').value,
      province: document.getElementById('province').value,
      country: document.getElementById('country').value
    };
  }
  
  // Get payment method
  const paymentMethod = localStorage.getItem('paymentMethod') || 'credit_card';
  
  // Generate order ID
  const orderId = 'ORD' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
  
  return {
    order_id: orderId,
    user_id: JSON.parse(localStorage.getItem('user')).id,
    items: cart,
    shipping_address: shippingAddress,
    payment_method: paymentMethod,
    subtotal: cartSummary.subtotal,
    shipping: cartSummary.shipping,
    tax: cartSummary.tax,
    total: cartSummary.total,
    order_date: new Date().toISOString(),
    status: 'pending'
  };
}

// Submit Order
async function submitOrder(orderData) {
  try {
    // Show loading state
    if (placeOrderBtn) {
      placeOrderBtn.disabled = true;
      placeOrderBtn.innerHTML = '<span class="loader-small"></span> Processing...';
    }
    
    // In a real app, we would send this to the server
    // For this demo, we'll simulate a server response
    await simulateOrderSubmission(orderData);
    
    // Clear cart and cart summary
    localStorage.removeItem('cart');
    localStorage.removeItem('cartSummary');
    localStorage.removeItem('selectedAddress');
    localStorage.removeItem('paymentMethod');
    
    // Save order to user orders history
    saveOrderToHistory(orderData);
    
    // Show success message
    showOrderSuccess(orderData.order_id);
    
    // Update cart count in header
    updateCartCount();
  } catch (error) {
    console.error('Failed to submit order:', error);
    showToast('Failed to submit order. Please try again.', 'error');
    
    // Enable button
    if (placeOrderBtn) {
      placeOrderBtn.disabled = false;
      placeOrderBtn.textContent = 'Place Order';
    }
  }
}

// Simulate Order Submission
function simulateOrderSubmission(orderData) {
  return new Promise((resolve) => {
    // Simulate server delay
    setTimeout(() => {
      resolve({ success: true, order_id: orderData.order_id });
    }, 2000);
  });
}

// Save Order To History
function saveOrderToHistory(orderData) {
  try {
    // Get existing orders
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    // Add new order
    orders.push(orderData);
    
    // Save to localStorage
    localStorage.setItem('orders', JSON.stringify(orders));
  } catch (error) {
    console.error('Failed to save order to history:', error);
  }
}

// Show Order Success
function showOrderSuccess(orderId) {
  // Hide checkout form
  if (checkoutForm) checkoutForm.classList.add('hidden');
  
  // Show success message
  if (orderSuccess) {
    orderSuccess.classList.remove('hidden');
    document.getElementById('order-id').textContent = orderId;
  }
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
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