// Auth Check
document.addEventListener('DOMContentLoaded', async () => {
    await checkAdminAuth();
    fetchBooks();
});

async function logout() {
    await supabaseClient.auth.signOut();
    window.location.href = 'admin-login.html';
}

async function fetchBooks() {
    const container = document.getElementById('admin-books-list');

    try {
        const { data: books, error } = await supabaseClient
            .from('books')
            .select('*')
            .order('id'); // Order by ID to keep consistent list

        if (error) throw error;

        container.innerHTML = '';

        books.forEach(book => {
            const el = document.createElement('div');
            const isLowStock = book.stock <= 2 && book.stock > 0;
            const isOutOfStock = book.stock === 0;

            let statusClass = 'bg-white border-gray-200';
            if (isLowStock) statusClass = 'bg-orange-50 border-orange-200';
            if (isOutOfStock) statusClass = 'bg-red-50 border-red-200';

            el.className = `p-4 rounded-lg shadow-sm border flex flex-col sm:flex-row justify-between items-center gap-4 ${statusClass}`;

            el.innerHTML = `
                <div class="flex-1">
                    <h3 class="font-bold text-gray-800">${book.name}</h3>
                    <p class="text-sm text-gray-500">ID: ${book.id} | Price: ₹${book.price}</p>
                </div>
                
                <div class="flex items-center gap-4">
                    <div class="flex items-center gap-2">
                        <button onclick="updateStock(${book.id}, ${book.stock - 1})" class="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300 flex items-center justify-center">
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" 
                               value="${book.stock}" 
                               onchange="updateStock(${book.id}, this.value)"
                               class="w-16 text-center border rounded py-1 font-bold bg-white"
                        >
                        <button onclick="updateStock(${book.id}, ${book.stock + 1})" class="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300 flex items-center justify-center">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    
                    <div id="status-${book.id}" class="w-6">
                        <!-- Success/Error icon placeholder -->
                    </div>
                </div>
            `;
            container.appendChild(el);
        });

    } catch (err) {
        console.error('Error fetching books:', err);
        container.innerHTML = '<div class="text-red-500 text-center">Failed to load books.</div>';
    }
}

async function updateStock(bookId, newStock) {
    const stockVal = parseInt(newStock);
    if (isNaN(stockVal) || stockVal < 0) return;

    const statusEl = document.getElementById(`status-${bookId}`);
    statusEl.innerHTML = '<i class="fas fa-spinner fa-spin text-gray-400"></i>';

    try {
        const { error } = await supabaseClient
            .from('books')
            .update({ stock: stockVal, updated_at: new Date() })
            .eq('id', bookId);

        if (error) throw error;

        statusEl.innerHTML = '<i class="fas fa-check text-green-500"></i>';

        // Refresh list after short delay to show updated status colors if needed
        // Or just leave it. Let's leave it to avoid jumping UI, but maybe update the row style?
        // For simplicity, we just show the checkmark.
        setTimeout(() => {
            statusEl.innerHTML = '';
        }, 2000);

    } catch (err) {
        console.error('Error updating stock:', err);
        statusEl.innerHTML = '<i class="fas fa-times text-red-500"></i>';
        alert('Failed to update stock');
    }
}
