// index.js

const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express');
const axios = require('axios').default;
var cors = require('cors')
const app = express();
const AWS = require('aws-sdk');
var fs = require('fs');
const _ = require('lodash');

const IS_OFFLINE = process.env.IS_OFFLINE;

const { v4: uuidv4 } = require('uuid');

var YAML = require('json2yaml');

var Promise = require('promise');

require('dotenv').config();

const { Octokit } = require("@octokit/rest");

// https://github.com/octokit/request-error.js/
const { RequestError } = require("@octokit/request-error");

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

async function createPullRequest(req, res, buf, { owner, repo, title, body, base, head, changes }) {

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
      auth: process.env.GITHUB_KEY,
      userAgent:'d3netxer'
    });


  console.log('trying to get repo3');

  console.log(owner);
  console.log(repo);

  let response; // Declare response outside the try block
  try {
    response = await octokit.repos.get({ owner, repo })
  } catch (error) {
    // Octokit errors always have a `error.status` property which is the http response code
    if (error.status) {
      // handle Octokit error
      console.log(error.status);
      console.log(error)
    } else {
      // handle all other errors
      throw error;
    }
  }

  // Now you can use response here
  console.log(response);

  console.log('done getting repo');

  if (!base) {
    base = response.data.default_branch
  }

  console.log('getRef');

  let reference;
  try {
    reference = await octokit.git.getRef({
      owner,
      repo,
      ref: 'heads/master'
    });
  } catch (error) {
    // Octokit errors always have a `error.status` property which is the http response code
    if (error.status) {
      // handle Octokit error
      console.log(error.status);
    } else {
      // handle all other errors
      throw error;
    }
  }


  console.log('print Ref');
  console.log(reference.data.object.sha);

  sha_latest_commit=reference.data.object.sha

  var ref = 'refs/heads/'
  //var branch = 'new_branch3'
  var branch = fileName.split(".")[0];

  console.log('print branch');
  console.log(branch);

  //https://octokit.github.io/rest.js/v18#git-create-ref
  createRef_response = await octokit.rest.git.createRef({
    owner,
    repo,
    ref: ref+branch,
    sha: sha_latest_commit
  });

  console.log('print createRef_response');
  console.log(createRef_response);


  console.log('createFile');
  //will get an Invalid request if file already exists

  //https://octokit.github.io/rest.js/v18#repos-create-or-update-file-contents
  response = await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    branch: branch,
    path: 'collections/_projects/'+fileName,
    message: 'commiting a new post via TeachOSM site',
    //content: base64.encode('new content7')
    content: base64.encode(buf)
  })

  //new code

  await octokit.pulls.create({
    owner,
    repo,
    title: 'new project submission pull request: ' + branch,
    head: branch,
    base: 'master'
  })

  console.log('finished');

  res.send('Success returned');

}

function verifyreCaptcha(req, res, callback) {

  console.log('starting verifyCaptcha function');

  //https://codeforgeek.com/2016/03/google-recaptcha-node-js-tutorial/
  // g-recaptcha-response is the key that browser will generate upon form submit.
  // if its blank or null means user has not selected the captcha, so return the error.

  console.log("print req body: " + JSON.stringify(req.body));

  if (req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
    return res.json({"responseCode" : 1,"responseDesc" : "Please select captcha"});
    callback(false);
  }

  // Put your secret key here.
  var secretKey = process.env.CAPTCHA_SECRET;

  // req.connection.remoteAddress will provide IP address of connected user.
  var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;

  // Hitting GET request to the URL, Google will respond with success or error scenario.
  console.log('print verificationUrl');
  console.log(verificationUrl);

  axios.get(verificationUrl)
    .then(function(response) {
      let body = response.data;
      console.log("print body1");
      //body = JSON.parse(body);
      //console.log("print body2");
      console.log(body);
      //return body;
      callback(body);
    })
    .catch(function (error) {
      console.log('error:', error);
    });


}


// Create form endpoint
app.post('/posts', function (req, res) {

  verifyreCaptcha(req, res, function(success) {

          console.log('s3 upload function begins');

          console.log('file name');
          const Id = uuidv4();
          //var keyname = 'post_' + req.body.username + '_' + Id + '.md';
          var keyname = req.body.url + '.md';

          var fileName = keyname.split(".")[0];

          console.log('print fileName2');
          console.log(fileName);

          delete req.body['g-recaptcha-response'];

          //apply transformations
          _.forOwn(req.body, function(value, key) {
            // escape HTML special characters
            //value = _.escape(value);
        
            // replace newlines with <br/>
            //value = value.replace(/\n/g, '<br/>');

            // encode the value
            value = encodeURI(value);
        
            req.body[key] = value;
          });

          ymlText2 = YAML.stringify(req.body)
          ymlText2 = ymlText2+'\n---'

          console.log('log req body2');
          console.log(ymlText2);

          //All requests made through the SDK are asynchronous

          // Setting URL and headers for request
          //var buf = new Buffer(ymlText2, "utf-8");
          var buf = Buffer.from(ymlText2, "utf-8"); 
          const params = { Bucket: process.env.PROJECT_POSTS_BUCKET + '-' + process.env.STAGE, Key: keyname, Body: buf, ACL: 'public-read' };

          var putObjectPromise = s3.putObject(params).promise();

          putObjectPromise.then(function(data) {
            console.log('Success, now do a github commit');

            createPullRequest(req, res, buf, {
              owner: process.env.OWNER, //owner: 'osmus',
              repo: process.env.REPO, //repo: 'teachosm.org',
              title: 'pull request via a TeachOSM post',
              body: 'pull request via a TeachOSM post',
              head: 'test',
              changes: {
                files: {
                  file: keyname
                },
                commit: 'creating a new post'
              }
            })

          }).catch(function(err) {
            console.log(err);
            res.send('error returned')
          });
  });

})

module.exports.handler = serverless(app);
