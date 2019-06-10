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

require('dotenv').config();

const Octokit = require('@octokit/rest')

var base64 = require('base-64');

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

async function createPullRequest(buf, { owner, repo, title, body, base, head, changes }) {

  var currentDate = new Date();

  var localDateTime = currentDate.getFullYear() +
           "_" +
           (("0" + (currentDate.getMonth() + 1)).slice(-2)) +
           "_" +
           (("0" + (currentDate.getDate())).slice(-2));

  console.log('print date');
  console.log(localDateTime);

  console.log('print file name');
  console.log(changes.files);


  var fileName;

  var propValue;
  for(var propName in changes.files) {
      propValue = changes.files[propName]
      fileName = propValue;
      console.log(propName,propValue);
  }

  const octokit = new Octokit({
      auth: process.env.GITHUB_KEY
    });

  let response = await octokit.repos.get({ owner, repo })

  if (!base) {
    base = response.data.default_branch
  }

  console.log('getRef');

  let reference = await octokit.git.getRef({
            owner,
            repo,
            ref: 'heads/master'
        })

  console.log('print Ref');
  console.log(reference.data.object.sha);

  sha_latest_commit=reference.data.object.sha

  var ref = 'refs/heads/'
  //var branch = 'new_branch3'
  var branch = fileName.split(".")[0];

  console.log('print branch');
  console.log(branch);

  createRef_response = await octokit.git.createRef({
    owner,
    repo,
    ref: ref+branch,
    sha: sha_latest_commit
  })

  console.log('print createRef_response');
  console.log(createRef_response);


  console.log('createFile');
  //will get an Invalid request if file already exists


  response = await octokit.repos.createFile({
    owner,
    repo,
    branch: branch,
    path: fileName,
    message: 'commiting a new post via TeachOSM site',
    //content: base64.encode('new content7')
    content: base64.encode(buf)
  })

  console.log('finished');

}

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
  var keyname = 'post_' + req.body.username + '_' + Id + '.md';

  var fileName = keyname.split(".")[0];

  console.log('print fileName');
  console.log(fileName);

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

    createPullRequest(buf, {
      owner: 'GeoSurge',
      repo: 'teachosm',
      title: 'pull request via a TeachOSM post',
      body: 'pull request via a TeachOSM post',
      head: 'test',
      changes: {
        files: {
          file: fileName
        },
        commit: 'creating a new post'
      }
    })

    //res.send('Success returned')
  }).catch(function(err) {
    console.log(err);
    res.send('error returned')
  });

})

module.exports.handler = serverless(app);
