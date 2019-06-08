const functions = require('firebase-functions');
const admin = require('firebase-admin');
const firebase = require('firebase/app');
require('firebase/auth');
require('firebase/firestore');
const adminCred = require('./config/adminCred');
const normalCred = require('./config/normalCred');
const response = require('./utils/response');
const http = require('./utils/HttpStats');

const moduleId = '/api/users/';

admin.initializeApp(adminCred);
const db = admin.firestore();

firebase.initializeApp(normalCred);

exports.register = functions.https.onRequest(async (req, res) => {
  const respond = response.success(res);
  // const respondErr = response.failure(res, moduleId);

  const props = ['firstName', 'lastName', 'email', 'password'];
  const body = {};
  props.forEach((prop) => { body[prop] = req.body[prop]; });
  body.displayName = `${body.firstName} ${body.lastName}`;
  const user = await admin.auth().createUser(body);
  delete body.password;
  delete body.displayName;

  body.uid = user.uid;
  db.collection('users').doc(body.uid).set(body);

  respond(http.CREATED, 'CREATE_USER_SUCCESS', body);
});

exports.login = functions.https.onRequest(async (req, res) => {
  const respond = response.success(res);
  const respondErr = response.failure(res, moduleId);

  try {
    const user = await firebase.auth().signInWithEmailAndPassword(req.body.email, req.body.password);
    const userData = await db.collection('users').doc(user.user.uid).get();
    console.log(userData.data());
    respond(http.CREATED, 'CREATE_USER_SUCCESS', userData.data());
  } catch (err) {
    console.log(err);
    respondErr(http.SERVER_ERROR, err.message, err);
  }
});

exports.getUser = functions.https.onRequest(async (req, res) => {
  const respond = response.success(res);

  const user = await admin.auth().getUser('Z94VyRYuL5diiNqVZcYDfs463VI2');

  respond(http.CREATED, 'CREATE_USER_SUCCESS', user);
});
