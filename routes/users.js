// var express = require('express');
// var router = express.Router();

// router.get('/search-location-weather', (req, res) => {
//   //build api URL with user zip
//   const baseUrl = 'https://www.goodreads.com/book/isbn/';
//   let isbn = 
//   const apiId = '?key=eJoFObAJhE1uj7u9EnAQ';
 
//   const userLocation = (url1, url2, zipcode) => {
//      let newUrl = url1 + zipcode + url2;
//      return newUrl;
//   };	
 
//   const apiUrl = userLocation(baseUrl, apiId, zipcode);
 
//   fetch(apiUrl)
//   .then(res => res.json())
//   .then(data => {
//      res.send({ data });
//   })
//   .catch(err => {
//      res.redirect('/error');
//   });
// })

// module.exports = router;