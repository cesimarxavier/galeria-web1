
class FirebaseService {
    constructor() {
        const firebaseConfig = {
            apiKey: "AIzaSyCTXflCiqFd6n1DMQAtlXCXCPQzRmTMhRg",
            authDomain: "galeria-questoes-cesimar.firebaseapp.com",
            databaseURL: "https://galeria-questoes-cesimar-default-rtdb.firebaseio.com",
            projectId: "galeria-questoes-cesimar",
            storageBucket: "galeria-questoes-cesimar.firebasestorage.app",
            messagingSenderId: "842378414275",
            appId: "1:842378414275:web:5878783faeb496a86afa76",
            measurementId: "G-Q2MRDJGQCB"
        };

        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        
        this.database = firebase.database();
        this.itemsRef = this.database.ref('alunos');
    }

    async fetchItems() {
        try {
            const snapshot = await this.itemsRef.once('value');
            const items = [];
            
            snapshot.forEach((childSnapshot) => {
                const id = childSnapshot.key;
                const data = childSnapshot.val();
                items.push(Item.fromFirebase(id, data));
            });
            
            return items;
        } catch (error) {
            console.error('Erro ao buscar itens:', error);
            throw new Error('Falha ao carregar os alunos. Verifique sua conexão.');
        }
    }

    async addItem(item) {
        try {
            if (!item.isValid()) {
                throw new Error('Item inválido. Todos os campos são obrigatórios.');
            }

            const newItemRef = await this.itemsRef.push(item.toFirebase());
            return newItemRef.key;
        } catch (error) {
            console.error('Erro ao adicionar item:', error);
            throw new Error('Falha ao adicionar aluno. Tente novamente.');
        }
    }

    async removeItem(id) {
        try {
            await this.itemsRef.child(id).remove();
        } catch (error) {
            console.error('Erro ao remover item:', error);
            throw new Error('Falha ao remover aluno. Tente novamente.');
        }
    }
    
    async updateItem(id, item) {
        try {
            if (!item.isValid()) {
                throw new Error('Item inválido. Todos os campos são obrigatórios.');
            }

            await this.itemsRef.child(id).update(item.toFirebase());
        } catch (error) {
            console.error('Erro ao atualizar item:', error);
            throw new Error('Falha ao atualizar aluno. Tente novamente.');
        }
    }

    async getItem(id) {
        try {
            const snapshot = await this.itemsRef.child(id).once('value');
            
            if (!snapshot.exists()) {
                throw new Error('Item não encontrado');
            }

            return Item.fromFirebase(id, snapshot.val());
        } catch (error) {
            console.error('Erro ao buscar item:', error);
            throw new Error('Falha ao buscar aluno.');
        }
    }
}
