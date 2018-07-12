const express = require("express");
const router = require("router");
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json;

const {BlogPosts} = require('/models');

