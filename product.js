// Products Management
const Products = {
    currentProducts: [],
    currentProduct: null,
    wishlist: [],

    // Fetch all products
    fetchAll: async (category = 'all', searchTerm = '') => {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Mock product data
            const mockProducts = [
                {
                    id: "1",
                    name: "Wireless Bluetooth Headphones",
                    category: "electronics",
                    price: 1999,
                    originalPrice: 2999,
                    rating: 4.5,
                    reviewCount: 1247,
                    description: "High-quality wireless headphones with noise cancellation and 30-hour battery life.",
                    inStock: true,
                    features: ["Noise Cancellation", "30hr Battery", "Fast Charging"]
                },
                {
                    id: "2",
                    name: "Smart Fitness Band",
                    category: "electronics",
                    price: 2499,
                    originalPrice: 3999,
                    rating: 4.2,
                    reviewCount: 892,
                    description: "Track your fitness with heart rate monitoring, sleep tracking, and smartphone notifications.",
                    inStock: true,
                    features: ["Heart Rate Monitor", "Sleep Tracking", "Water Resistant"]
                },
                {
                    id: "3",
                    name: "Cotton T-Shirt (Pack of 3)",
                    category: "fashion",
                    price: 899,
                    originalPrice: 1299,
                    rating: 4.3,
                    reviewCount: 567,
                    description: "Comfortable cotton t-shirts in assorted colors. Perfect for everyday wear.",
                    inStock: true,
                    features: ["100% Cotton", "Machine Wash", "Pack of 3"]
                },
                {
                    id: "4",
                    name: "Stainless Steel Water Bottle",
                    category: "home",
                    price: 599,
                    originalPrice: 899,
                    rating: 4.7,
                    reviewCount: 345,
                    description: "Keep your drinks hot or cold for hours with this insulated stainless steel bottle.",
                    inStock: true,
                    features: ["Insulated", "BPA Free", "1 Liter Capacity"]
                },
                {
                    id: "5",
                    name: "Organic Face Cream",
                    category: "beauty",
                    price: 1299,
                    originalPrice: 1999,
                    rating: 4.4,
                    reviewCount: 234,
                    description: "Nourish your skin with this organic face cream made with natural ingredients.",
                    inStock: true,
                    features: ["Organic", "Cruelty Free", "For All Skin Types"]
                },
                {
                    id: "6",
                    name: "Wireless Mouse",
                    category: "electronics",
                    price: 799,
                    originalPrice: 1299,
                    rating: 4.1,
                    reviewCount: 678,
                    description: "Ergonomic wireless mouse with precision tracking and long battery life.",
                    inStock: true,
                    features: ["2.4GHz Wireless", "Optical Tracking", "12 Months Battery"]
                },
                {
                    id: "7",
                    name: "Denim Jeans",
                    category: "fashion",
                    price: 1599,
                    originalPrice: 2299,
                    rating: 4.0,
                    reviewCount: 445,
                    description: "Classic denim jeans with comfortable fit and durable fabric.",
                    inStock: true,
                    features: ["100% Cotton", "Regular Fit", "Machine Wash"]
                },
                {
                    id: "8",
                    name: "Non-Stick Cookware Set",
                    category: "home",
                    price: 3499,
                    originalPrice: 4999,
                    rating: 4.6,
                    reviewCount: 289,
                    description: "Complete cookware set with non-stick coating for healthy cooking.",
                    inStock: true,
                    features: ["Non-Stick", "Dishwasher Safe", "3-Piece Set"]
                }
            ];

            // Filter by category
            let filteredProducts = mockProducts;
            if (category !== 'all') {
                filteredProducts = mockProducts.filter(product => product.category === category);
            }

            // Filter by search term
            if (searchTerm) {
                filteredProducts = filteredProducts.filter(product => 
                    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    product.description.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }

            Products.currentProducts = filteredProducts;
            Products.displayProducts(filteredProducts);
        } catch (error) {
            Utils.showNotification('Error loading products', 'error');
        }
    },

    // Display products
    displayProducts: (products) => {
        const container = document.getElementById('products-list');
        if (!container) return;
        
        container.innerHTML = '';

        if (products.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No products found</h3>
                    <p>Try adjusting your search or browse different categories.</p>
                </div>
            `;
            return;
        }

        products.forEach(product => {
            const discount = Utils.calculateDiscount(product.originalPrice, product.price);
            const isInWishlist = Products.wishlist.includes(product.id);
            
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-image-placeholder">
                    ${product.name}
                </div>
                <div class="product-info">
                    <div class="product-category">${product.category}</div>
                    <h3 class="product-name">${product.name}</h3>
                    
                    <div class="product-rating">
                        <span class="rating-stars">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5-Math.floor(product.rating))}</span>
                        <span class="rating-count">(${product.reviewCount})</span>
                    </div>
                    
                    <div class="product-price">
                        ${product.originalPrice > product.price ? `
                            <span class="product-original-price">${Utils.formatCurrency(product.originalPrice)}</span>
                            <span class="product-discount">${discount}% OFF</span>
                        ` : ''}
                        <div>${Utils.formatCurrency(product.price)}</div>
                    </div>
                    
                    <div class="product-actions">
                        <button class="btn btn-primary btn-sm add-to-cart" 
                                data-id="${product.id}" 
                                data-name="${product.name}" 
                                data-price="${product.price}">
                            Add to Cart
                        </button>
                        <button class="wishlist-btn ${isInWishlist ? 'active' : ''}" 
                                data-id="${product.id}">
                            ${isInWishlist ? '❤️' : '🤍'}
                        </button>
                    </div>
                </div>
            `;
            
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.add-to-cart') && !e.target.closest('.wishlist-btn')) {
                    Products.showProductDetails(product);
                }
            });
            
            container.appendChild(card);
        });

        // Add event listeners
        Products.attachProductEventListeners();
    },

    // Attach event listeners to product elements
    attachProductEventListeners: () => {
        // Add to cart buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = button.dataset.id;
                const productName = button.dataset.name;
                const productPrice = parseFloat(button.dataset.price);
                
                Cart.addItem(productId, productName, productPrice);
                
                // Visual feedback
                const originalText = button.textContent;
                button.textContent = 'Added ✓';
                button.disabled = true;
                setTimeout(() => {
                    button.textContent = originalText;
                    button.disabled = false;
                }, 1500);
            });
        });

        // Wishlist buttons
        document.querySelectorAll('.wishlist-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = button.dataset.id;
                Products.toggleWishlist(productId, button);
            });
        });
    },

    // Show product details
    showProductDetails: (product) => {
        Products.currentProduct = product;
        Utils.showPage('product-page');
        
        const container = document.getElementById('product-details');
        if (!container) return;
        
        const discount = Utils.calculateDiscount(product.originalPrice, product.price);
        const isInWishlist = Products.wishlist.includes(product.id);
        
        container.innerHTML = `
            <div class="product-detail-container">
                <div class="product-detail-image">
                    ${product.name}
                </div>
                
                <div class="product-detail-info">
                    <div class="product-category">${product.category}</div>
                    <h2>${product.name}</h2>
                    
                    <div class="product-detail-rating">
                        <span class="rating-stars">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5-Math.floor(product.rating))}</span>
                        <span class="rating-count">${product.rating} (${product.reviewCount} reviews)</span>
                    </div>
                    
                    <div class="product-detail-price">
                        ${product.originalPrice > product.price ? `
                            <span class="product-original-price">${Utils.formatCurrency(product.originalPrice)}</span>
                            <span class="product-discount">${discount}% OFF</span>
                        ` : ''}
                        <div>${Utils.formatCurrency(product.price)}</div>
                    </div>
                    
                    <p class="product-detail-description">${product.description}</p>
                    
                    ${product.features ? `
                        <div class="product-features">
                            <h4>Features:</h4>
                            <ul>
                                ${product.features.map(feature => `<li>${feature}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    <div class="quantity-controls">
                        <label>Quantity:</label>
                        <button class="quantity-btn" id="decrease-qty">-</button>
                        <span class="quantity-display" id="quantity">1</span>
                        <button class="quantity-btn" id="increase-qty">+</button>
                    </div>
                    
                    <div class="product-detail-actions">
                        <button class="btn btn-primary" id="add-to-cart-detail">
                            Add to Cart
                        </button>
                        <button class="btn btn-secondary wishlist-btn-detail ${isInWishlist ? 'active' : ''}" 
                                data-id="${product.id}">
                            ${isInWishlist ? '❤️ Remove from Wishlist' : '🤍 Add to Wishlist'}
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners for detail page
        Products.attachDetailPageEventListeners();
    },

    // Attach event listeners for product detail page
    attachDetailPageEventListeners: () => {
        let quantity = 1;
        
        // Quantity controls
        document.getElementById('decrease-qty').addEventListener('click', () => {
            if (quantity > 1) {
                quantity--;
                document.getElementById('quantity').textContent = quantity;
            }
        });

        document.getElementById('increase-qty').addEventListener('click', () => {
            quantity++;
            document.getElementById('quantity').textContent = quantity;
        });

        // Add to cart from detail page
        document.getElementById('add-to-cart-detail').addEventListener('click', () => {
            if (Products.currentProduct) {
                for (let i = 0; i < quantity; i++) {
                    Cart.addItem(
                        Products.currentProduct.id,
                        Products.currentProduct.name,
                        Products.currentProduct.price
                    );
                }
                Utils.showNotification(`${quantity} ${Products.currentProduct.name} added to cart`, 'success');
            }
        });

        // Wishlist from detail page
        document.querySelector('.wishlist-btn-detail').addEventListener('click', function() {
            Products.toggleWishlist(this.dataset.id, this);
        });
    },

    // Toggle wishlist
    toggleWishlist: (productId, button) => {
        const index = Products.wishlist.indexOf(productId);
        
        if (index > -1) {
            // Remove from wishlist
            Products.wishlist.splice(index, 1);
            if (button) {
                button.classList.remove('active');
                button.innerHTML = button.classList.contains('wishlist-btn-detail') ? '🤍 Add to Wishlist' : '🤍';
            }
            Utils.showNotification('Removed from wishlist', 'info');
        } else {
            // Add to wishlist
            Products.wishlist.push(productId);
            if (button) {
                button.classList.add('active');
                button.innerHTML = button.classList.contains('wishlist-btn-detail') ? '❤️ Remove from Wishlist' : '❤️';
            }
            Utils.showNotification('Added to wishlist', 'success');
        }
        
        // Save wishlist to localStorage
        localStorage.setItem('wishlist', JSON.stringify(Products.wishlist));
    },

    // Load wishlist items
    loadWishlist: () => {
        const container = document.getElementById('wishlist-items');
        if (!container) return;
        
        // Load wishlist from localStorage
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
            Products.wishlist = JSON.parse(savedWishlist);
        }
        
        if (Products.wishlist.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>Your wishlist is empty</h3>
                    <p>Add products you love to your wishlist for easy access later.</p>
                    <button class="btn btn-primary" onclick="Utils.showPage('home-page')">Browse Products</button>
                </div>
            `;
            return;
        }
        
        // Filter products to show only wishlisted ones
        const wishlistProducts = Products.currentProducts.filter(product => 
            Products.wishlist.includes(product.id)
        );
        
        if (wishlistProducts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No wishlist items found</h3>
                    <p>Some items might be out of stock or no longer available.</p>
                </div>
            `;
            return;
        }
        
        Products.displayProducts(wishlistProducts);
    },

    // Load categories
    loadCategories: () => {
        const container = document.getElementById('categories-list');
        if (!container) return;
        
        const categories = [
            { id: 'electronics', name: 'Electronics', icon: '📱', count: 12 },
            { id: 'fashion', name: 'Fashion', icon: '👕', count: 8 },
            { id: 'home', name: 'Home & Kitchen', icon: '🏠', count: 15 },
            { id: 'beauty', name: 'Beauty', icon: '💄', count: 6 },
            { id: 'sports', name: 'Sports', icon: '⚽', count: 9 },
            { id: 'books', name: 'Books', icon: '📚', count: 7 }
        ];
        
        container.innerHTML = categories.map(category => `
            <div class="category-card" data-category="${category.id}">
                <div class="category-icon">${category.icon}</div>
                <div class="category-name">${category.name}</div>
                <div class="category-count">${category.count} products</div>
            </div>
        `).join('');
        
        // Add event listeners to category cards
        container.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                Products.fetchAll(category);
                Utils.showPage('home-page');
                document.getElementById('page-title').textContent = category.charAt(0).toUpperCase() + category.slice(1);
            });
        });
    },

    // Sort products
    sortProducts: (criteria) => {
        let sorted = [...Products.currentProducts];
        
        switch (criteria) {
            case 'popular':
                sorted.sort((a, b) => b.reviewCount - a.reviewCount);
                break;
            case 'price_low':
                sorted.sort((a, b) => a.price - b.price);
                break;
            case 'price_high':
                sorted.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                sorted.sort((a, b) => b.rating - a.rating);
                break;
        }
        
        Products.displayProducts(sorted);
    },

    // Search products
    searchProducts: (searchTerm) => {
        Products.fetchAll('all', searchTerm);
    },

    // Load user profile
    loadUserProfile: () => {
        const container = document.getElementById('user-profile');
        if (!container) return;
        
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        container.innerHTML = `
            <div class="profile-info">
                <div class="profile-field">
                    <span>Name:</span>
                    <span>${userData.name || 'Not available'}</span>
                </div>
                <div class="profile-field">
                    <span>Email:</span>
                    <span>${userData.email || 'Not available'}</span>
                </div>
                <div class="profile-field">
                    <span>Mobile:</span>
                    <span>${userData.mobile_number || 'Not available'}</span>
                </div>
                <div class="profile-field">
                    <span>Address:</span>
                    <span>${userData.address || 'Not available'}</span>
                </div>
            </div>
        `;
    },

    // Load FAQs
    loadFAQs: () => {
        const container = document.getElementById('faqs-content');
        if (!container) return;
        
        const faqs = [
            {
                question: "What payment methods do you accept?",
                answer: "We accept credit/debit cards, UPI, net banking, and cash on delivery."
            },
            {
                question: "How long does delivery take?",
                answer: "Delivery typically takes 3-7 business days depending on your location."
            },
            {
                question: "What is your return policy?",
                answer: "We offer 30-day return policy for most items. Some items like electronics have different return windows."
            },
            {
                question: "Do you offer international shipping?",
                answer: "Currently we only ship within India. International shipping will be available soon."
            },
            {
                question: "How can I track my order?",
                answer: "You can track your order from your order history page. We'll send you tracking updates via SMS and email."
            }
        ];

        container.innerHTML = faqs.map(faq => `
            <div class="faq-item">
                <div class="faq-question">${faq.question}</div>
                <div class="faq-answer">${faq.answer}</div>
            </div>
        `).join('');
    },

    // Load order history
    loadOrderHistory: async () => {
        const container = document.getElementById('orders-list');
        if (!container) return;
        
        try {
            // Show loading state
            container.innerHTML = '<div class="empty-state">Loading order history...</div>';
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mock order history data
            const orderHistory = [
                {
                    order_id: "SHOP001",
                    total_cost: "5297",
                    order_placed_at: "2024-01-15 14:30:00",
                    status: "delivered",
                    items: [
                        { name: "Wireless Bluetooth Headphones", price: "1999", quantity: 1 },
                        { name: "Smart Fitness Band", price: "2499", quantity: 1 },
                        { name: "Cotton T-Shirt (Pack of 3)", price: "899", quantity: 1 }
                    ]
                },
                {
                    order_id: "SHOP002",
                    total_cost: "3499",
                    order_placed_at: "2024-01-10 11:20:00",
                    status: "pending",
                    items: [
                        { name: "Non-Stick Cookware Set", price: "3499", quantity: 1 }
                    ]
                },
                {
                    order_id: "SHOP003",
                    total_cost: "1599",
                    order_placed_at: "2024-01-05 16:45:00",
                    status: "delivered",
                    items: [
                        { name: "Denim Jeans", price: "1599", quantity: 1 }
                    ]
                }
            ];
            
            Products.displayOrderHistory(orderHistory);
        } catch (error) {
            Utils.showNotification('Error loading order history', 'error');
            container.innerHTML = '<div class="empty-state">Failed to load order history</div>';
        }
    },

    // Display order history
    displayOrderHistory: (orders) => {
        const container = document.getElementById('orders-list');
        if (!container) return;
        
        if (!orders || orders.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No orders yet</h3>
                    <p>Your order history will appear here once you start shopping.</p>
                    <button class="btn btn-primary" onclick="Utils.showPage('home-page')">Start Shopping</button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="orders-container">
                ${orders.map(order => `
                    <div class="order-card">
                        <div class="order-header">
                            <div class="order-info">
                                <h3>Order #${order.order_id}</h3>
                                <p class="order-date">${Utils.formatDate(order.order_placed_at)}</p>
                                <span class="order-status status-${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                            </div>
                            <div class="order-total">
                                <span class="total-amount">${Utils.formatCurrency(order.total_cost)}</span>
                            </div>
                        </div>
                        
                        <div class="order-items">
                            <h4>Items:</h4>
                            <ul class="items-list">
                                ${order.items.map(item => `
                                    <li class="order-item">
                                        <span class="item-name">${item.name} × ${item.quantity}</span>
                                        <span class="item-price">${Utils.formatCurrency(item.price * item.quantity)}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                        
                        <div class="order-actions">
                            <button class="btn btn-secondary btn-sm" onclick="Products.reorder('${order.order_id}')">
                                Reorder
                            </button>
                            <button class="btn btn-secondary btn-sm" onclick="Products.viewOrderDetails('${order.order_id}')">
                                View Details
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    // Reorder functionality
    reorder: (orderId) => {
        Utils.showNotification(`Reordering items from order #${orderId}`, 'info');
        Utils.showPage('home-page');
    },

    // View order details
    viewOrderDetails: (orderId) => {
        Utils.showNotification(`Showing details for order #${orderId}`, 'info');
    }
};