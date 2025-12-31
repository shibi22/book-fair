async function fetchBooks() {
    const container = document.getElementById('books-container');

    try {
        const { data: books, error } = await supabaseClient
            .from('books')
            .select('*')
            .order('name');

        if (error) throw error;

        container.innerHTML = '';

        if (!books || books.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-10 text-gray-500">
                    <p class="text-xl mb-2">No books available at the moment.</p>
                    <p class="text-xs text-gray-400">Debug: Fetched 0 books. Check RLS policies or Table Data.</p>
                </div>`;
            return;
        }

        // Store books in global map for easy access by ID
        window.allBooks = books;

        books.forEach(book => {
            const card = document.createElement('div');
            card.className = 'book-card bg-white rounded-xl shadow-sm overflow-hidden flex flex-col h-full border border-gray-100';

            const isOutOfStock = book.stock <= 0;
            const stockBadge = isOutOfStock
                ? '<span class="absolute top-2 right-2 bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-bold">Out of Stock</span>'
                : (book.stock <= 5
                    ? `<span class="absolute top-2 right-2 bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full font-bold">Only ${book.stock} left</span>`
                    : '');

            card.innerHTML = `
                <div class="relative h-32 bg-gray-200 flex items-center justify-center text-gray-400">
                    <i class="fas fa-book text-4xl"></i>
                    ${stockBadge}
                </div>
                <div class="p-3 flex-1 flex flex-col">
                    <h3 class="font-bold text-gray-800 text-sm line-clamp-2 mb-1">${book.name}</h3>
                    <div class="mt-auto flex justify-between items-center">
                        <span class="text-lg font-bold text-[#1b2a4e]">₹${book.price}</span>
                        <div id="book-controls-${book.id}">
                            ${getBookControlsHtml(book)}
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (err) {
        console.error('Error fetching books:', err);
        container.innerHTML = '<div class="col-span-full text-center py-10 text-red-500">Failed to load books. Please try again.</div>';
    }
}

function getBookControlsHtml(book) {
    const cartItem = Cart.get().find(item => item.id == book.id);
    const quantity = cartItem ? cartItem.quantity : 0;
    const isOutOfStock = book.stock <= 0;

    if (quantity > 0) {
        return `
            <div class="flex items-center gap-2">
                <button onclick="updateBookQuantity(${book.id}, -1)" class="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center transition">
                    <i class="fas fa-minus text-xs"></i>
                </button>
                <span class="font-bold text-[#1b2a4e] w-4 text-center">${quantity}</span>
                <button onclick="updateBookQuantity(${book.id}, 1)" class="w-8 h-8 rounded-full bg-[#1b2a4e] text-white hover:bg-[#243a6b] flex items-center justify-center transition" ${quantity >= book.stock ? 'disabled' : ''}>
                    <i class="fas fa-plus text-xs"></i>
                </button>
            </div>
        `;
    }

    return `
        <button 
            onclick="addToCart(${book.id})"
            class="w-8 h-8 rounded-full flex items-center justify-center transition ${isOutOfStock ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#1b2a4e] text-white hover:bg-[#243a6b]'}"
            ${isOutOfStock ? 'disabled' : ''}
        >
            <i class="fas fa-plus text-xs"></i>
        </button>
    `;
}

function addToCart(bookId) {
    const book = window.allBooks.find(b => b.id == bookId);
    if (book) {
        Cart.add(book);
        refreshBookControl(bookId);
        showCartFooter();
    }
}

function updateBookQuantity(bookId, change) {
    Cart.updateQuantity(bookId, change);
    refreshBookControl(bookId);
    showCartFooter();
}

function refreshBookControl(bookId) {
    const container = document.getElementById(`book-controls-${bookId}`);
    const book = window.allBooks.find(b => b.id == bookId);
    if (container && book) {
        container.innerHTML = getBookControlsHtml(book);
    }
}

function showCartFooter() {
    const footer = document.getElementById('cart-footer');
    const count = Cart.get().length;
    if (count > 0) {
        footer.classList.remove('hidden');
    } else {
        footer.classList.add('hidden');
    }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    fetchBooks();
    Cart.updateUI();
    showCartFooter();
});
