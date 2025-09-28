// Cart Management
const Cart = {
    items: [],

    init: () => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            Cart.items = JSON.parse(savedCart);
            Cart.updateCartUI();
        }
    },

    addItem: (itemId, itemName, price) => {
        const existingItem = Cart.items.find(item => item.id === itemId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            Cart.items.push({
                id: itemId,
                name: itemName,
                price: price,
                quantity: 1
            });
        }
        
        Cart.saveCart();
        Cart.updateCartUI();
        Utils.showNotification(`${itemName} added to cart`, 'success');
    },

    removeItem: (itemId) => {
        Cart.items = Cart.items.filter(item => item.id !== itemId);
        Cart.saveCart();
        Cart.updateCartUI();
        Utils.showNotification('Item removed from cart', 'info');
    },

    updateQuantity: (itemId, change) => {
        const item = Cart.items.find(item => item.id === itemId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                Cart.removeItem(itemId);
            } else {
                Cart.saveCart();
                Cart.updateCartUI();
            }
        }
    },

    calculateSubtotal: () => {
        return Cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    calculateShipping: () => {
        const subtotal = Cart.calculateSubtotal();
        return subtotal > 999 ? 0 : 49; // Free shipping above ₹999
    },

    calculateTotal: () => {
        return Cart.calculateSubtotal() + Cart.calculateShipping();
    },

    saveCart: () => {
        localStorage.setItem('cart', JSON.stringify(Cart.items));
    },

    updateCartUI: () => {
        const cartCount = document.getElementById('cart-count');
        const totalItems = Cart.items.reduce((total, item) => total + item.quantity, 0);
        
        if (cartCount) {
            cartCount.textContent = totalItems;
        }
        
        // Show/hide cart button based on items
        const cartButton = document.getElementById('cart-button');
        if (cartButton) {
            cartButton.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    },

    displayCart: () => {
        const container = document.getElementById('cart-content');
        if (!container) return;
        
        const subtotal = Cart.calculateSubtotal();
        const shipping = Cart.calculateShipping();
        const total = Cart.calculateTotal();
        
        container.innerHTML = Cart.items.length === 0 ? 
            `<div class="empty-state">
                <h3>Your cart is empty</h3>
                <p>Add some amazing products to your cart!</p>
                <button class="btn btn-primary" onclick="Utils.showPage('home-page')">Start Shopping</button>
            </div>` :
            `
            <div class="cart-items">
                ${Cart.items.map(item => `
                    <div class="cart-item">
                        <div class="cart-item-image">
                            ${item.name}
                        </div>
                        <div class="cart-item-details">
                            <h4 class="cart-item-name">${item.name}</h4>
                            <div class="cart-item-price">${Utils.formatCurrency(item.price)}</div>
                        </div>
                        <div class="cart-item-controls">
                            <button class="quantity-btn" data-id="${item.id}" data-change="-1">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn" data-id="${item.id}" data-change="1">+</button>
                            <button class="btn btn-danger btn-sm remove-btn" data-id="${item.id}">Remove</button>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="cart-summary">
                <div class="summary-row">
                    <span>Subtotal:</span>
                    <span>${Utils.formatCurrency(subtotal)}</span>
                </div>
                <div class="summary-row">
                    <span>Shipping:</span>
                    <span>${shipping === 0 ? 'FREE' : Utils.formatCurrency(shipping)}</span>
                </div>
                <div class="summary-row total">
                    <span>Total:</span>
                    <span>${Utils.formatCurrency(total)}</span>
                </div>
                ${shipping > 0 ? `
                    <div class="shipping-notice">
                        <small>Add ${Utils.formatCurrency(1000 - subtotal)} more for FREE shipping!</small>
                    </div>
                ` : ''}
                <button class="btn btn-primary" id="checkout-btn">Proceed to Checkout</button>
            </div>
            `;

        // Add event listeners
        container.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                Cart.updateQuantity(btn.dataset.id, parseInt(btn.dataset.change));
                Cart.displayCart(); // Refresh display
            });
        });

        container.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                Cart.removeItem(btn.dataset.id);
                Cart.displayCart(); // Refresh display
            });
        });

        if (Cart.items.length > 0) {
            document.getElementById('checkout-btn').addEventListener('click', Cart.checkout);
        }
    },

    checkout: async () => {
        try {
            // Show loading state
            const button = document.getElementById('checkout-btn');
            const originalText = button.textContent;
            button.textContent = 'Processing...';
            button.disabled = true;

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Create order
            const order = {
                order_id: 'SHOP' + Date.now().toString().slice(-6),
                total_cost: Cart.calculateTotal(),
                order_placed_at: new Date().toISOString(),
                status: 'pending',
                items: [...Cart.items]
            };
            
            // Save order to history
            const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
            orderHistory.unshift(order);
            localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
            
            Utils.showNotification('Order placed successfully!', 'success');
            
            // Clear cart
            Cart.items = [];
            Cart.saveCart();
            Cart.updateCartUI();
            
            // Navigate to orders page
            Utils.showPage('orders-page');
            
        } catch (error) {
            Utils.showNotification('Error placing order. Please try again.', 'error');
            
            // Reset button
            const button = document.getElementById('checkout-btn');
            button.textContent = 'Proceed to Checkout';
            button.disabled = false;
        }
    },

    // Get cart item count
    getItemCount: () => {
        return Cart.items.reduce((total, item) => total + item.quantity, 0);
    },

    // Clear cart
    clearCart: () => {
        Cart.items = [];
        Cart.saveCart();
        Cart.updateCartUI();
    }
};