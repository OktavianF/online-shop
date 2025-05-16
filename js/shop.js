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
    
    // For development purposes, load mock data
    const mockData = getMockProducts();
    state.products = mockData.products;
    state.totalPages = Math.ceil(mockData.total / state.itemsPerPage);
    
    // Render products and pagination
    renderProducts();
    renderPagination();
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
  
  card.innerHTML = `
    <img src="${product.image}" alt="${product.name}" class="product-image">
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

// Mock Products Data for Development
function getMockProducts() {
  const allProducts = [
    {
      id: 1,
      name: 'Wireless Headphones',
      description: 'High-quality wireless headphones with noise cancellation technology.',
      price: 1500000,
      category_id: 1,
      user_id: 1,
      seller_name: 'TechStore',
      stock: 50,
      is_featured: true,
      image: 'https://images.pexels.com/photos/3394666/pexels-photo-3394666.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      created_at: '2025-01-15 10:00:00'
    },
    {
      id: 2,
      name: 'Casual T-Shirt',
      description: 'Comfortable cotton t-shirt for everyday wear.',
      price: 249000,
      category_id: 2,
      user_id: 2,
      seller_name: 'FashionHub',
      stock: 100,
      is_featured: true,
      image: 'https://images.pexels.com/photos/5698853/pexels-photo-5698853.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      created_at: '2025-01-10 14:30:00'
    },
    {
      id: 3,
      name: 'Smart Watch',
      description: 'Fitness tracker and smartwatch with heart rate monitoring.',
      price: 899000,
      category_id: 1,
      user_id: 1,
      seller_name: 'TechStore',
      stock: 30,
      is_featured: true,
      image: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      created_at: '2025-01-20 09:15:00'
    },
    {
      id: 4,
      name: 'Coffee Maker',
      description: 'Automatic coffee maker for home and office use.',
      price: 750000,
      category_id: 3,
      user_id: 3,
      seller_name: 'HomeEssentials',
      stock: 20,
      is_featured: true,
      image: 'https://images.pexels.com/photos/2467285/pexels-photo-2467285.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      created_at: '2025-01-18 11:20:00'
    },
    {
      id: 5,
      name: 'Desk Lamp',
      description: 'LED desk lamp with adjustable brightness and color temperature.',
      price: 350000,
      category_id: 3,
      user_id: 3,
      seller_name: 'HomeEssentials',
      stock: 40,
      is_featured: false,
      image: 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      created_at: '2025-01-25 15:45:00'
    },
    {
      id: 6,
      name: 'Running Shoes',
      description: 'Lightweight running shoes with cushioned soles for maximum comfort.',
      price: 800000,
      category_id: 4,
      user_id: 4,
      seller_name: 'SportyGear',
      stock: 25,
      is_featured: false,
      image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      created_at: '2025-01-22 13:10:00'
    },
    {
      id: 7,
      name: 'Denim Jacket',
      description: 'Classic denim jacket for men and women.',
      price: 650000,
      category_id: 2,
      user_id: 2,
      seller_name: 'FashionHub',
      stock: 15,
      is_featured: false,
      image: 'https://images.pexels.com/photos/5235413/pexels-photo-5235413.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      created_at: '2025-01-28 10:30:00'
    },
    {
      id: 8,
      name: 'Portable Speaker',
      description: 'Waterproof Bluetooth speaker with 20-hour battery life.',
      price: 450000,
      category_id: 1,
      user_id: 1,
      seller_name: 'TechStore',
      stock: 35,
      is_featured: false,
      image: 'https://images.pexels.com/photos/1279107/pexels-photo-1279107.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      created_at: '2025-01-30 16:20:00'
    },
    {
      id: 9,
      name: 'Yoga Mat',
      description: 'Non-slip yoga mat for home and gym workouts.',
      price: 200000,
      category_id: 4,
      user_id: 4,
      seller_name: 'SportyGear',
      stock: 50,
      is_featured: false,
      image: 'https://images.pexels.com/photos/4757986/pexels-photo-4757986.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      created_at: '2025-02-01 09:45:00'
    },
    {
      id: 10,
      name: 'Ceramic Plant Pot',
      description: 'Decorative ceramic pot for indoor plants.',
      price: 125000,
      category_id: 3,
      user_id: 3,
      seller_name: 'HomeEssentials',
      stock: 60,
      is_featured: false,
      image: 'https://images.pexels.com/photos/5282058/pexels-photo-5282058.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      created_at: '2025-02-03 12:15:00'
    },
    {
      id: 11,
      name: 'Digital Camera',
      description: '24MP digital camera with 4K video recording capability.',
      price: 3500000,
      category_id: 1,
      user_id: 1,
      seller_name: 'TechStore',
      stock: 10,
      is_featured: false,
      image: 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      created_at: '2025-02-05 08:30:00'
    },
    {
      id: 12,
      name: 'Summer Dress',
      description: 'Lightweight floral dress perfect for summer days.',
      price: 399000,
      category_id: 2,
      user_id: 2,
      seller_name: 'FashionHub',
      stock: 25,
      is_featured: false,
      image: 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      created_at: '2025-02-07 14:40:00'
    }
  ];
  
  // Filter products based on state filters
  let filteredProducts = [...allProducts];
  
  // Filter by categories
  if (state.filters.categories.length > 0) {
    filteredProducts = filteredProducts.filter(product =>
      state.filters.categories.includes(product.category_id.toString())
    );
  }
  
  // Filter by price
  if (state.filters.minPrice !== null) {
    filteredProducts = filteredProducts.filter(product => product.price >= state.filters.minPrice);
  }
  
  if (state.filters.maxPrice !== null) {
    filteredProducts = filteredProducts.filter(product => product.price <= state.filters.maxPrice);
  }
  
  // Filter by search term
  if (state.filters.search) {
    const searchTerm = state.filters.search.toLowerCase();
    filteredProducts = filteredProducts.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm)
    );
  }
  
  // Sort products
  filteredProducts.sort((a, b) => {
    let comparison = 0;
    
    switch (state.sortBy) {
      case 'price':
        comparison = a.price - b.price;
        break;
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'created_at':
      default:
        comparison = new Date(b.created_at) - new Date(a.created_at);
        break;
    }
    
    return state.sortDirection === 'asc' ? comparison : -comparison;
  });
  
  // Paginate products
  const startIndex = (state.currentPage - 1) * state.itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + state.itemsPerPage);
  
  return {
    products: paginatedProducts,
    total: filteredProducts.length
  };
}