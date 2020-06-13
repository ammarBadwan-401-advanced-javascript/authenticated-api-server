'use strict';
require('dotenv').config();
const users = require('../models/user-schema');
const superagent = require('superagent');
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

// GitHub route for the login token
const TOKEN_SERVER = process.env.TOKEN_SERVER;
// GitHub route for the user info
const API_USER = process.env.API_USER;

const API_SERVER = process.env.API_SERVER; 

/* Steps: 1- login with superagent and get the tokem 
        2- give that token to get the user 
        3- save user to db
        4- add html form
*/

module.exports = async (req,res,next) =>{
  try{
    let code = req.query.code;
    let remoteToken = await getToken(code);
    let remoteUser = await getRemoteUserInfo(remoteToken);
    let [user,token] = await getUser(remoteUser);
    req.user = user;
    req.token = token;
    next();
  } catch(e){
    console.log('Error: ' + e);
    next('error');
  }
  
};

async function getToken(code){
  let tokenResponse = await superagent.post(TOKEN_SERVER).send({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: API_SERVER,
    code: code,
  });
  return tokenResponse.body.access_token;
}

async function getRemoteUserInfo(token){
  let theUser = await superagent.get(API_USER).set('Authorization',`token ${token}`).set('user-agent','express-app');
  return theUser.body;
}

async function getUser(remoteUser){
  let record = {
    username: remoteUser.login,
    password: 'hardPassword',
  };
  let checkUser = await users.find({username:record.username});
  if (checkUser[0]){
    let myToken = users.generateToken(record);
    return [checkUser[0],myToken];
  } else {
    let savedUser = await users.create(record);
    let myToken = users.generateToken(record);
    return [savedUser,myToken];
  }
}