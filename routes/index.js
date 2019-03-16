var express = require('express');
var router = express.Router();
var Book = require('../models/book');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

exports.book_list = function(req, res, next) {

  Book.find({}, 'title author ')
    .populate('author')
    .exec(function (err, list_books) {
      if (err) { return next(err); }
      // Successful, so render
      res.render('book_list', { title: 'Book List', book_list:  list_books});
    });

};

module.exports = router;
