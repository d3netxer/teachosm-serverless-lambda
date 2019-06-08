# teachosm-serverless-lambda

This repo contains a collection of services that process project submissions on the TeachOSM website.

## development to-do list

- aws-node-upload-to-s3-and-postprocess: trigger the libre-office lambda function when a new file upload trigger occurs

- aws-commit-to-github: improve by creating a new branch for every new posting

- serverlessS3Upload: create a function to upload the content


## TeachOSM submit project steps:

1. User hits submit form button and Lambda processes Google Captcha

3. If Google Captcha sucessful, TeachOSM project page will send up to 3 post requests:

-a POST request is sent for the content:
  -before the POST request the form appends filename with datetime
  -serverlessS3Upload will save file in S3 bucket
  -when file saved in S3 bucket, this will kick off the libre-office document conversion using the aws-node-upload-to-s3-and-postprocess lambda function

-a POST request is sent for the project pic:
  -before the POST request the form appends filename with datetime
  -serverlessS3Upload will save file in S3 bucket

-a POST request is sent with the metadata, fields will include the project pic filename with datetime appended and the project_file file name with the datetime appended. The TeachOSM Lambda function will convert the data into yaml and then saved in a S3 bucket. Another Lambda function will then make a github pull request with the metadata form (markdown with yaml front-matter).

4. Potential feature: On TeachOSM site after successful submission, a message is sent to the user.

sample metadata submission:

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

in JSON:

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

in yaml:

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

