// index.js

const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express');
var request = require('request');
var cors = require('cors')
const app = express();
const AWS = require('aws-sdk');
var fs = require('fs');

const IS_OFFLINE = process.env.IS_OFFLINE;

const uuidV1 = require('uuid/v1');
var YAML = require('json2yaml');

var Promise = require('promise');

var s3 = new AWS.S3();

app.use(cors())
app.use(bodyParser.json({ strict: false }));
app.use(bodyParser.urlencoded({extended : false}));

app.get('/', function (req, res) {
  res.send('Hello World!')
})

// Get User endpoint
app.get('/posts/:Id', function (req, res) {
  //console.log('print req');
  //console.log(req);
})


function verifyreCaptcha(req, callback) {

  console.log('starting verifyCaptcha function');

  //https://codeforgeek.com/2016/03/google-recaptcha-node-js-tutorial/
  // g-recaptcha-response is the key that browser will generate upon form submit.
  // if its blank or null means user has not selected the captcha, so return the error.

  if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
    //return res.json({"responseCode" : 1,"responseDesc" : "Please select captcha"});
    callback(false);
  }

  // Put your secret key here.
  var secretKey = "6LdUIGUUAAAAABKqnfjw0z2YgU3TK5CJbJzmbXQn";

  // req.connection.remoteAddress will provide IP address of connected user.
  var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;

  // Hitting GET request to the URL, Google will respond with success or error scenario.
  console.log('print verificationUrl');
  console.log(verificationUrl);

  request(verificationUrl,function(error,response,body) {
      body = JSON.parse(body);
      console.log("print body1");
      console.log(body);
      //return body;
      callback(body);
  });

}


// Create form endpoint
app.post('/posts', function (req, res) {

  console.log('s3 upload function begins');

  console.log('file name');
  const Id = uuidV1();
  keyname = 'post_' + req.body.username + '_' + Id + '.md';

  ymlText2 = YAML.stringify(req.body)

  console.log('log req body2');
  console.log(ymlText2);

  //All requests made through the SDK are asynchronous

  // Setting URL and headers for request
  var buf = new Buffer(ymlText2, "utf-8");
  const params = { Bucket: 'teachosm-project-posts', Key: keyname, Body: buf, ACL: 'public-read' };


  var putObjectPromise = s3.putObject(params).promise();

  putObjectPromise.then(function(data) {
    console.log('Success, now do a github commit');
    //res.send('Success returned')
  }).catch(function(err) {
    console.log(err);
    res.send('error returned')
  });

})

module.exports.handler = serverless(app);
