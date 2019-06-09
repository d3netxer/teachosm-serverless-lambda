# teachosm-serverless-lambda

This repo contains a collection of services that process project submissions on the TeachOSM website.

## development to-do list

- aws-commit-to-github: improve by creating a new branch for every new posting


## TeachOSM submit project steps:

1. User hits submit form button and Lambda processes Google Captcha

3. If Google Captcha sucessful, TeachOSM project page will send up to 3 post requests:

-a POST request is sent for the content:
  -before the POST request the form appends filename with datetime
  -serverlessS3Upload will save file in S3 bucket by returning back a signedURL.
  -form will then upload content. When the content is uploaded, the promise in the form will be a success, then the form will invoke the libre-office document conversion?

-a POST request is sent for the project pic:
  -before the POST request the form appends filename with datetime
  -serverlessS3Upload will save file in S3 bucket by returning back a signedURL, then form will upload pic.

-a POST request is sent with the metadata, fields will include the project pic filename with datetime appended and the project_file file name with the datetime appended. The TeachOSM Lambda function will convert the data into yaml and then saved in a S3 bucket. Another Lambda function will then make a github pull request with the metadata form (markdown with yaml front-matter).

4. Potential feature: On TeachOSM site after successful submission, a message is sent to the user.

sample metadata submission:

```
username: test_osm_user
title: "Field Mapping Supplies"
description: "This is part of the second lesson of the course where we outline field mapping supply checklist"
audience: primary
difficulty: beginner
educator_prep_time: less_than_1_hour
education_activity_duration: [local, environment, land_use]
project_type: field_mapping
group: "Centerville High School Field Mapping Class"
group_sequence: 2
tags: [population_migration,political_organization_of_space,gis]
project_pic: compass_20190501.png
project_file: field_mapping_supplies_20190501.doc
youtube_link: none
```

in JSON:

```
{
  "username": "test_osm_user",
  "title": "Field Mapping Supplies",
  "description": "This is part of the second lesson of the course where we outline field mapping supply checklist",
  "audience": "primary",
  "difficulty": "beginner",
  "educator_prep_time": "less_than_1_hour",
  "education_activity_duration": ["local", "environment", "land_use"],
  "project_type": "field_mapping",
  "group": "Centerville High School Field Mapping Class",
  "group_sequence": "1",
  "tags": ["population_migration", "political_organization_of_space", "gis"],
  "project_pic": "compass_20190501.png",
  "project_file": "field_mapping_supplies_20190501.doc",
  "youtube_link": "none"
}
```

in yaml:

```
---
  username: "test_osm_user"
  title: "Field Mapping Supplies"
  description: "This is part of the second lesson of the course where we outline field mapping supply checklist"
  audience: "primary"
  difficulty: "beginner"
  educator_prep_time: "less_than_1_hour"
  education_activity_duration: 
    - "local"
    - "environment"
    - "land_use"
  project_type: "field_mapping"
  group: "Centerville High School Field Mapping Class"
  group_sequence: "1"
  tags: 
    - "population_migration"
    - "political_organization_of_space"
    - "gis"
  project_pic: "compass_20190501.png"
  project_file: "field_mapping_supplies_20190501.doc"
  youtube_link: "none"
```

### Serverless-LibreOffice

Serverless LibreOffice was installed seperately following these instructions: https://github.com/vladgolubev/serverless-libreoffice/blob/master/STEP_BY_STEP.md

This included manually creating an S3 bucket, downloading the compiled LibreOffice, creating an IAM role and policy, and creating a node.js lambda function.

#### 

- The libreoffice-convert-to-pdf lambda function is triggered when a new file is uploaded (into the lambda-libreoffice-teachosm-demo s3 bucket). This trigger was created by manually an event to the lambda function whenever a new object is created. The libreoffice-convert-to-pdf output the files into another bucket (teachosm-project-content) so that the trigger does not activate again.

## extra tips

Each folder represents a different function, which is made up of one of more services. Within each folder do an 'npm install'. Also install the Serverless Framework on your computer.

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

