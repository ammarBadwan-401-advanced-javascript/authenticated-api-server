'use strict';



module.exports = (req,res,next)=>{
  let model = req.params.model;
  let collection;
  switch(model){
  case 'signup':
    collection = require(`../models/user-collection`);
    req.model = collection;
    next();
    return;
  case 'signin':
    collection = require(`../models/user-collection`);
    next();
    return;
  default:
    next('Invalid Model');
    return;
  }
};

