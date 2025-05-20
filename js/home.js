import { addToCart, formatCurrency } from './main.js';

// DOM Elements
const featuredProductsGrid = document.getElementById('featured-products-grid');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  fetchFeaturedProducts();
});

// Fetch Featured Products
async function fetchFeaturedProducts() {
  try {
    const response = await fetch('/online-shop/php/api/products.php?featured=1');
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const result = await response.json();
    const products = result.products || [];
    displayFeaturedProducts(products);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    
    // For development purposes, load mock data if API fails
    featuredProductsGrid.innerHTML = '<p class="no-products">Gagal memuat produk dari database.</p>';
  }
}

// Display Featured Products
function displayFeaturedProducts(products) {
  if (!featuredProductsGrid) return;
  
  // Clear loading state
  featuredProductsGrid.innerHTML = '';
  
  if (products.length === 0) {
    featuredProductsGrid.innerHTML = '<p class="no-products">No featured products available.</p>';
    return;
  }
  
  // Create product cards
  products.forEach(product => {
    const productCard = createProductCard(product);
    featuredProductsGrid.appendChild(productCard);
  });
}

// Create Product Card
function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';
  
  const imageUrl = product.image_url ? `/online-shop/${product.image_url.replace(/^\/?online-shop\//, '')}` : '/online-shop/img/default.jpg';
  
  card.innerHTML = `
    <img src="${imageUrl}" alt="${product.name}">
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