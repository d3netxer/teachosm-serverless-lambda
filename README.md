# teachosm-serverless-lambda

This repo contains a collection of services that process project submissions on the TeachOSM website.

## TeachOSM submit project steps:

1. User hits submit form button and the Lambda processes Google Captcha

3. If Google Captcha successful, TeachOSM project page will send up to 3 post requests:

-a POST request is sent with the content:
  -before the POST request the form appends filename with datetime
  -The **serverlessS3Upload lambda** will save file in S3 bucket by returning back a signedURL.
  -form will then upload content. When the content is uploaded, the promise in the form will be a success, then the form will invoke the libre-office document conversion?

-a POST request is sent with the project pic:
  -before the POST request the form appends filename with datetime
  -The **serverlessS3Upload lambda** will save file in S3 bucket by returning back a signedURL, then form will upload pic.

-a POST request is sent with the metadata, fields will include the project pic filename with datetime appended and the project_file file name with the datetime appended. The **convert-post-request-to-yaml lambda** function will convert the data into yaml and then save it in a S3 bucket. The this same Lambda function will then make a github pull request with the metadata (markdown with yaml front-matter).

4. Potential feature: On TeachOSM site after successful submission, a message is sent to the user.


sample metadata submission in JSON:

```
{
  "title": "new test3 Field Mapping Supplies",
  "subtitle": "Module 1 - Intro to field papers",
  "description": "This is part of the second lesson of the course where we outline field mapping supply checklist",
  "author": "test_osm_user",
  "date_posted": "2019-08-01",
  "thumbnail": "compass_20190501.png",
  "filename": "field_mapping_supplies_20190501.doc",
  "type": "desktop",
  "audience": "primary",
  "difficulty": "beginner",
  "preparation_time": "one_hour",
  "project_time": "two_to_four_hours",
  "group": "Centerville High School Field Mapping Class",
  "group_sequence": "1",
  "layout": "project",
  "youtube_link": "none",
  "url": "sample-title3",
  "tags": ["population_migration", "political_organization_of_space", "gis"]
}
```

### Serverless-LibreOffice

Serverless LibreOffice was installed seperately following these instructions: https://github.com/vladgolubev/serverless-libreoffice/blob/master/STEP_BY_STEP.md

This included manually creating an S3 bucket, downloading the compiled LibreOffice, creating an IAM role and policy, and creating a node.js lambda function.

#### 

- The **libreoffice-convert-to-pdf** lambda function is triggered when a new file is uploaded (into the lambda-libreoffice-teachosm-demo s3 bucket). This trigger was created by manually an event to the lambda function whenever a new object is created. The libreoffice-convert-to-pdf output the files into another bucket (teachosm-project-content) so that the trigger does not activate again.

## extra tips

Each folder represents a different function, which is made up of one of more services. Within each folder do an 'npm install'. Also install the Serverless Framework on your computer.

### how to deploy
```
sls deploy
```

### how to run locally
```
sls offline start
```

### how to add a dependency example:

```
npm install uuid --save
```
and you see it gets added into the package.json


### useful tutorials
https://serverless.com/blog/serverless-express-rest-api/

