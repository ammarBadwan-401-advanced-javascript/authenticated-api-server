'use strict';

const Model = require('./model');
const schema = require('./user-schema');

class User extends Model {
  constructor(){
    super(schema);
  }
}

module.exports = new User();