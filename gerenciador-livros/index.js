const express = require('express')
const exphbs = require('express-handlebars')
const pool = require('./db/conn')

const app = express()

// Configuração do Handlebars
app.engine('handlebars', exphbs.engine())
app.set('view engine', 'handlebars')

// Middlewares
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static('public'))

// Rota Principal
app.get('/', (req, res) => {
    res.render('home')
})

// Rota POST: Inserir livro
app.post('/books/insertbook', (req, res) => { 
    const { title, pageqty } = req.body 

    if (!title || !pageqty) {
        return res.send("Erro: O título e a quantidade de páginas são obrigatórios!")
    }
  
    // Ajuste nos placeholders: ?? para colunas, ? para valores
    const sql = `INSERT INTO books (??, ??) VALUES (?, ?)`
    const data = ['title', 'pageqty', title, pageqty]

    pool.query(sql, data, (err) => {
        if (err) {
            console.error("Erro ao inserir:", err)
            return res.status(500).send("Erro ao salvar no banco de dados.")
        }
        res.redirect('/books')
    })
})

// Rota GET: Listar todos os livros
app.get('/books', (req, res) => {
    const sql = "SELECT * FROM books"

    pool.query(sql, (err, data) => {
        if (err) {
            console.error("Erro ao buscar livros:", err)
            return res.status(500).send("Erro ao buscar livros.")
        }
        res.render('books', { books: data })
    })
})

// Rota GET: Detalhes do Livro
app.get('/books/:id', (req, res) => {
    const id = req.params.id
    const sql = `SELECT * FROM books WHERE id = ?` // Simplificado para evitar erro de placeholder

    pool.query(sql, [id], (err, data) => {
        if (err || data.length === 0) {
            return res.status(404).send("Livro não encontrado.")
        }
        res.render('book', { book: data[0] })
    })
})

// Rota GET: Formulário de Edição
app.get('/books/edit/:id', (req, res) => {
    const id = req.params.id
    const sql = `SELECT * FROM books WHERE id = ?`

    pool.query(sql, [id], (err, data) => {
        if (err || data.length === 0) {
            return res.status(404).send("Livro para edição não encontrado.")
        }
        res.render('editbook', { book: data[0] })
    })
})

// Rota POST: Atualizar dados
app.post('/books/updatebook', (req, res) => {
    const { id, title, pageqty } = req.body

    if (!title || !pageqty || !id) {
        return res.send("Erro: Dados incompletos para atualização.")
    }

    const sql = `UPDATE books SET title = ?, pageqty = ? WHERE id = ?`
    const data = [title, pageqty, id]

    pool.query(sql, data, (err) => {
        if (err) {
            console.error("Erro no update:", err)
            return res.status(500).send("Erro ao atualizar o livro.")
        }
        res.redirect('/books')
    })
})

// Rota POST: Remover livro
app.post('/books/remove/:id', (req, res) => {
    const id = req.params.id
    const sql = `DELETE FROM books WHERE id = ?`

    pool.query(sql, [id], (err) => {
        if (err) {
            console.error("Erro ao remover:", err)
            return res.status(500).send("Erro ao remover o livro.")
        }
        res.redirect('/books')
    })
})

// Iniciar servidor - Fora de qualquer callback para garantir que não feche
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000!')
})
