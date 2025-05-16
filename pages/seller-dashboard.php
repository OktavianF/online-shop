<?php
require_once '../php/config.php';

// Start session
ensure_session_started();

// Check if user is authenticated and is a seller
if (!is_authenticated()) {
    // Redirect to login page
    header("Location: login.html");
    exit;
}

if (!is_seller()) {
    // Redirect to homepage with error message
    header("Location: /?error=not_seller");
    exit;
}

// Get user data
$user_id = get_user_id();
$user_name = $_SESSION['user_name'];

// Get products for this seller
$conn = db_connect();
$query = "SELECT * FROM produk WHERE user_id = $1 ORDER BY created_at DESC";
$result = pg_query_params($conn, $query, [$user_id]);
$products = pg_fetch_all($result) ?: [];

// Get orders for this seller's products
$orders_query = "SELECT o.*, p.name as product_name, p.price, p.image
                FROM pesanan o
                JOIN produk p ON o.product_id = p.id
                WHERE p.user_id = $1
                ORDER BY o.created_at DESC";
$orders_result = pg_query_params($conn, $orders_query, [$user_id]);
$orders = pg_fetch_all($orders_result) ?: [];

db_close($conn);

// For demo purposes, if no products or orders, create mock data
if (empty($products) && getenv('APP_ENV') === 'development') {
    $products = [
        [
            "id" => 1,
            "name" => "Wireless Headphones",
            "description" => "High-quality wireless headphones with noise cancellation technology.",
            "price" => 1500000,
            "category_id" => 1,
            "user_id" => $user_id,
            "stock" => 50,
            "is_featured" => true,
            "image" => "https://images.pexels.com/photos/3394666/pexels-photo-3394666.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
            "created_at" => "2025-01-15 10:00:00"
        ],
        [
            "id" => 3,
            "name" => "Smart Watch",
            "description" => "Fitness tracker and smartwatch with heart rate monitoring.",
            "price" => 899000,
            "category_id" => 1,
            "user_id" => $user_id,
            "stock" => 30,
            "is_featured" => true,
            "image" => "https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
            "created_at" => "2025-01-20 09:15:00"
        ],
        [
            "id" => 8,
            "name" => "Portable Speaker",
            "description" => "Waterproof Bluetooth speaker with 20-hour battery life.",
            "price" => 450000,
            "category_id" => 1,
            "user_id" => $user_id,
            "stock" => 35,
            "is_featured" => false,
            "image" => "https://images.pexels.com/photos/1279107/pexels-photo-1279107.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
            "created_at" => "2025-01-30 16:20:00"
        ]
    ];
}

if (empty($orders) && getenv('APP_ENV') === 'development') {
    $orders = [
        [
            "id" => 1,
            "product_id" => 1,
            "product_name" => "Wireless Headphones",
            "user_id" => 2,
            "quantity" => 1,
            "price" => 1500000,
            "total" => 1500000,
            "status" => "completed",
            "created_at" => "2025-02-10 14:30:00",
            "image" => "https://images.pexels.com/photos/3394666/pexels-photo-3394666.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
        ],
        [
            "id" => 2,
            "product_id" => 3,
            "product_name" => "Smart Watch",
            "user_id" => 3,
            "quantity" => 2,
            "price" => 899000,
            "total" => 1798000,
            "status" => "processing",
            "created_at" => "2025-02-12 10:15:00",
            "image" => "https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
        ],
        [
            "id" => 3,
            "product_id" => 1,
            "product_name" => "Wireless Headphones",
            "user_id" => 4,
            "quantity" => 1,
            "price" => 1500000,
            "total" => 1500000,
            "status" => "shipped",
            "created_at" => "2025-02-13 09:20:00",
            "image" => "https://images.pexels.com/photos/3394666/pexels-photo-3394666.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
        ]
    ];
}

// Helper function to format price
function format_price($price) {
    return 'Rp ' . number_format($price, 0, ',', '.');
}

?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="../public/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Seller Dashboard - ElegantShop</title>
    <link rel="stylesheet" href="../css/style.css">
    <link rel="stylesheet" href="../css/dashboard.css">
  </head>
  <body>
    <div id="app">
      <header id="main-header">
        <div class="container">
          <div class="logo">
            <a href="#">
              <h1>ElegantShop</h1>
            </a>
          </div>
          <nav>
            <ul class="nav-links">
              <li><a href="#">Home</a></li>
              <li><a href="shop.html">Shop</a></li>
              <li><a href="about.html">About</a></li>
              <li><a href="contact.html">Contact</a></li>
            </ul>
          </nav>
          <div class="header-buttons">
            <a href="cart.html" class="icon-button" aria-label="Cart">
              <span class="material-icons">shopping_cart</span>
              <span id="cart-count" class="badge">0</span>
            </a>
            <div id="user-menu" class="user-menu">
              <button id="user-menu-toggle" class="icon-button" aria-label="User menu">
                <span class="material-icons">person</span>
              </button>
              <div id="user-dropdown" class="dropdown-menu">
                <div id="user-section">
                  <a href="profile.html" class="dropdown-item">My Profile</a>
                  <a href="orders.html" class="dropdown-item">My Orders</a>
                  <a href="seller-dashboard.php" id="seller-dashboard-link" class="dropdown-item active">Seller Dashboard</a>
                  <hr>
                  <a href="#" id="logout-btn" class="dropdown-item">Logout</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>
        <div class="container">
          <div class="dashboard">
            <div class="dashboard-header">
              <h2>Seller Dashboard</h2>
              <p>Welcome, <?php echo htmlspecialchars($user_name); ?>!</p>
            </div>
            
            <div class="dashboard-stats">
              <div class="stat-card">
                <div class="stat-icon">
                  <span class="material-icons">inventory_2</span>
                </div>
                <div class="stat-details">
                  <h3><?php echo count($products); ?></h3>
                  <p>Products</p>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">
                  <span class="material-icons">shopping_bag</span>
                </div>
                <div class="stat-details">
                  <h3><?php echo count($orders); ?></h3>
                  <p>Orders</p>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">
                  <span class="material-icons">payments</span>
                </div>
                <div class="stat-details">
                  <h3><?php 
                    $total_earnings = array_reduce($orders, function($carry, $order) {
                      return $carry + ($order['total'] ?? 0);
                    }, 0);
                    echo format_price($total_earnings);
                  ?></h3>
                  <p>Earnings</p>
                </div>
              </div>
            </div>
            
            <div class="dashboard-tabs">
              <div class="tab-buttons">
                <button class="tab-button active" data-tab="products">Products</button>
                <button class="tab-button" data-tab="orders">Orders</button>
              </div>
              
              <div class="tab-content">
                <!-- Products Tab -->
                <div id="products-tab" class="tab-pane active">
                  <div class="tab-header">
                    <h3>My Products</h3>
                    <button id="add-product-btn" class="btn btn-primary">
                      <span class="material-icons">add</span> Add Product
                    </button>
                  </div>
                  
                  <div class="products-list">
                    <div class="table-responsive">
                      <table class="data-table">
                        <thead>
                          <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Category</th>
                            <th>Featured</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <?php if (empty($products)): ?>
                            <tr>
                              <td colspan="7" class="no-data">No products found. Add your first product!</td>
                            </tr>
                          <?php else: ?>
                            <?php foreach ($products as $product): ?>
                              <tr>
                                <td>
                                  <img src="<?php echo htmlspecialchars($product['image']); ?>" alt="<?php echo htmlspecialchars($product['name']); ?>" class="product-thumbnail">
                                </td>
                                <td><?php echo htmlspecialchars($product['name']); ?></td>
                                <td><?php echo format_price($product['price']); ?></td>
                                <td><?php echo $product['stock']; ?></td>
                                <td>
                                  <?php 
                                    $category_names = [
                                      1 => 'Electronics',
                                      2 => 'Fashion',
                                      3 => 'Home & Living',
                                      4 => 'Sports'
                                    ];
                                    echo $category_names[$product['category_id']] ?? 'Unknown';
                                  ?>
                                </td>
                                <td>
                                  <span class="badge <?php echo $product['is_featured'] ? 'badge-success' : 'badge-gray'; ?>">
                                    <?php echo $product['is_featured'] ? 'Yes' : 'No'; ?>
                                  </span>
                                </td>
                                <td>
                                  <div class="action-buttons">
                                    <button class="action-btn edit-product" data-id="<?php echo $product['id']; ?>" title="Edit product">
                                      <span class="material-icons">edit</span>
                                    </button>
                                    <button class="action-btn delete-product" data-id="<?php echo $product['id']; ?>" title="Delete product">
                                      <span class="material-icons">delete</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            <?php endforeach; ?>
                          <?php endif; ?>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                
                <!-- Orders Tab -->
                <div id="orders-tab" class="tab-pane">
                  <div class="tab-header">
                    <h3>Recent Orders</h3>
                  </div>
                  
                  <div class="orders-list">
                    <div class="table-responsive">
                      <table class="data-table">
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Total</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <?php if (empty($orders)): ?>
                            <tr>
                              <td colspan="7" class="no-data">No orders found.</td>
                            </tr>
                          <?php else: ?>
                            <?php foreach ($orders as $order): ?>
                              <tr>
                                <td>#<?php echo $order['id']; ?></td>
                                <td>
                                  <div class="product-info">
                                    <img src="<?php echo htmlspecialchars($order['image']); ?>" alt="<?php echo htmlspecialchars($order['product_name']); ?>" class="product-thumbnail">
                                    <span><?php echo htmlspecialchars($order['product_name']); ?></span>
                                  </div>
                                </td>
                                <td><?php echo $order['quantity']; ?></td>
                                <td><?php echo format_price($order['total']); ?></td>
                                <td><?php echo date('d M Y', strtotime($order['created_at'])); ?></td>
                                <td>
                                  <span class="badge 
                                    <?php 
                                      switch($order['status']) {
                                        case 'pending': echo 'badge-warning'; break;
                                        case 'processing': echo 'badge-info'; break;
                                        case 'shipped': echo 'badge-primary'; break;
                                        case 'completed': echo 'badge-success'; break;
                                        case 'cancelled': echo 'badge-error'; break;
                                        default: echo 'badge-gray';
                                      }
                                    ?>">
                                    <?php echo ucfirst($order['status']); ?>
                                  </span>
                                </td>
                                <td>
                                  <button class="btn btn-sm btn-outline view-order" data-id="<?php echo $order['id']; ?>">
                                    View Details
                                  </button>
                                </td>
                              </tr>
                            <?php endforeach; ?>
                          <?php endif; ?>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <!-- Product Form Modal -->
      <div id="product-modal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3 id="modal-title">Add New Product</h3>
            <button class="close-modal">
              <span class="material-icons">close</span>
            </button>
          </div>
          <div class="modal-body">
            <form id="product-form">
              <input type="hidden" id="product-id" name="id">
              
              <div class="form-group">
                <label for="product-name">Product Name</label>
                <input type="text" id="product-name" name="name" required>
              </div>
              
              <div class="form-group">
                <label for="product-description">Description</label>
                <textarea id="product-description" name="description" rows="4"></textarea>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="product-price">Price (Rp)</label>
                  <input type="number" id="product-price" name="price" min="0" step="1000" required>
                </div>
                <div class="form-group">
                  <label for="product-stock">Stock</label>
                  <input type="number" id="product-stock" name="stock" min="0" required>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="product-category">Category</label>
                  <select id="product-category" name="category_id" required>
                    <option value="">Select Category</option>
                    <option value="1">Electronics</option>
                    <option value="2">Fashion</option>
                    <option value="3">Home & Living</option>
                    <option value="4">Sports</option>
                  </select>
                </div>
                <div class="form-group checkbox-group">
                  <input type="checkbox" id="product-featured" name="is_featured">
                  <label for="product-featured">Featured Product</label>
                </div>
              </div>
              
              <div class="form-group">
                <label for="product-image">Image URL</label>
                <input type="url" id="product-image" name="image" placeholder="https://example.com/image.jpg" required>
              </div>
              
              <div class="form-actions">
                <button type="button" class="btn btn-outline cancel-modal">Cancel</button>
                <button type="submit" class="btn btn-primary" id="save-product-btn">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <!-- Order Details Modal -->
      <div id="order-modal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Order Details</h3>
            <button class="close-modal">
              <span class="material-icons">close</span>
            </button>
          </div>
          <div class="modal-body">
            <div id="order-details">
              <!-- Order details will be loaded here -->
            </div>
            
            <div class="form-actions">
              <button type="button" class="btn btn-outline cancel-modal">Close</button>
              <div id="order-actions"></div>
            </div>
          </div>
        </div>
      </div>

      <footer>
        <div class="container">
          <div class="footer-content">
            <div class="footer-section">
              <h3>ElegantShop</h3>
              <p>Your one-stop shop for quality products at affordable prices.</p>
            </div>
            <div class="footer-section">
              <h3>Quick Links</h3>
              <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/pages/shop.html">Shop</a></li>
                <li><a href="/pages/about.html">About</a></li>
                <li><a href="/pages/contact.html">Contact</a></li>
              </ul>
            </div>
            <div class="footer-section">
              <h3>Contact</h3>
              <p>Email: info@elegantshop.com</p>
              <p>Phone: +1 (555) 123-4567</p>
            </div>
          </div>
          <div class="footer-bottom">
            <p>&copy; 2025 ElegantShop. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>

    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <script type="module" src="../js/main.js"></script>
    <script type="module" src="../js/dashboard.js"></script>
  </body>
</html> 