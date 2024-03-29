var Book = require('../models/book');
var Author = require('../models/author');
// var Genre = require('../models/genre');
// var Rating;

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var async = require('async');

exports.index = function(req, res) {

    Book.find({}, 'title author ')
    .populate('author')
    .exec(function (err, list_books) {
      if (err) { return next(err); }
      // Successful, so render
      res.render('index', { title: 'Book List', book_list:  list_books});

    });
    // async.parallel({
    //     book_count: function(callback) {
    //         Book.count(callback);
    //     },
    //     author_count: function(callback) {
    //         Author.count(callback);
    //     }
    //     // genre_count: function(callback) {
    //     //     Genre.count(callback);
    //     // },
    // }, function(err, results) {
    //     res.render('index', { title: 'Personal Library', error: err, data: results });
    // });
};


// Display list of all books.
exports.book_list = function(req, res, next) {

  Book.find({}, 'title author ')
    .populate('author')
    .exec(function (err, list_books) {
      if (err) { return next(err); }
      // Successful, so render
      res.render('book_list', { title: 'Book List', book_list:  list_books});

    });

};

// Display detail page for a specific book.
exports.book_detail = function(req, res, next) {

    async.parallel({
        book: function(callback) {

            Book.findById(req.params.id)
              .populate('author')
            //   .populate('genre')
              .exec(callback);
        }
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.book==null) { // No results.
            var err = new Error('Book not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('book_detail', { title: 'Title', book:  results.book } );
    });

};

// Display book create form on GET.
exports.book_create_get = function(req, res, next) {

    // Get all authors and genres, which we can use for adding to our book.
    async.parallel({
        authors: function(callback) {
            Author.find(callback);
        }
        // genres: function(callback) {
        //     Genre.find(callback);
        // },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('book_form', { title: 'Create Book',authors:results.authors });
    });

};

// Handle book create on POST.
exports.book_create_post = [
    // Convert the genre to an array.
    // (req, res, next) => {
    //     if(!(req.body.genre instanceof Array)){
    //         if(typeof req.body.genre==='undefined')
    //         req.body.genre=[];
    //         else
    //         req.body.genre=new Array(req.body.genre);
    //     }
    //     next();
    // },

    // Validate fields.
    body('title', 'Title must not be empty.').isLength({ min: 1 }).trim(),
    body('author', 'Author must not be empty.').isLength({ min: 1 }).trim(),
    body('summary', 'Summary must not be empty.').isLength({ min: 1 }).trim(),
    body('isbn', 'ISBN must not be empty').isLength({ min: 1 }).trim(),
  
    // Sanitize fields.
    sanitizeBody('*').trim().escape(),
    // sanitizeBody('genre.*').trim().escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped and trimmed data.
        var book = new Book(
          { title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn
            // genre: req.body.genre
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            async.parallel({
                authors: function(callback) {
                    Author.find(callback);
                }
                // genres: function(callback) {
                //     Genre.find(callback);
                // },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected genres as checked.
                // for (let i = 0; i < results.genres.length; i++) {
                //     if (book.genre.indexOf(results.genres[i]._id) > -1) {
                //         results.genres[i].checked='true';
                //     }
                // }
                res.render('book_form', { title: 'Create Book',authors:results.authors, book: book, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Save book.
            book.save(function (err) {
                if (err) { return next(err); }
                   // Successful - redirect to new book record.
                   res.redirect(book.url);
                });
        }
    }
];



// Display book delete form on GET.
exports.book_delete_get = function(req, res, next) {

    async.parallel({
        book: function(callback) {
            Book.findById(req.params.id).populate('author').exec(callback);
        }
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.book==null) { // No results.
            res.redirect('/catalog/books');
        }
        // Successful, so render.
        res.render('book_delete', { title: 'Delete Book', book: results.book } );
    });

};

// Handle book delete on POST.
exports.book_delete_post = function(req, res, next) {

    // Assume the post has valid id (ie no validation/sanitization).

    async.parallel({
        book: function(callback) {
            Book.findById(req.body.id).populate('author').exec(callback);
        }
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        
        else {
            // Book has no BookInstance objects. Delete object and redirect to the list of books.
            Book.findByIdAndRemove(req.body.id, function deleteBook(err) {
                if (err) { return next(err); }
                // Success - got to books list.
                res.redirect('/catalog/books');
            });

        }
    });

};

// Display book update form on GET.
exports.book_update_get = function(req, res, next) {

    // Get book, authors and genres for form.
    async.parallel({
        book: function(callback) {
            Book.findById(req.params.id).populate('author').exec(callback);
        },
        authors: function(callback) {
            Author.find(callback);
        }
        // genres: function(callback) {
        //     Genre.find(callback);
        // }
        // rating: function(callback) {
        //     Rating.find(callback);
        // } 
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.book==null) { // No results.
            var err = new Error('Book not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        // Mark our selected genres as checked.
        // for (var all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++) {
        //     for (var book_g_iter = 0; book_g_iter < results.book.genre.length; book_g_iter++) {
        //         if (results.genres[all_g_iter]._id.toString()==results.book.genre[book_g_iter]._id.toString()) {
        //             results.genres[all_g_iter].checked='true';
        //         }
        //     }
        // }

        // function myCallback(result) {
        //     alert('nb of reviews for book: ' + result.reviews.length);
        //   }
        //   var scriptTag = document.createElement('script');
        //   scriptTag.src = "https://www.goodreads.com/book/isbn/0441172717?callback=myCallback&format=json&user_id=94666544";
        //   document.getElementsByTagName('head')[0].appendChild(scriptTag);

        // let ratingUrl = 'https://www.goodreads.com/book/isbn/' + results.book.isbn + '?callback=myCallback&format=xml&key=eJoFObAJhE1uj7u9EnAQ';
        
        // $(document).ready(function () {
        //     xmlDoc = $.parseXML(ratingUrl),
        //     $ratingUrl = $( xmlDoc ),
        //     $avg_rating = $ratingUrl.find("average_rating");
        // });
        
        // let rating = book.average_rating
        res.render('book_form', { title: 'Update Book', authors:results.authors, book: results.book });
    });

};


// Handle book update on POST.
exports.book_update_post = [

    // Convert the genre to an array.
    // (req, res, next) => {
    //     if(!(req.body.genre instanceof Array)){
    //         if(typeof req.body.genre==='undefined')
    //         req.body.genre=[];
    //         else
    //         req.body.genre=new Array(req.body.genre);
    //     }
    //     next();
    // },
   
    // Validate fields.
    body('title', 'Title must not be empty.').isLength({ min: 1 }).trim(),
    body('author', 'Author must not be empty.').isLength({ min: 1 }).trim(),
    body('summary', 'Summary must not be empty.').isLength({ min: 1 }).trim(),
    body('isbn', 'ISBN must not be empty').isLength({ min: 1 }).trim(),

    // Sanitize fields.
    sanitizeBody('title').trim().escape(),
    sanitizeBody('author').trim().escape(),
    sanitizeBody('summary').trim().escape(),
    sanitizeBody('isbn').trim().escape(),
    // sanitizeBody('genre.*').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped/trimmed data and old id.
        var book = new Book(
          { title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            _id:req.params.id // This is required, or a new ID will be assigned!
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form
            async.parallel({
                authors: function(callback) {
                    Author.find(callback);
                }
                // genres: function(callback) {
                //     Genre.find(callback);
                // },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected genres as checked.
                // for (let i = 0; i < results.genres.length; i++) {
                //     if (book.genre.indexOf(results.genres[i]._id) > -1) {
                //         results.genres[i].checked='true';
                //     }
                // }
                res.render('book_form', { title: 'Update Book',authors:results.authors, book: book, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Book.findByIdAndUpdate(req.params.id, book, {}, function (err,thebook) {
                if (err) { return next(err); }
                   // Successful - redirect to book detail page.
                   res.redirect(thebook.url);
                });
        }
    }
];