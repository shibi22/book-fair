const ADMIN_NUMBER = '919551901911'; // Added 91 country code

function renderCart() {
    console.log('renderCart started');
    const container = document.getElementById('cart-items');
    const emptyState = document.getElementById('empty-cart');
    const footer = document.getElementById('checkout-footer');

    if (!container) {
        console.error('Error: cart-items container not found!');
        return;
    }

    const cart = Cart.get();
    console.log('Cart data in checkout:', cart);

    // DEBUG: If empty, try to read raw localStorage to see if key exists
    const raw = localStorage.getItem('bookfair_cart');
    console.log('Raw localStorage value:', raw);

    if (cart.length === 0) {
        console.log('Cart is empty, showing empty state');
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
        footer.classList.add('hidden');
        return;
    }

    console.log('Cart has items, rendering list');
    emptyState.classList.add('hidden');
    footer.classList.remove('hidden');
    container.innerHTML = '';

    cart.forEach(item => {
        console.log('Rendering item:', item.name);
        const el = document.createElement('div');
        el.className = 'bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center';
        el.innerHTML = `
            <div class="flex-1">
                <h3 class="font-bold text-gray-800 text-sm mb-1">${item.name}</h3>
                <p class="text-green-600 font-bold">₹${item.price * item.quantity}</p>
            </div>
            <div class="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                <button onclick="Cart.updateQuantity(${item.id}, -1); renderCart()" class="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-white rounded-md transition">
                    <i class="fas fa-minus text-xs"></i>
                </button>
                <span class="font-bold text-gray-700 w-4 text-center">${item.quantity}</span>
                <button onclick="Cart.updateQuantity(${item.id}, 1); renderCart()" class="w-8 h-8 flex items-center justify-center text-[#1b2a4e] hover:bg-white rounded-md transition">
                    <i class="fas fa-plus text-xs"></i>
                </button>
            </div>
        `;
        container.appendChild(el);
    });

    Cart.updateUI(); // Updates totals
}

function checkout() {
    const cart = Cart.get();
    if (cart.length === 0) return;

    let message = "Hello,\nI would like to order the following books:\n\n";

    cart.forEach((item, index) => {
        message += `${index + 1}. ${item.name} × ${item.quantity} = ₹${item.price * item.quantity}\n`;
    });

    const total = Cart.getTotal();
    message += `\nTotal Amount: ₹${total}\n\nPlease confirm availability.`;

    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${ADMIN_NUMBER}?text=${encodedMessage}`;

    window.open(url, '_blank');
}

document.addEventListener('DOMContentLoaded', renderCart);
