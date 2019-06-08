const Octokit = require('@octokit/rest')
  .plugin(require('octokit-create-pull-request'))

  //var Octokit = require("@octokit/rest"),
    //async = require("async");
    //AWS = require('aws-sdk'),
    //secrets = require('./secrets.js');

/*
const AWS = require('aws-sdk');
 
const lambda = new AWS.Lambda({
  endpoint: new AWS.Endpoint('http://localhost:4000'),
  region: 'us-east-1',
});
 
 
lambda.invoke({
  FunctionName: 'functionOne',
  InvocationType: 'Event',
  Payload: JSON.stringify({ key: 'value' }),
}).promise();
*/



// the 'handler' that lambda calls to execute our code
exports.functionOne = function(event, context) {

    console.log('inside function');
    

    // config the sdk with our credentials
    // http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html
    //AWS.config.loadFromPath('./config.json');

    // variables that are populated via async calls to github
    var referenceCommitSha,
    newTreeSha, newCommitSha, code;

    // s3 bucket and file info to fetch -- from event passed into handler
    //var bucket = event.Records[0].s3.bucket.name;
    //var file = event.Records[0].s3.object.key;
    var file = 'test file';

    // github info
    var user = 'GeoSurge';
    var password = '4c193fd2cae24d6fef5092a6772e926277e4861f';
    //var repo = 'https://github.com/GeoSurge/teachosm';
    //var repo = 'https://api.github.com/repos/GeoSurge/teachosm';
    var repo = 'teachosm';
    var commitMessage = 'Code commited from AWS Lambda!';
    var ref = 'heads/master'

    console.log('end of function');

    my_content = 'test1'

    const octokit = new Octokit({
      auth: '4c193fd2cae24d6fef5092a6772e926277e4861f'
    });

    octokit.createPullRequest({
      owner: 'GeoSurge',
      repo: 'teachosm',
      title: 'pull request title',
      body: 'pull request description',
      base: 'master', /* optional: defaults to default branch */
      head: 'master',
      changes: {
        files: {
          'path/to/file1.txt': 'Content for file1',
          'path/to/file2.txt': 'Content for file2'
        },
        commit: 'creating file1.txt & file2.txt'
      }
    })

};

//works

/*
content = octokit.git.getRef({
    owner: user,
    repo: repo,
    ref: ref
}).then(response => 
    sha_latest_commit=response.data.object.sha
  ).then(response =>
    sha_base_tree = octokit.git.getCommit({
      owner: user,
      repo: repo,
      commit_sha: sha_latest_commit
    })).then(response => {
        file_name = File.join("./", "new_file.txt");
        console.log('hi');
        blob_sha = octokit.git.createBlob({
          owner: user,
          repo: repo,
          content: "test"
        })
        console.log('step2');
        sha_new_tree = octokit.git.createTree({user, repo, 
                                   [ { :path => "./", 
                                       :mode => "100644", 
                                       :type => "blob", 
                                       :sha => blob_sha } ]
                                     })
      })
  .catch(response => console.log(response));
*/

//works
/*
    content = octokit.git.listRefs({
    owner: user,
    repo: repo
}).then(response => console.log(response))
  .catch(response => console.log(response));
*/
    //sha_latest_commit = octokit.git.getRef('d3netxer', repo, ref);

    //.object.sha

    //console.log('print content');
    //console.log(content);

    //sha_base_tree = octokit.commit(repo, sha_latest_commit).commit.tree.sha

    //file_name = File.join("./", "new_file.txt")
    //blob_sha = octokit.create_blob(repo, Base64.encode64(my_content), "base64")
    /*
    sha_new_tree = octokit.create_tree(repo, 
                                   [ { :path => file_name, 
                                       :mode => "100644", 
                                       :type => "blob", 
                                       :sha => blob_sha } ], 
                                   {:base_tree => sha_base_tree }).sha
*/
/*
    octokit.repos.listForOrg({
      org: 'octokit',
      type: 'public'
    }).then(({ data }) => {
      console.log('handle data of repo');
      //console.log(data);
    })
*/
/*
    octokit.auth({
        type: "basic",
        username: user,
        password: password
    });
*/

/*
    async.waterfall([

    // get the object from s3 which is the actual code
    // that needs to be pushed to github
    function(callback) {


        console.log('Getting code from S3...');
        s3.getObject({
            Bucket: bucket,
            Key: file
        }, function(err, data) {
            if (err) console.log(err, err.stack);
            if (!err) {
                // code from s3 to commit to github
                code = data.Body.toString('utf8');
                callback(null);
            }
        });

    },



    // get a reference to the master branch of the repo
    function(callback) {

        console.log('inside async waterfall callback 1');

        console.log('Getting reference...');

        console.log(user);

        console.log(repo);

        octokit.git.getRef({
            owner: user,
            repo: repo,
            ref: 'heads/master'
        }, function(err, data) {
            if (err) console.log(err);
            if (!err) {
                referenceCommitSha = data.object.sha;
                callback(null);
            }
        });

    },

    // create a new tree with our code
    function(callback) {

        console.log('inside async waterfall callback 2');

        console.log('Creating tree...');
        var files = [];
        files.push({
            path: file,
            mode: '100644',
            type: 'blob',
            content: code
        });

        octokit.gitdata.createTree({
            user: user,
            repo: repo,
            tree: files,
            base_tree: referenceCommitSha
        }, function(err, data) {
            if (err) console.log(err);
            if (!err) {
                newTreeSha = data.sha;
                callback(null);
            }
        });

    },

    // create the commit with our new code
    function(callback) {

        console.log('Creating commit...');
        octokit.issues.createCommit({
            user: user,
            repo: repo,
            message: commitMessage,
            tree: newTreeSha,
            parents: [referenceCommitSha]
        }, function(err, data) {
            if (err) console.log(err);
            if (!err) {
                newCommitSha = data.sha;
                callback(null);
            }
        });

    },

    // update the reference to point to the new commit
    function(callback) {

        console.log('Updating reference...');
        octokit.git.updateRef({
            user: user,
            repo: repo,
            ref: 'heads/master',
            sha: newCommitSha,
            force: true
        }, function(err, data) {
            if (err) console.log(err);
            if (!err) callback(null, 'done');
        });

    }

    // optional callback for results
    ], function(err, result) {
        if (err) context.done(err, "Drat!!");
        if (!err) context.done(null, "Code successfully pushed to github.");
    });
*/

