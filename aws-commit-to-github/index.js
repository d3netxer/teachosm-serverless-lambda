require('dotenv').config();

const Octokit = require('@octokit/rest')
  //.plugin(require('octokit-create-pull-request'))

var base64 = require('base-64');

//console.log(process.env);

async function createPullRequest({ owner, repo, title, body, base, head, changes }) {

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
      fileName = propName;
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
    message: 'commiting new_file6.txt',
    content: base64.encode('new content6')
  })

  console.log('finished');

}


console.log('start createPullRequest');

module.exports.handler = function(event, context) {

  createPullRequest({
    owner: 'd3netxer',
    repo: 'humanitarian-space',
    title: 'pull request title2',
    body: 'pull request description',
    head: 'test',
    changes: {
      files: {
        'new_file_2019_06_01.txt': 'ha'
      },
      commit: 'creating new_file.txt'
    }
  })

}
