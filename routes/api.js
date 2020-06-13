'use strict';

const express = require('express');
const router = express.Router();
const getModel = require('../middleware/getModel');
const user = require('../auth/models/user-schema');
const basicAuth = require('../auth/middleware/basic');
const OAuthMiddleware = require('../auth/middleware/oauth');
const bearerMiddleware = require('../auth/middleware/bearer-auth');
const permissions = require('../auth/middleware/authorize');


router.param('model',getModel);

// ***************--- The Signin/Signup Routes ---***************

router.post('/signup', signup);
router.post('/signin',basicAuth, signin);
router.get('/users',getUsers);
router.get('/oauth',OAuthMiddleware,oAuth);


// ***************--- The API Routes ---***************

router.get('/:model',bearerMiddleware, getCollection);
router.get('/:model/:id',bearerMiddleware,permissions('read'),getCollection);
router.post('/:model',bearerMiddleware,permissions('create'), createCollection);
router.delete('/:model/:id',bearerMiddleware,permissions('delete'),deleteCollection);
router.put('/:model/:id',bearerMiddleware,permissions('update'),updateCollection);

// ***************--- The API Functions ---***************

function getCollection(req,res,next){
  let idCheck;
  if(req.params.id){
    idCheck = req.params.id;
  }
  req.model
    .read(idCheck)
    .then(result=>{
      res.status(200).json(result);
    })
    .catch(next);
}

function createCollection (req,res,next){
  req.model
    .create(req.body)
    .then(result =>{
      res.status(201).json(result);
    }).catch(next);
}

function deleteCollection(req,res,next){
  req.model
    .delete(req.params.id)
    .then(result=>{
      res.status(200).json(result);
    }).catch(next);
}

function updateCollection(req,res,next){
  req.model
    .update(req.params.id,req.body)
    .then(result =>{
      res.status(200).json(result);
    }).catch(next);
}

// ***************--- The Sign up Functions ---***************

function signup (req,res,next){
  user
    .create(req.body)
    .then(result =>{
      let answer = {};
      answer.token = user.generateToken(result);
      answer.user = {username:result.username, password:result.password};
      res.status(201).json(answer);
    }).catch(next);
}

function signin(req,res,next){
  console.log(req.token);
  res.cookie('token',req.token);
  let answer = {};
  answer.token = req.token;
  answer.user = {username: req.theUserInfo.username,password:req.theUserInfo.password};
  res.status(200).json(answer);
}

function getUsers(req,res,next){
  user.find({})
    .then(result=>{
      res.status(200).json(result);
    }).catch(next);
}

function oAuth(req,res,next){
  res.status(200).send(req.token);
}

module.exports = router;