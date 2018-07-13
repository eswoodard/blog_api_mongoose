const express = require("express");
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json;

const {BlogPosts} = require('./models');

router.get('/blog_post', (req, res) => {
  BlogPosts.find()
  .then(blog_post => {
    res.json({
      blog_post: blog_post.map()(blog_post => blog_post.serialize())
    });
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({message: "Internal server error"});
  });
});

router.get('/blog_post/:id', (req, res) => {
  BlogPosts
  .findById(req.params.id)
  .then(blog_post => res.json(blog_post.serialize()))
  .catch(err => {
    console.error(err);
    res.status(500).json({message: "Internal server error"});
  });
});



module.exports = router;