const Book = require('../models/Book');
  

module.exports.getBooks = async function(req, res) { console.log('getBooks');

  try {
    const allBooks = await Book.find();
    res.status(200).json(allBooks);
  } catch(err) {
    res.status(404).json({
      message: 'an error occured!'
    })
  }     
};

module.exports.postBook = async function(req, res) {

// check is this book already in DB 
  const isBookInDB = await Book.findOne({name: req.body.name});
  if (isBookInDB) {
    res.status(409).json({
      message: 'this book is already in DB!'
    })
  } else { //create new book
    const book = new Book({
      name: req.body.name
    });

    try {
      await book.save();
      res.status(201).json(book);
    } catch(err) {
      res.status(400).json({
        message: 'error occured'
      })
    }
  }
};

module.exports.deleteBook = async function(req, res) {
  
  try {
    // check is this book in DB 
  const isBookInDB = await Book.findOne({_id: req.params.id});
  if (!isBookInDB) {
    res.status(404).json({
      message: 'this book is not in DB!'
    })
  } else { //delete book
    await Book.deleteOne({ _id: req.params.id });
    res.status(200).json(`${isBookInDB.name} is deleted`);
  }
  } catch(err) {
    res.status(404).json({
      message: 'error occured!'
    })
  }     
};


module.exports.updateBook = async function(req, res) { console.log('here------');

    
  try {
     const result = await Book.findOneAndUpdate({ _id: req.params.id }, { name: req.body.name }, { new: true });
     res.status(200).json(`Book has been updated, new book name is: ${result.name} `);
  } catch {
      res.status(400).json({
      message: 'error occured'
      })
    }
  };
