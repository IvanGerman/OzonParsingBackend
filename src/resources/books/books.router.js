const express = require('express');
const passport = require('passport');
const controller = require('../../controllers/book');

const router = express.Router();


//the callback function under can be replaced by controller
router.get('/books', passport.authenticate('jwt', { session: false }), controller.getBooks);

router.post('/books', passport.authenticate('jwt', { session: false }), controller.postBook);

router.delete('/books/:id', passport.authenticate('jwt', { session: false }), controller.deleteBook);

router.put('/books/:id', passport.authenticate('jwt', { session: false }), controller.updateBook);



module.exports = router; 