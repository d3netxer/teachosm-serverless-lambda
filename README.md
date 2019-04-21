# teachosm-serverless-lambda

This Lambda function processes project submissions via TeachOSM website.

## TeachOSM site

user upload form content:

-google captcha
-fields
-tags
-thumbnail
-youtube link
-content

## Steps:

1. User submits form

2. Lambda processes Google Captcha

3. If Google Captcha sucessful, TeachOSM Lambda continues processing form data:

-creates a metadata form

-if content, then:
  -save content to S3 (prepend with datetime)
  -convert content to word doc and pdf
  -save links in metadata form

if thumbnail:
  -prepend filename with datetime
  -save link in doc metadata form

Lambda makes a github pull request with the metadata form (markdown with yaml front-matter)

4. On TeachOSM site after successful submission, a completed message is sent to the user. 


## extra tips

### dependancies
Do an 'npm install'. 

### how to run locally
```
sls offline start
```

### how to deploy
```
sls deploy
```

### how to add a dependency example:

```
npm install uuid --save
```
and you see it gets added into the package.json


### useful tutorials
https://serverless.com/blog/serverless-express-rest-api/

