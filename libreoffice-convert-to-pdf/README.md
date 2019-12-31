### Serverless-LibreOffice

Serverless LibreOffice was installed seperately following these instructions: https://github.com/vladgolubev/serverless-libreoffice/blob/master/STEP_BY_STEP.md

Installing this function includes manually creating an S3 bucket, downloading the compiled LibreOffice and uploading it to the bucket before deploying.

- edit the index.js file to make sure that the execSync commands are pointing to the lo.tar.gz file in the right bucket

### Create an .env file that looks similar to this:

```
STAGE = deploy
DEPLOYMENT_BUCKET = teachosm-geosurge-libreoffice
CONTENT_UPLOADS_BUCKET = teachosm-geosurge-content-uploads
CONTENT_BUCKET = teachosm-geosurge-content
```



