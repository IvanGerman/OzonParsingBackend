const express = require('express');
const controller = require('../../controllers/book2');

const router = express.Router();


//the callback function under can be replaced by controller
//router.get('/books', controller.getBooks);

router.post('/books', controller.postBook);

//router.delete('/books/:id', controller.deleteBook);

//router.put('/books/:id',  controller.updateBook);



module.exports = router; 