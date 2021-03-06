'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;

const BlogPost = require('../models');
const {blogPostRouter} = require('../blogPostRouter');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

function seedBlogPostData() {
  console.info('seeding blog post data');
  const seedData = [];

  for (let i=1; i<=10; i++) {
    seedData.push({
      author: {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName()
      },
      title: faker.lorem.sentence(),
      content: faker.lorem.text()
    });
  }
  return BlogPost.insertMany(seedData);
}
 


function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

describe('BlogPost API resource', function (){
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedBlogPostData();
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });

  describe('GET endpoint', function() {
    it('should return all existing blog posts', function() {
      let res;
      return chai.request(app)
      .get('/post')
      .then(function(_res) {
        res = _res;
        expect(res).to.have.status(200);
        expect(res.body).to.have.lengthOf.at.least(1);
        return BlogPost.count();
      })
      .then(function(count) {
        expect(res.body).to.have.lengthOf(count);
      });
    });

    it('should return blog posts with right fields', function() {
      let resBlogPost;
      return chai.request(app)
      .get('/post')
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        expect(res.body).to.have.lengthOf.at.least(1);

        res.body.forEach(function(blog_post) {
          expect(blog_post).to.be.a('object');
          expect(blog_post).to.include.keys(
            'id', 'title', 'content', 'author', 'created');
        });
        resBlogPost = res.body[0];
        return BlogPost.findById(resBlogPost.id);
      })
      .then(function(blog_post){
        expect(resBlogPost.title).to.equal(blog_post.title);
        expect(resBlogPost.content).to.equal(blog_post.content);
        expect(resBlogPost.author).to.contain(blog_post.author.firstName);
      });
    });
  });


  describe('POST endpoint', function() {
    it('should add a new blog post', function() {

      const newBlogPost = {
        title: faker.lorem.sentence(),
        author: {
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName(),
        },
        content: faker.lorem.text()
      };
      
      return chai.request(app)
      .post('/post')
      .send(newBlogPost)
      .then(function(res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.keys(
          'id', 'title', 'content', 'author', 'created'
        );
        expect(res.body.id).to.not.be.null;
        expect(res.body.title).to.equal(newBlogPost.title);
        expect(res.body.content).to.equal(newBlogPost.content);
        expect(res.body.author).to.contain(newBlogPost.author.firstName);
        expect(res.body.publishDate).to.equal(newBlogPost.publishDate);
        return BlogPost.findById(res.body.id);
      })
      .then(function(blog_post) {
        expect(blog_post.title).to.equal(newBlogPost.title);
        expect(blog_post.content).to.equal(newBlogPost.content);
        expect(blog_post.author.firstName).to.equal(newBlogPost.author.firstName);
        expect(blog_post.author.lastName).to.equal(newBlogPost.author.lastName);
        expect(blog_post.publishDate).to.equal(newBlogPost.publishDate);
      });
    });
  });

  describe('PUT endpoint', function() {
    it('should update blog post as requested', function() {
      const updateData = {
        title: 'blog post',
        content: 'this is blog post new content',
        author: {firstName: 'Sally', lastName: 'Student'}
      };

      return BlogPost
      .findOne()
      .then(function(blog_post) {
        updateData.id = blog_post.id;

        return chai.request(app)
        .put(`/post/${blog_post.id}`)
        .send(updateData);
      })
      .then(function(res) {
        expect(res).to.have.status(204);
        return BlogPost.findById(updateData.id);
      })
      .then(function(blog_post) {
        expect(blog_post.title).to.equal(updateData.title);
        expect(blog_post.content).to.equal(updateData.content);
      });
    });
  });

  describe('DELETE endpoint', function() {
    it('should delete a blog post by id', function() {
      let blog_post;

      return BlogPost
      .findOne()
      .then(function(_blog_post) {
        blog_post = _blog_post;
        return chai.request(app).delete(`/post/${blog_post.id}`);
      })
      .then(function(res) {
        expect(res).to.have.status(204);
        return BlogPost.findById(blog_post.id);
      })
      .then(function(_blog_post) {
        expect(_blog_post).to.be.null;
      });
    });
  });

});

