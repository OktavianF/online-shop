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
    const response = await fetch('../php/api/products.php?featured=1');
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const products = await response.json();
    displayFeaturedProducts(products);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    
    // For development purposes, load mock data if API fails
    displayFeaturedProducts(getMockProducts());
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

// Mock Products Data for Development
function getMockProducts() {
  return [
    {
      id: 1,
      name: 'Wireless Headphones',
      description: 'High-quality wireless headphones with noise cancellation technology.',
      price: 1500000,
      image: 'https://images.pexels.com/photos/3394666/pexels-photo-3394666.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      category_id: 1
    },
    {
      id: 2,
      name: 'Casual T-Shirt',
      description: 'Comfortable cotton t-shirt for everyday wear.',
      price: 249000,
      image: 'https://images.pexels.com/photos/5698853/pexels-photo-5698853.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      category_id: 2
    },
    {
      id: 3,
      name: 'Smart Watch',
      description: 'Fitness tracker and smartwatch with heart rate monitoring.',
      price: 899000,
      image: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      category_id: 1
    },
    {
      id: 4,
      name: 'Coffee Maker',
      description: 'Automatic coffee maker for home and office use.',
      price: 750000,
      image: 'https://images.pexels.com/photos/2467285/pexels-photo-2467285.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      category_id: 3
    }
  ];
}