require('dotenv').config();

const Octokit = require('@octokit/rest')
  //.plugin(require('octokit-create-pull-request'))

var base64 = require('base-64');

console.log(process.env);

async function createPullRequest(
  { owner, repo, title, body, base, head, changes }
) {

  const octokit = new Octokit({
      auth: process.env.GITHUB_KEY
    });

  let response = await octokit.repos.get({ owner, repo })

  if (!base) {
    base = response.data.default_branch
  }

  console.log('done with test');

  //console.log(response);


  console.log('createFile');
  //will get an Invalid request if file already exists

  response = await octokit.repos.createFile({
    owner,
    repo,
    branch: 'test',
    path: 'new_file6.txt',
    message: 'commiting new_file6.txt',
    content: base64.encode('new content6')
  })

  console.log('createBlob');

}


console.log('start createPullRequest');

createPullRequest({
  owner: 'd3netxer',
  repo: 'humanitarian-space',
  title: 'pull request title2',
  body: 'pull request description',
  head: 'test',
  changes: {
    files: {
      'new_file.txt': 'ha'
    },
    commit: 'creating new_file.txt'
  }
})
