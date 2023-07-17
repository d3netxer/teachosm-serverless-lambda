# teachosm-serverless-lambda

This repo contains a collection of services that process project submissions on the TeachOSM website.

## TeachOSM website submit project steps:

1. User hits submit form button and the **convert-post** Lambda processes Google Captcha

3. If Google Captcha is successful, the TeachOSM project page will send up to 3 post requests:

- a POST request is sent with the content:
  - before the POST request the form appends filename with datetime
  - The **serverlessS3Upload lambda** will save file in S3 bucket by returning back a signedURL.
  - form will then upload content. When the content is uploaded to the content uploads bucket, it will trigger the the **libreoffice-convert-to-pdf lambda** that will do the document conversion and save the outputs to the content bucket. If the uploaded content is a doc file, then the **libreoffice-convert-to-pdf lambda** function will also make a SNS notification to trigger the **convert-pdf-to-doc** lambda function.

- a POST request is sent with the project pic:
  - before the POST request the form appends filename with datetime
  - The **serverlessS3Upload lambda** will save file in S3 bucket by returning back a signedURL, then form will upload pic. When the pic is uploaded to the PICS_UPLOADS_BUCKET it will trigger the **aws-s3-thumbnail-generator** bucket that will convert and create a thumnbail version of the pic in the same bucket.

- a POST request is sent with the metadata, fields will include the project pic filename with datetime appended and the project_file file name with the datetime appended. The **convert-post lambda** function will convert the data into yaml and then save it in a S3 bucket. This same Lambda function will then make a github pull request with the metadata (markdown with yaml front-matter).

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

## how to deploy

The Lambda functions will depend on the necessary buckets already being created.

### Create buckets

- teachosm-geosurge-content-{stage}

- teachosm-geosurge-project-posts-{stage}

- teachosm-geosurge-libreoffice-image-{stage}

#### with extra CORS permissions:

- teachosm-geosurge-project-pics-{stage}

- teachosm-geosurge-content-uploads-{stage}

#### deployment buckets:

- teachosm-geosurge-serverless-s3upload-{stage}

- teachosm-geosurge-convert-post-request-to-yaml-{stage}

- teachosm-geosurge-libreoffice-{stage}

#### Example command to create bucket using CLI:

```aws s3api create-bucket --bucket teachosm-geosurge-content-deploy --region us-east-1```

#### Set extra CORS permissions 

aws s3api put-bucket-cors --bucket teachosm-geosurge-project-pics-{stage} --cors-configuration file://cors.json

aws s3api put-bucket-cors --bucket teachosm-geosurge-content-uploads-{stage} --cors-configuration file://cors.json

cors.json:
```
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
      "MaxAgeSeconds": 3000,
      "ExposeHeaders": ["x-amz-server-side-encryption"]
    }
  ]
}
```

#### Extra instructions to load the libreoffice image

- upload lo.tar.gz (https://github.com/vladgolubev/serverless-libreoffice/releases) manually to teachosm-geosurge-libreoffice-image-{stage} bucket
- add Public Access with Read object access to file:
```
aws s3api put-object-acl --bucket teachosm-geosurge-libreoffice-image-{stage} --key lo.tar.gz --acl public-read
```

### Deploy functions using Serverless

Deploy using Serverless within each lambda function's directory. Within each folder do an 'npm install'. Also install the Serverless Framework on your computer. Make sure you are using the same version of node the matches what is in the serverless.yml file. Your AWS account needs the appropriate IAM permissions to deploy, here is an example of a permissions [policy that works](https://gist.github.com/d3netxer/b1d1a4012d6bf20b910c22d02ee43a80)

View the README within each directory for additional details. You should create an .env file within each directory that has important settings. The Serverless command will typically have an aws-profile tag, which specifies which AWS account you are deploying to and a stage tag, which corresponds to your bucket names.

ex.

```
sls deploy --aws-profile teachosm_deployer1 --stage personal
```

```
sls deploy
```

#### how to run locally
```
sls offline start
```

#### how to add a dependency example:

```
npm install uuid --save
```
and you see it gets added into the package.json


### useful tutorials
https://serverless.com/blog/serverless-express-rest-api/

