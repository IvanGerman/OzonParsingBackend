const express = require('express');
const cors = require('cors');


const app = express();
const booksRouter = require('./resources/books/books.router');

app.use(cors());

const jsonBodyMiddleware = express.json();
app.use(jsonBodyMiddleware);
app.use(express.urlencoded());

app.use('/api', booksRouter);


module.exports = app;