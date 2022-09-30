// var cors = require('cors')
const express = require('express');
const app = express();
// app.use(cors())
module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', req.get('Origin') || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.header('Access-Control-Expose-Headers', 'Content-Length');
    res.header('Access-Control-Allow-Headers', 'Accept,x-www-form-urlencoded, Origin, Authorization, Content-Type, X-Requested-With,  x-client-key, x-client-token, x-client-secret,  Range');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    } else {
      return next();
    }
  });
}