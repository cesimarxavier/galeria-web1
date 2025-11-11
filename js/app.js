const firebaseService = new FirebaseService();
let allItems = [];
let editingItemId = null;


const elements = {
    itemsGrid: document.getElementById('itemsGrid'),
    emptyState: document.getElementById('emptyState'),
    formModal: document.getElementById('formModal'),
    itemForm: document.getElementById('itemForm'),
    loadingSpinner: document.getElementById('loadingSpinner'),
    toast: document.getElementById('toast'),
    modalTitle: document.getElementById('modalTitle'),
    addNewBtn: document.getElementById('addNewBtn'),
    cancelBtn: document.getElementById('cancelBtn'),
    filterBtns: document.querySelectorAll('.filter-btn')
};


document.addEventListener('DOMContentLoaded', async () => {
    await loadItems();
    setupEventListeners();
});


async function loadItems() {
    showLoading(true);
    
    try {
        allItems = await firebaseService.fetchItems();
        renderItems(allItems);
        
        if (allItems.length === 0) {
            showEmptyState(true);
        }
    } catch (error) {
        showToast('Erro!', error.message, 'error');
    } finally {
        showLoading(false);
    }
}

function renderItems(items) {
    elements.itemsGrid.innerHTML = '';
    
    if (items.length === 0) {
        showEmptyState(true);
        return;
    }
    
    showEmptyState(false);
    
    items.forEach(item => {
        const card = createCard(item);
        elements.itemsGrid.appendChild(card);
    });
}


function createCard(item) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300';
    
    card.innerHTML = `
        <div class="relative h-64 bg-gray-200 overflow-hidden">
            <img src="${item.imagem}" class="w-full h-full object-cover hover:scale-110 transition-transform duration-300">

            <div class="absolute top-2 right-2">
                <span class="bg-ifrn-green text-white px-3 py-1 rounded-full text-xs font-semibold">
                    ${item.categoria}
                </span>
            </div>
        </div>
        
        <div class="p-4">
            <h3 class="text-xl font-bold text-gray-800 mb-2 truncate">${item.titulo}</h3>
            <p class="text-gray-600 text-sm mb-3 line-clamp-2">
                ${item.descricao}
            </p>
            
            <div class="space-y-2 mb-4 text-sm">
                <div class="flex items-center text-gray-700">
                    <span class="font-semibold mr-2">Curso :</span>
                    <span class="truncate">${item.curso}</span>
                </div>
                <div class="flex items-center text-gray-700">
                    <span class="font-semibold mr-2">Semestre:</span>
                    <span>${item.semestre}</span>
                </div>
            </div>
            
            <div class="flex gap-2 pt-3 border-t border-gray-200">
                <button onclick="editItem('${item.id}')" class="flex-1 bg-gray-50 text-gray-950 border px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors">
                    Editar
                </button>
                <button onclick="confirmDelete('${item.id}', '${item.titulo}')" class="flex-1 bg-red-50 text-gray-950 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors">
                    Remover
                </button>
            </div>
        </div>
    `;
    
    return card;
}

function setupEventListeners() {
    elements.addNewBtn.addEventListener('click', openAddModal);
    elements.cancelBtn.addEventListener('click', closeModal);
    elements.formModal.addEventListener('click', (e) => {
        if (e.target === elements.formModal) {
            closeModal();
        }
    });
    
    elements.itemForm.addEventListener('submit', handleFormSubmit);
    
    elements.filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            filterByCategory(category);
            
            elements.filterBtns.forEach(b => {
                b.classList.remove('active', 'bg-ifrn-green', 'text-white');
                b.classList.add('bg-gray-200', 'text-gray-700');
            });
            btn.classList.remove('bg-gray-200', 'text-gray-700');
            btn.classList.add('active', 'bg-ifrn-green', 'text-white');
        });
    });
}


function filterByCategory(category) {
    if (category === 'todos') {
        renderItems(allItems);
    } else {
        const filteredItems = allItems.filter(item => item.categoria === category);
        renderItems(filteredItems);
    }
}


function openAddModal() {
    editingItemId = null;
    elements.modalTitle.textContent = 'Você está adicionando um novo AWEr';
    elements.itemForm.reset();
    elements.formModal.classList.remove('hidden');
}


async function editItem(id) {
    editingItemId = id;
    elements.modalTitle.textContent = 'Edite o aluno';
    
    showLoading(true);
    
    try {
        const item = await firebaseService.getItem(id);
        
        document.getElementById('titulo').value = item.titulo;
        document.getElementById('descricao').value = item.descricao;
        document.getElementById('categoria').value = item.categoria;
        document.getElementById('imagem').value = item.imagem;
        document.getElementById('curso').value = item.curso;
        document.getElementById('semestre').value = item.semestre;
        
        elements.formModal.classList.remove('hidden');
    } catch (error) {
        showToast('Erro!', error.message, 'error');
    } finally {
        showLoading(false);
    }
}


function closeModal() {
    elements.formModal.classList.add('hidden');
    elements.itemForm.reset();
    editingItemId = null;
}


async function handleFormSubmit(e) {
    e.preventDefault();
    showLoading(true);
    try {
        const itemData = new Item(
            editingItemId,
            document.getElementById('titulo').value.trim(),
            document.getElementById('descricao').value.trim(),
            document.getElementById('categoria').value,
            document.getElementById('imagem').value.trim(),
            document.getElementById('curso').value.trim(),
            document.getElementById('semestre').value.trim()
        );
        
        if (editingItemId) {
            await firebaseService.updateItem(editingItemId, itemData);
            showToast('Sucesso!', 'Aluno atualizado com sucesso!', 'success');
        } else {
            await firebaseService.addItem(itemData);
            showToast('Sucesso!', 'Aluno adicionado com sucesso!', 'success');
        }
        
        closeModal();
        await loadItems();
        
    } catch (error) {
        showToast('Erro!', error.message, 'error');
    } finally {
        showLoading(false);
    }
}

function confirmDelete(id, titulo) {
    if (confirm(`Tem certeza que deseja apagar "${titulo}"?`)) {
        deleteItem(id);
    }
}

async function deleteItem(id) {
    showLoading(true);
    
    try {
        await firebaseService.removeItem(id);
        showToast('Sucesso!', 'Aluno removido com sucesso!', 'success');
        await loadItems();
    } catch (error) {
        showToast('Erro!', error.message, 'error');
    } finally {
        showLoading(false);
    }
}


function showLoading(show) {
    if (show) {
        elements.loadingSpinner.classList.remove('hidden');
    } else {
        elements.loadingSpinner.classList.add('hidden');
    }
}


function showEmptyState(show) {
    if (show) {
        elements.emptyState.classList.remove('hidden');
        elements.itemsGrid.classList.add('hidden');
    } else {
        elements.emptyState.classList.add('hidden');
        elements.itemsGrid.classList.remove('hidden');
    }
}


function showToast(title, message, type = 'info') {
    const toast = elements.toast;
    const toastTitle = document.getElementById('toastTitle');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');
    
    let borderColor = '';
    
    switch (type) {
        case 'success':
            borderColor = 'border-green-500';
            break;
        case 'error':
            borderColor = 'border-red-500';
            break;
        default:
            borderColor = 'border-blue-500';
    }
    
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    
    toast.className = `fixed top-20 right-4 bg-white shadow-lg rounded-lg p-4 z-50 max-w-sm border-l-4 ${borderColor}`;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}
