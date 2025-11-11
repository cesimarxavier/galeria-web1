/**
 * Classe Item 
 * 
 * Campos obrigatórios:
 * - id: identificador único (gerado pelo Firebase)
 * - titulo: nome completo do aluno
 * - descricao: biografia/descrição do aluno
 * - categoria: área de atuação (Desenvolvimento, Design, Marketing, Gestão)
 * - imagem: URL da foto do aluno
 * 
 * Campos específicos do tema:
 * - curso: curso
 * - semestre: semestre
 */
class Item {
    constructor(id, titulo, descricao, categoria, imagem, curso, semestre) {
        this.id = id;
        this.titulo = titulo;
        this.descricao = descricao;
        this.categoria = categoria;
        this.imagem = imagem;
        this.curso = curso;
        this.semestre = semestre;
    }
    
    toFirebase() {
        return {
            titulo: this.titulo,
            descricao: this.descricao,
            categoria: this.categoria,
            imagem: this.imagem,
            curso: this.curso,
            semestre: this.semestre
        };
    }

    static fromFirebase(id, data) {
        return new Item(
            id,
            data.titulo,
            data.descricao,
            data.categoria,
            data.imagem,
            data.curso,
            data.semestre
        );
    }
   
    isValid() {
        return this.titulo && 
               this.descricao && 
               this.categoria && 
               this.imagem && 
               this.curso && 
               this.semestre;
    }
}
