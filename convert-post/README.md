# convert-post

This function recieves a post, saves the post in a s3 bucket and then commits the post in a Github repo. To commit the post to Github you need to input a Github user that has admin access to the repo. Edit the index.js file to include the Github username and the correct repo name. Also in Github under that user, create a personal access token (Go to settings --> developer settings --> personal access tokens, and create one with the repo and admin: repo_hook scope boxes checked). This information will need to be inputted into the .env file. 

## Create an .env file that looks similar to this:

```
GITHUB_KEY = {{key}}
CAPTCHA_SECRET = {{secret}}
STAGE = deploy
DEPLOYMENT_BUCKET = teachosm-geosurge-convert-post-request-to-yaml
PROJECT_POSTS_BUCKET = teachosm-geosurge-project-posts
```

## sample curl command

curl -X POST -H "Content-Type: application/json" -d @./sample_post.json https://p3keskibu8.execute-api.us-east-1.amazonaws.com/dev/posts


curl -X POST -H "Content-Type: application/json" -d @./sample_post.json http://localhost:3000/posts
