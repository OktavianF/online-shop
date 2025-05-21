// DOM Elements - Tabs
const tabButtons = document.querySelectorAll('.tab-button');
const tabPanes = document.querySelectorAll('.tab-pane');

// DOM Elements - Product Modal
const productModal = document.getElementById('product-modal');
const addProductBtn = document.getElementById('add-product-btn');
const editProductBtns = document.querySelectorAll('.edit-product');
const deleteProductBtns = document.querySelectorAll('.delete-product');
const productForm = document.getElementById('product-form');
const modalTitle = document.getElementById('modal-title');
const saveProductBtn = document.getElementById('save-product-btn');
const closeModalBtns = document.querySelectorAll('.close-modal');
const cancelModalBtns = document.querySelectorAll('.cancel-modal');

// DOM Elements - Order Modal
const orderModal = document.getElementById('order-modal');
const viewOrderBtns = document.querySelectorAll('.view-order');
const orderDetails = document.getElementById('order-details');
const orderActions = document.getElementById('order-actions');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initProductModal();
  initOrderModal();
});

// Initialize Tabs
function initTabs() {
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.dataset.tab;
      
      // Remove active class from all buttons and panes
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanes.forEach(pane => pane.classList.remove('active'));
      
      // Add active class to clicked button and corresponding pane
      button.classList.add('active');
      document.getElementById(`${tabId}-tab`).classList.add('active');
    });
  });
}

// Initialize Product Modal
function initProductModal() {
  // Open modal for adding new product
  addProductBtn?.addEventListener('click', () => {
    modalTitle.textContent = 'Add New Product';
    productForm.reset();
    document.getElementById('product-id').value = '';
    saveProductBtn.textContent = 'Save Product';
    openModal(productModal);
  });
  
  // Open modal for editing product
  editProductBtns.forEach(button => {
    button.addEventListener('click', (e) => {
      const productId = e.currentTarget.dataset.id;
      modalTitle.textContent = 'Edit Product';
      saveProductBtn.textContent = 'Update Product';
      loadProductData(productId);
      openModal(productModal);
    });
  });
  
  // Delete product confirmation
  deleteProductBtns.forEach(button => {
    button.addEventListener('click', (e) => {
      const productId = e.currentTarget.dataset.id;
      if (confirm('Are you sure you want to delete this product?')) {
        deleteProduct(productId);
      }
    });
  });
  
  // Submit product form
  productForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    saveProduct();
  });
  
  // Close modal handlers
  closeModalBtns.forEach(button => {
    button.addEventListener('click', () => {
      closeModal(button.closest('.modal'));
    });
  });
  
  cancelModalBtns.forEach(button => {
    button.addEventListener('click', () => {
      closeModal(button.closest('.modal'));
    });
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      closeModal(e.target);
    }
  });
  
  // Prevent modal close when clicking inside modal content
  const modalContents = document.querySelectorAll('.modal-content');
  modalContents.forEach(content => {
    content.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  });
}

// Initialize Order Modal
function initOrderModal() {
  // Open modal for viewing order details
  viewOrderBtns.forEach(button => {
    button.addEventListener('click', (e) => {
      const orderId = e.currentTarget.dataset.id;
      loadOrderDetails(orderId);
      openModal(orderModal);
    });
  });
}

// Open Modal
function openModal(modal) {
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

// Close Modal
function closeModal(modal) {
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Load Product Data for Editing
function loadProductData(productId) {
  // For a real app, we would fetch the product data from the server
  // For this demo, we'll get it from the DOM
  
  try {
    const productRow = document.querySelector(`.delete-product[data-id="${productId}"]`).closest('tr');
    if (!productRow) return;
    
    const name = productRow.cells[1].textContent;
    const priceText = productRow.cells[2].textContent;
    const price = parseInt(priceText.replace(/[^\d]/g, ''));
    const stock = parseInt(productRow.cells[3].textContent);
    const categoryText = productRow.cells[4].textContent.trim();
    const isFeatured = productRow.cells[5].querySelector('.badge').textContent.trim() === 'Yes';
    const image = productRow.cells[0].querySelector('img').src;
    
    // Map category text to ID
    const categoryMap = {
      'Electronics': 1,
      'Fashion': 2,
      'Home & Living': 3,
      'Sports': 4
    };
    const categoryId = categoryMap[categoryText] || 1;
    
    // Set form values
    document.getElementById('product-id').value = productId;
    document.getElementById('product-name').value = name;
    
    // Description isn't shown in the table, so we'll use a placeholder
    document.getElementById('product-description').value = 'Product description';
    
    document.getElementById('product-price').value = price;
    document.getElementById('product-stock').value = stock;
    document.getElementById('product-category').value = categoryId;
    document.getElementById('product-featured').checked = isFeatured;
    document.getElementById('product-image').value = image;
  } catch (error) {
    console.error('Failed to load product data:', error);
    showToast('Failed to load product data', 'error');
  }
}

// Save Product (Create or Update)
async function saveProduct() {
  const productId = document.getElementById('product-id').value;
  const isUpdate = productId !== '';

  // Ambil data form
  const formData = new FormData(productForm);


  // Ambil status checkbox is_featured dengan benar
  const isFeaturedChecked = document.getElementById('product-featured').checked;

const productData = {
  name: formData.get('name'),
  description: formData.get('description'),
  price: parseFloat(formData.get('price')),
  stock: parseInt(formData.get('stock')),
  category_id: parseInt(formData.get('category_id')),
  is_featured: document.getElementById('product-featured').checked ? 1 : 0,
  image: formData.get('image')
};

  if (isUpdate) {
    productData.id = productId;
  }

  // Tampilkan loading
  saveProductBtn.disabled = true;
  saveProductBtn.innerHTML = '<span class="loader-small"></span> Saving...';

  try {
    const response = await fetch('../php/api/products.php', {
      method: isUpdate ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });

    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      showToast('Invalid server response', 'error');
      saveProductBtn.disabled = false;
      saveProductBtn.innerHTML = isUpdate ? 'Update Product' : 'Save Product';
      return;
    }

    if (result.success) {
      showToast(result.message || `Product ${isUpdate ? 'updated' : 'created'} successfully`, 'success');
      window.location.reload();
    } else {
      showToast(result.message || 'Failed to save product', 'error');
    }
  } catch (error) {
    showToast('Failed to save product', 'error');
  } finally {
    saveProductBtn.disabled = false;
    saveProductBtn.innerHTML = isUpdate ? 'Update Product' : 'Save Product';
  }
}

// Delete Product
function deleteProduct(productId) {
  // For a real app, we would send a delete request to the server
  // For this demo, we'll simulate success
  
  // Show loading state
  const deleteBtn = document.querySelector(`.delete-product[data-id="${productId}"]`);
  if (deleteBtn) {
    deleteBtn.disabled = true;
    deleteBtn.innerHTML = '<span class="loader-small"></span>';
  }
  
  setTimeout(() => {
    try {
      // Remove product row from table
      const productRow = deleteBtn?.closest('tr');
      if (productRow) {
        productRow.style.opacity = '0';
        productRow.style.height = '0';
        
        setTimeout(() => {
          productRow.remove();
          
          // Check if table is empty
          const tbody = document.querySelector('#products-tab .data-table tbody');
          if (tbody && tbody.children.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="no-data">No products found. Add your first product!</td></tr>';
          }
        }, 300);
      }
      
      // Show success message
      showToast('Product deleted successfully', 'success');
    } catch (error) {
      console.error('Failed to delete product:', error);
      showToast('Failed to delete product', 'error');
    }
  }, 1000);
}

// Load Order Details
function loadOrderDetails(orderId) {
  if (!orderDetails) return;
  
  // For a real app, we would fetch the order data from the server
  // For this demo, we'll create mock data
  setTimeout(() => {
    const order = {
      id: orderId,
      customer: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+6281234567890'
      },
      shipping_address: {
        address_line1: 'Jl. Sudirman No. 123',
        address_line2: 'Apartment 4B',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        postal_code: '12190',
        country: 'Indonesia'
      },
      payment: {
        method: 'Credit Card',
        status: 'Paid',
        date: '2025-02-15 10:30:00'
      },
      items: [
        {
          id: 1,
          name: 'Wireless Headphones',
          price: 1500000,
          quantity: 1,
          image: 'https://images.pexels.com/photos/3394666/pexels-photo-3394666.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
        }
      ],
      subtotal: 1500000,
      shipping: 15000,
      tax: 165000,
      total: 1680000,
      status: 'processing',
      created_at: '2025-02-15 10:00:00'
    };
    
    // Create HTML for order details
    const html = `
      <div class="order-detail-section">
        <h4>Order Information</h4>
        <div class="order-info-grid">
          <div class="order-info-item">
            <div class="order-info-label">Order ID</div>
            <div class="order-info-value">#${order.id}</div>
          </div>
          <div class="order-info-item">
            <div class="order-info-label">Order Date</div>
            <div class="order-info-value">${formatDate(order.created_at)}</div>
          </div>
          <div class="order-info-item">
            <div class="order-info-label">Status</div>
            <div class="order-info-value">
              <span class="badge ${getStatusBadgeClass(order.status)}">
                ${capitalizeFirstLetter(order.status)}
              </span>
            </div>
          </div>
          <div class="order-info-item">
            <div class="order-info-label">Payment Method</div>
            <div class="order-info-value">${order.payment.method}</div>
          </div>
        </div>
      </div>
      
      <div class="order-detail-section">
        <h4>Customer Information</h4>
        <div class="order-info-grid">
          <div class="order-info-item">
            <div class="order-info-label">Name</div>
            <div class="order-info-value">${order.customer.name}</div>
          </div>
          <div class="order-info-item">
            <div class="order-info-label">Email</div>
            <div class="order-info-value">${order.customer.email}</div>
          </div>
          <div class="order-info-item">
            <div class="order-info-label">Phone</div>
            <div class="order-info-value">${order.customer.phone}</div>
          </div>
        </div>
      </div>
      
      <div class="order-detail-section">
        <h4>Shipping Address</h4>
        <div class="order-info-item">
          <div class="order-info-value">
            ${order.shipping_address.address_line1}<br>
            ${order.shipping_address.address_line2 ? order.shipping_address.address_line2 + '<br>' : ''}
            ${order.shipping_address.city}, ${order.shipping_address.province} ${order.shipping_address.postal_code}<br>
            ${order.shipping_address.country}
          </div>
        </div>
      </div>
      
      <div class="order-detail-section">
        <h4>Order Items</h4>
        <div class="order-items">
          ${order.items.map(item => `
            <div class="order-product">
              <img src="${item.image}" alt="${item.name}" class="order-product-image">
              <div class="order-product-details">
                <div class="order-product-name">${item.name}</div>
                <div class="order-product-price">${formatCurrency(item.price)}</div>
                <div class="order-product-quantity">Quantity: ${item.quantity}</div>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="order-summary">
          <div class="summary-item">
            <span>Subtotal</span>
            <span>${formatCurrency(order.subtotal)}</span>
          </div>
          <div class="summary-item">
            <span>Shipping</span>
            <span>${formatCurrency(order.shipping)}</span>
          </div>
          <div class="summary-item">
            <span>Tax</span>
            <span>${formatCurrency(order.tax)}</span>
          </div>
          <div class="order-total">
            <span>Total</span>
            <span>${formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>
    `;
    
    orderDetails.innerHTML = html;
    
    // Create action buttons based on order status
    let actionButtons = '';
    
    switch (order.status) {
      case 'pending':
        actionButtons = `
          <button class="btn btn-primary" onclick="updateOrderStatus(${order.id}, 'processing')">Process Order</button>
          <button class="btn btn-error" onclick="updateOrderStatus(${order.id}, 'cancelled')">Cancel Order</button>
        `;
        break;
      case 'processing':
        actionButtons = `
          <button class="btn btn-primary" onclick="updateOrderStatus(${order.id}, 'shipped')">Mark as Shipped</button>
          <button class="btn btn-error" onclick="updateOrderStatus(${order.id}, 'cancelled')">Cancel Order</button>
        `;
        break;
      case 'shipped':
        actionButtons = `
          <button class="btn btn-success" onclick="updateOrderStatus(${order.id}, 'completed')">Mark as Completed</button>
        `;
        break;
    }
    
    orderActions.innerHTML = actionButtons;
    
    // Add updateOrderStatus function to window for onclick handlers
    window.updateOrderStatus = function(orderId, status) {
      updateOrderStatus(orderId, status);
    };
  }, 800);
}

// Update Order Status
function updateOrderStatus(orderId, status) {
  // For a real app, we would send this to the server
  // For this demo, we'll simulate success
  
  // Show loading state
  orderActions.innerHTML = '<div class="loader"></div>';
  
  setTimeout(() => {
    // Update status badge in order details
    const statusElement = orderDetails.querySelector('.badge');
    if (statusElement) {
      statusElement.className = `badge ${getStatusBadgeClass(status)}`;
      statusElement.textContent = capitalizeFirstLetter(status);
    }
    
    // Update status badge in orders table
    const orderRow = document.querySelector(`.view-order[data-id="${orderId}"]`).closest('tr');
    if (orderRow) {
      const statusBadge = orderRow.querySelector('.badge');
      if (statusBadge) {
        statusBadge.className = `badge ${getStatusBadgeClass(status)}`;
        statusBadge.textContent = capitalizeFirstLetter(status);
      }
    }
    
    // Clear action buttons and show success message
    orderActions.innerHTML = '';
    showToast(`Order #${orderId} status updated to ${capitalizeFirstLetter(status)}`, 'success');
    
    // Close modal after a delay
    setTimeout(() => {
      closeModal(orderModal);
    }, 1500);
  }, 1000);
}

// Helper Functions
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'pending': return 'badge-warning';
    case 'processing': return 'badge-info';
    case 'shipped': return 'badge-primary';
    case 'completed': return 'badge-success';
    case 'cancelled': return 'badge-error';
    default: return 'badge-gray';
  }
}

// Toast notification function imported from main.js
function showToast(message, type = 'info') {
  // Create toast container if it doesn't exist
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



// Delete product event listener
document.addEventListener('click', async function(e) {
  if (e.target.closest('.delete-product')) {
    const btn = e.target.closest('.delete-product');
    const productId = btn.dataset.id;
    if (confirm('Yakin ingin menghapus produk ini?')) {
      try {
        const res = await fetch('../php/api/products.php', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: productId })
        });
        const data = await res.json();
        if (data.success) {
          alert('Produk berhasil dihapus');
          // Panggil ulang fetchProducts() atau reload halaman
          location.reload();
        } else {
          alert(data.message || 'Gagal menghapus produk');
        }
      } catch (err) {
        alert('Terjadi kesalahan koneksi');
      }
    }
  }
});

