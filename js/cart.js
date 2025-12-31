const CART_KEY = 'bookfair_cart';

const Cart = {
    get() {
        try {
            return JSON.parse(localStorage.getItem(CART_KEY)) || [];
        } catch (e) {
            console.error('Cart parse error:', e);
            return [];
        }
    },

    add(book) {
        console.log('Cart.add called with:', book);
        const cart = this.get();
        // Ensure we compare loosely (==) because localStorage might store IDs as strings
        const existingItem = cart.find(item => item.id == book.id);

        if (existingItem) {
            if (existingItem.quantity < book.stock) {
                existingItem.quantity++;
            } else {
                alert(`Only ${book.stock} copies available!`);
                return;
            }
        } else {
            cart.push({ ...book, quantity: 1 });
        }

        console.log('Saving cart:', cart);
        this.save(cart);
        this.updateUI();
    },

    remove(bookId) {
        let cart = this.get();
        cart = cart.filter(item => item.id !== bookId);
        this.save(cart);
        this.updateUI();
    },

    updateQuantity(bookId, change) {
        const cart = this.get();
        const item = cart.find(item => item.id === bookId);

        if (item) {
            const newQty = item.quantity + change;
            if (newQty > 0 && newQty <= item.stock) {
                item.quantity = newQty;
            } else if (newQty <= 0) {
                this.remove(bookId);
                return;
            }
        }
        this.save(cart);
        this.updateUI();
    },

    save(cart) {
        console.log('Writing to localStorage:', JSON.stringify(cart));
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    },

    clear() {
        localStorage.removeItem(CART_KEY);
        this.updateUI();
    },

    getTotal() {
        const cart = this.get();
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    updateUI() {
        // Update any cart badges if they exist
        const total = this.getTotal();
        const count = this.get().reduce((c, item) => c + item.quantity, 0);

        const cartBadges = document.querySelectorAll('.cart-badge');
        cartBadges.forEach(el => el.innerText = count > 0 ? count : '');

        const cartTotals = document.querySelectorAll('.cart-total');
        cartTotals.forEach(el => el.innerText = `₹${total}`);
    }
};
