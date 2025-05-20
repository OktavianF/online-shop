import { addToCart, formatCurrency, showToast } from './main.js';

// DOM Elements
const productsContainer = document.getElementById('products-container');
const paginationContainer = document.getElementById('pagination');
const noProductsMessage = document.getElementById('no-products');
const viewButtons = document.querySelectorAll('.view-btn');
const sortSelect = document.getElementById('sort-products');
const categoryCheckboxes = document.querySelectorAll('input[name="category"]');
const minPriceInput = document.getElementById('min-price');
const maxPriceInput = document.getElementById('max-price');
const applyPriceBtn = document.getElementById('apply-price');
const clearFiltersBtn = document.getElementById('clear-filters');
const resetFiltersBtn = document.getElementById('reset-filters');

// State
let state = {
  products: [],
  view: 'grid',
  currentPage: 1,
  totalPages: 1,
  itemsPerPage: 9,
  sortBy: 'created_at',
  sortDirection: 'desc',
  filters: {
    categories: [],
    minPrice: null,
    maxPrice: null,
    search: ''
  }
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Initialize shop page
  initShop();
  
  // View toggle
  viewButtons.forEach(button => {
    button.addEventListener('click', () => {
      const view = button.dataset.view;
      setView(view);
    });
  });
  
  // Sort change
  sortSelect?.addEventListener('change', (e) => {
    const [sortBy, sortDirection] = e.target.value.split('-');
    setSorting(sortBy, sortDirection);
  });
  
  // Category filters
  categoryCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      updateCategoryFilters();
    });
  });
  
  // Price filter
  applyPriceBtn?.addEventListener('click', () => {
    updatePriceFilters();
  });
  
  // Clear filters
  clearFiltersBtn?.addEventListener('click', clearFilters);
  resetFiltersBtn?.addEventListener('click', clearFilters);
  
  // Parse URL parameters for initial state
  parseUrlParams();
});

// Initialize Shop
function initShop() {
  // Get products from API
  fetchProducts();
}

// Fetch Products
async function fetchProducts() {
  try {
    // Show loading state
    productsContainer.innerHTML = '<div class="product-loader"><div class="loader"></div></div>';
    
    // Build query parameters
    const params = new URLSearchParams();
    
    // Add sort parameters
    params.append('sort_by', state.sortBy);
    params.append('sort_dir', state.sortDirection);
    
    // Add category filter
    if (state.filters.categories.length > 0) {
      state.filters.categories.forEach(category => {
        params.append('category', category);
      });
    }
    
    // Add price filters
    if (state.filters.minPrice !== null) {
      params.append('min_price', state.filters.minPrice);
    }
    
    if (state.filters.maxPrice !== null) {
      params.append('max_price', state.filters.maxPrice);
    }
    
    // Add search term
    if (state.filters.search) {
      params.append('search', state.filters.search);
    }
    
    // Add pagination
    params.append('limit', state.itemsPerPage);
    params.append('offset', (state.currentPage - 1) * state.itemsPerPage);
    
    // Fetch data from API
    const response = await fetch(`../php/api/products.php?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Update state
    state.products = data.products;
    state.totalPages = Math.ceil(data.total / state.itemsPerPage);
    
    // Render products and pagination
    renderProducts();
    renderPagination();
    
    // Update URL with current state
    updateUrl();
  } catch (error) {
    console.error('Error fetching products:', error);
    productsContainer.innerHTML = '<p class="no-products">Gagal memuat produk dari database.</p>';
  }
}

// Render Products
function renderProducts() {
  if (!productsContainer) return;
  
  // Clear container
  productsContainer.innerHTML = '';
  
  // Show no products message if no products
  if (state.products.length === 0) {
    noProductsMessage.classList.remove('hidden');
    return;
  }
  
  // Hide no products message
  noProductsMessage.classList.add('hidden');
  
  // Set container class based on view
  productsContainer.className = state.view === 'grid' ? 'products-grid' : 'products-list';
  
  // Create product cards
  state.products.forEach(product => {
    const productCard = createProductCard(product);
    productsContainer.appendChild(productCard);
  });
}

// Create Product Card
function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';

  const imageUrl = product.image
    ? `/online-shop/${product.image.replace(/^\/?online-shop\//, '')}`
    : '/online-shop/img/default.jpg';

  card.innerHTML = `
    <img src="${imageUrl}" alt="${product.name}" class="product-image">
    <div class="product-info">
      <h3 class="product-name">${product.name}</h3>
      <p class="product-description">${product.description}</p>
      <p class="product-price">${formatCurrency(product.price)}</p>
      <div class="product-actions">
        <a href="../pages/product.html?id=${product.id}" class="btn btn-sm btn-outline">View Details</a>
        <button class="btn btn-sm btn-primary add-to-cart" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-image="${product.image}">
          <span class="material-icons">shopping_cart</span>
        </button>
      </div>
    </div>
  `;

  // Add event listener to the add to cart button
  const addToCartBtn = card.querySelector('.add-to-cart');
  addToCartBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const { id, name, price, image } = e.currentTarget.dataset;
    addToCart(id, name, parseFloat(price), 1, image);
  });

  return card;
}

// Render Pagination
function renderPagination() {
  if (!paginationContainer) return;
  
  paginationContainer.innerHTML = '';
  
  if (state.totalPages <= 1) return;
  
  // Create Previous button
  const prevBtn = document.createElement('button');
  prevBtn.className = `pagination-btn ${state.currentPage === 1 ? 'disabled' : ''}`;
  prevBtn.innerHTML = '<span class="material-icons">chevron_left</span>';
  prevBtn.disabled = state.currentPage === 1;
  prevBtn.addEventListener('click', () => {
    if (state.currentPage > 1) {
      goToPage(state.currentPage - 1);
    }
  });
  
  paginationContainer.appendChild(prevBtn);
  
  // Determine which page numbers to show
  let startPage = Math.max(1, state.currentPage - 2);
  let endPage = Math.min(state.totalPages, startPage + 4);
  
  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }
  
  // Create page number buttons
  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.className = `pagination-btn ${i === state.currentPage ? 'active' : ''}`;
    pageBtn.textContent = i;
    pageBtn.addEventListener('click', () => {
      goToPage(i);
    });
    
    paginationContainer.appendChild(pageBtn);
  }
  
  // Create Next button
  const nextBtn = document.createElement('button');
  nextBtn.className = `pagination-btn ${state.currentPage === state.totalPages ? 'disabled' : ''}`;
  nextBtn.innerHTML = '<span class="material-icons">chevron_right</span>';
  nextBtn.disabled = state.currentPage === state.totalPages;
  nextBtn.addEventListener('click', () => {
    if (state.currentPage < state.totalPages) {
      goToPage(state.currentPage + 1);
    }
  });
  
  paginationContainer.appendChild(nextBtn);
}

// Go to Specific Page
function goToPage(page) {
  if (page === state.currentPage) return;
  
  state.currentPage = page;
  fetchProducts();
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Set View (Grid or List)
function setView(view) {
  if (view === state.view) return;
  
  state.view = view;
  
  // Update active button
  viewButtons.forEach(button => {
    button.classList.toggle('active', button.dataset.view === view);
  });
  
  // Update container class
  if (productsContainer) {
    productsContainer.className = view === 'grid' ? 'products-grid' : 'products-list';
  }
  
  // Update URL
  updateUrl();
}

// Set Sorting
function setSorting(sortBy, sortDirection) {
  if (sortBy === state.sortBy && sortDirection === state.sortDirection) return;
  
  state.sortBy = sortBy;
  state.sortDirection = sortDirection;
  state.currentPage = 1;
  
  // Fetch products with new sorting
  fetchProducts();
}

// Update Category Filters
function updateCategoryFilters() {
  const allCategoriesCheckbox = document.getElementById('category-all');
  
  // Check if 'All Categories' is checked
  if (allCategoriesCheckbox.checked) {
    // Uncheck all other category checkboxes
    categoryCheckboxes.forEach(checkbox => {
      if (checkbox.id !== 'category-all') {
        checkbox.checked = false;
      }
    });
    
    state.filters.categories = [];
  } else {
    // Get selected categories
    const selectedCategories = Array.from(categoryCheckboxes)
      .filter(checkbox => checkbox.checked && checkbox.id !== 'category-all')
      .map(checkbox => checkbox.value);
    
    // If no categories selected, check 'All Categories'
    if (selectedCategories.length === 0) {
      allCategoriesCheckbox.checked = true;
      state.filters.categories = [];
    } else {
      state.filters.categories = selectedCategories;
    }
  }
  
  state.currentPage = 1;
  fetchProducts();
}

// Update Price Filters
function updatePriceFilters() {
  const minPrice = minPriceInput.value ? parseInt(minPriceInput.value) : null;
  const maxPrice = maxPriceInput.value ? parseInt(maxPriceInput.value) : null;
  
  // Validate min price <= max price
  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    showToast('Minimum price cannot be greater than maximum price', 'error');
    return;
  }
  
  state.filters.minPrice = minPrice;
  state.filters.maxPrice = maxPrice;
  state.currentPage = 1;
  
  fetchProducts();
}

// Clear Filters
function clearFilters() {
  // Reset category checkboxes
  categoryCheckboxes.forEach(checkbox => {
    checkbox.checked = checkbox.id === 'category-all';
  });
  
  // Reset price inputs
  minPriceInput.value = '';
  maxPriceInput.value = '';
  
  // Reset state filters
  state.filters.categories = [];
  state.filters.minPrice = null;
  state.filters.maxPrice = null;
  state.filters.search = '';
  state.currentPage = 1;
  
  // Reset sort select
  sortSelect.value = 'created_at-desc';
  state.sortBy = 'created_at';
  state.sortDirection = 'desc';
  
  // Fetch products with reset filters
  fetchProducts();
}

// Update URL with current state
function updateUrl() {
  const params = new URLSearchParams();
  
  // Add view
  params.append('view', state.view);
  
  // Add sort
  params.append('sort', `${state.sortBy}-${state.sortDirection}`);
  
  // Add page
  if (state.currentPage > 1) {
    params.append('page', state.currentPage);
  }
  
  // Add category filters
  if (state.filters.categories.length > 0) {
    state.filters.categories.forEach(category => {
      params.append('category', category);
    });
  }
  
  // Add price filters
  if (state.filters.minPrice !== null) {
    params.append('min_price', state.filters.minPrice);
  }
  
  if (state.filters.maxPrice !== null) {
    params.append('max_price', state.filters.maxPrice);
  }
  
  // Add search term
  if (state.filters.search) {
    params.append('search', state.filters.search);
  }
  
  // Update URL
  const url = `${window.location.pathname}?${params.toString()}`;
  history.replaceState(null, '', url);
}

// Parse URL parameters
function parseUrlParams() {
  const params = new URLSearchParams(window.location.search);
  
  // Get view
  const view = params.get('view');
  if (view && (view === 'grid' || view === 'list')) {
    setView(view);
  }
  
  // Get sort
  const sort = params.get('sort');
  if (sort) {
    const [sortBy, sortDirection] = sort.split('-');
    if (sortBy && sortDirection) {
      state.sortBy = sortBy;
      state.sortDirection = sortDirection;
      sortSelect.value = sort;
    }
  }
  
  // Get page
  const page = params.get('page');
  if (page) {
    state.currentPage = parseInt(page);
  }
  
  // Get category filters
  const categories = params.getAll('category');
  if (categories.length > 0) {
    state.filters.categories = categories;
    
    // Update category checkboxes
    categoryCheckboxes.forEach(checkbox => {
      if (checkbox.id === 'category-all') {
        checkbox.checked = categories.length === 0;
      } else {
        checkbox.checked = categories.includes(checkbox.value);
      }
    });
  }
  
  // Get price filters
  const minPrice = params.get('min_price');
  if (minPrice) {
    state.filters.minPrice = parseInt(minPrice);
    minPriceInput.value = minPrice;
  }
  
  const maxPrice = params.get('max_price');
  if (maxPrice) {
    state.filters.maxPrice = parseInt(maxPrice);
    maxPriceInput.value = maxPrice;
  }
  
  // Get search term
  const search = params.get('search');
  if (search) {
    state.filters.search = search;
    
    // Update search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.value = search;
    }
  }
}

