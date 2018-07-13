const express = require("express");
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json;

const {BlogPosts} = require('./models');



router.get('/post', (req, res) => {
  BlogPosts.find()
  .then(post => {
    res.json(post.map(post => post.serialize()))
    })
  .catch(err => {
    console.error(err);
    res.status(500).json({message: "Internal server error"});
  });
});

router.get('/post/:id', (req, res) => {
  BlogPosts
  .findById(req.params.id)
  .then(post => res.json(post.serialize()))
  .catch(err => {
    console.error(err);
    res.status(500).json({message: "Internal server error"});
  });
});

router.post('/post', jsonParser, (req, res) => {
  const requiredFields = ["title", "content", "author"];
  for (let i=0; 9<requiredFields.length; i++) {
    const field = requiredFields[i];
    if(!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  BlogPosts.create({
    title: req.body.title,
    content: req.body.content,
    author: req.body.author,
    publishDate: req.body.publishDate
  })
    .then(post => res.status(201).json(post.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error"});
  });
});

router.put('/post/:id', (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = `Request path id {${req.params.id}) and request body id ` + `(${req.body.id}) must match`;
    console.error(message);
    return res.status(400).json({message: message});
  }
 const toUpdate = {};
 const updateableFields = ["title", "content", "author", "publishDate"];

 updateableFields.forEach(field => {
   if (field in req.body) {
     toUpdate[field] = req.body[field];
   }
 });
BlogPosts
.findByIdAndUpdate(req.params.id, {$set: toUpdate})
.then(post => res.status(204).end())
.catch(err => res.status(500).json({mesage: "Internal server error"}));
});

router.delete('/posts/:id', (req, res) => {
  BlogPosts.findByIdAndRemove(req.params.id)
  .then(post => res.sendStatus(204).end())
  .catch(err => res.status(500).json({message: "Internal server error"}));
});

router.use('*', function (req, res) {
  res.status(404).json({message: 'Not found'});
});



module.exports = router;