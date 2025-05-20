INSERT INTO produk (name, description, price, category_id, user_id, stock, is_featured, image)
VALUES
('Wireless Headphones', 'High-quality wireless headphones with noise cancellation technology.', 1500000.00, 1, 1, 50, TRUE, 'img/headphones.jpg'),
('Casual T-Shirt', 'Comfortable cotton t-shirt for everyday wear.', 249000.00, 2, 1, 100, TRUE, 'img/tshirt.jpg'),
('Smart Watch', 'Fitness tracker and smartwatch with heart rate monitoring.', 899000.00, 1, 2, 75, TRUE, 'img/watch.jpg'),
('Coffee Maker', 'Automatic coffee maker for home and office use.', 750000.00, 3, 2, 40, TRUE, 'img/coffeemaker.jpg'),
('Running Shoes', 'Lightweight shoes for sports and daily activities.', 499000.00, 4, 1, 80, FALSE, 'img/shoes.jpg'),
('Bluetooth Speaker', 'Portable Bluetooth speaker with deep bass.', 599000.00, 1, 3, 60, FALSE, 'img/speaker.jpg'),
('Backpack', 'Durable backpack suitable for travel or school.', 329000.00, 2, 2, 30, FALSE, 'img/backpack.jpg'),
('Desk Lamp', 'LED desk lamp with adjustable brightness.', 199000.00, 3, 3, 25, FALSE, 'img/lamp.jpg'),
('Basketball', 'Official size basketball made of premium rubber.', 219000.00, 4, 1, 45, FALSE, 'img/basketball.jpg'),
('Sunglasses', 'UV protection sunglasses with modern design.', 159000.00, 2, 3, 70, FALSE, 'img/sunglasses.jpg');

INSERT INTO pengguna (name, email, password, phone, is_seller, created_at)
VALUES
('Oktavian Febrianto', 'febri@gmail.com', 'febri123', '081234567890', TRUE, CURRENT_TIMESTAMP),
('Dina Lestari', 'dina@gmail.com.com', 'dina123', '082345678901', TRUE, CURRENT_TIMESTAMP),
('Budi Santoso', 'budi@gmail.com', 'abc12345', '083456789012', TRUE, CURRENT_TIMESTAMP),
('Siti Nurhaliza', 'siti@gmail.com', 'siti123', '081345678912', FALSE, CURRENT_TIMESTAMP),
('Andre Wijaya', 'andre@gmail.com', 'pass1234', '081298765432', FALSE, CURRENT_TIMESTAMP),
('Rina Kartika', 'rina@gmail.com', 'qwerty', '082198761234', FALSE, CURRENT_TIMESTAMP),
('Yusuf Alamsyah', 'yusuf@gmail.com', '12345678', '081234123456', TRUE, CURRENT_TIMESTAMP),
('Nina Sari', 'nina@gmail.com', 'secretpass', '083456789101', FALSE, CURRENT_TIMESTAMP),
('Rahmat Hidayat', 'rahmat@gmail.com', 'rahmat2023', '081233344455', FALSE, CURRENT_TIMESTAMP),
('Intan Permata', 'intan@gmail.com', 'intanpass', '082211223344', TRUE, CURRENT_TIMESTAMP);



















