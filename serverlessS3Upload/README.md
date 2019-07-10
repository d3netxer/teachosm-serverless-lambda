# Serverless Direct S3 File Upload

This example uses the [Serverless](https://serverless.com/) framework to show how sites can enable visitors to upload files directly to [S3](https://aws.amazon.com/s3/), rather than through a webserver.

## Why use the direct upload pattern?
File uploads are a common website feature however it is not immediately apparent how to build them when using the [Serverless stack](https://angerhofer.co/posts/tags/serverless).  In a traditional model, a web server receives the upload from the client/browser and sends it along to storage (whatever form that may take -- e.g. saved on disk, saved _into_ a database, uploaded to S3, etc.).

This is a relatively time-intensive task for the web server, so S3 introduces an alternative: temporary access privileges.  This alternate pattern has two steps.  First, the [Lambda](https://aws.amazon.com/lambda/) function asks S3 through our IAM credentials for a public link that will let the browser upload the file directly to an S3 bucket.  It returns this link to the browser, which subsequently `PUT`s the file to the link and completes the upload.

This model takes a fair bit of load off our Lambda functions without sacrificing the security of the upload, saving otherwise significant costs.

## Why S3?
There are a plethora of good reasons to use S3 to store your application's file uploads and you can find a much more exhaustive rundown with a quick Google search than I could hope to describe here.  In short, S3 takes all the fretting out of storing, serving up, and backing up you application's files.

## Public Link Mechanism
[Line 23 in `handler.js`](https://github.com/jangerhofer/serverlessS3Upload/blob/master/handler.js#L23): `var uploadURL = s3.getSignedUrl('putObject', s3Params);`

[This method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getSignedUrl-property) asks S3 to generate a single-use link that will allow a browser that is NOT authenticated with AWS to upload a specific file (as specified by the `POST` request outlined below) to the application's S3 bucket.  That way, the file being uploaded never touches the Lambda server and instead goes directly from the browser into storage.

## Usage
_Assuming AWS credentials and Serverless are already configured properly._
- `npm install` the two dependencies.
- Replace the `[bucketName]` placeholder in both `handler.js` and `serverless.yml` with the desired bucket in which uploads will be stored.
- `serverless deploy` the service to AWS.
- `POST` to the API Gateway endpoint to generate a single-use upload link. _N.b. If either of these parameters does not match the file which is uploaded in the next step, S3 will throw an error and refuse the upload._
  - `POST` should have two `x-www-form-urlencoded` parameters:
    - `name`: Filename to be uploaded.
    - `type`: [MIME Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types) of file.
- Create a `PUT` request via your interface of choice (e.g. AJAX call, [Postman](https://www.getpostman.com/) request, or curl).  The URL will be the result from the previous `POST`.  Attach the file Blob/binary to the request and specify the proper headers for the `Content-Type`.
  - e.g. in Curl:
  ```
  curl -v -H 'Content-Type: image/png' -T ./testFile.png "https://[bucketName].s3.amazonaws.com/testFile.png?long_query_string..."
  ```

  Et voila!  Your bucket should now have the new file.

## Additional Examples

example 1:

initial request:

curl --data "name=horse.png" --data "type=image/png" https://ohwy7x30i8.execute-api.us-east-1.amazonaws.com/dev/requestUploadURL_pics

then use the returned signed url in the following request:

curl --upload-file horse.png 'https://teachosm-project-pics.s3.amazonaws.com/horse.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAY644J3UR37MEM23E%2F20190608%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20190608T222928Z&X-Amz-Expires=900&X-Amz-Security-Token=AgoJb3JpZ2luX2VjED8aCXVzLWVhc3QtMSJGMEQCIHFMk2EkLQ2fD%2Bc%2BTq4XqiIKhsofOoTD8kQvEK5VqOhJAiBodvCOSRzeadXiOIkPlQY%2BQBIbRc0niax16NOxbZ%2BuYyqlAghoEAEaDDYxNjExODczODIxMSIM7%2BuctDBrGckqA2PFKoICI4%2BGr2cv%2F7v4AxUayIITnCV9OFKPV2VIVXpk04DBL5qb0R92zdXCPdtqAydbsJwkRraD7jOWwDcDuExWvhZ0LgHJgl32UCFVA9txk%2BdjsmyBDTJ3vJz166BjPEaaRh%2BNkBdSHtUbbEe30M3fR%2FUzlIhruch3MbZKsw0Cb5ZXtOh7AEAetEfY0AnMP9eUsdcuj1xvWn5Qkb9IArjlmnhhyC%2BFC4E%2FuWC%2FRgizLqaIkoDhXRv9sZy755vzD56eagShNWvJjXeufPXZqplaTJcO7QKwvlAQDkoc%2BMa0W23m6njVgYoJ9uR2qIv7e2rrWQAp6Da6UIc8VSzYMNbIsNpSTymrMMjt8OcFOrUB%2FwPsAwcokoLg11RnjFwu1HzQNWJ9TrleMdBi%2Fy51LjsXPtjLZyM3UisfDJR3lu1g0J3JyeK2ssDd5AjAxGn1A3%2BgQZPYaQ7gDdIk7%2FdVyvtTrBK9IFDfBPcVc3k2SlACiaTLDuz9uY81hBjOfoFLnqAvJcz3nuV2PTDlpWq8ZHexWjJSx8m7cUQTHKiwddEcha0LUhdcr10%2FKUDvL7I02Y%2BkJFdlWfSAtoAeAqstMKh3P%2FgZsA%3D%3D&X-Amz-Signature=e0e587ceb7036c916157d9e4846d656dd7ea78c551b66af7a2131f78b879fdd5&X-Amz-SignedHeaders=host%3Bx-amz-acl&x-amz-acl=public-read'

example 2:

initial request:

curl --data "name=boat.jpeg" --data "type=image/jpeg" https://ohwy7x30i8.execute-api.us-east-1.amazonaws.com/dev/requestUploadURL_pics

then use the returned signed url in the following request:

curl --upload-file boat.jpeg 'https://teachosm-project-pics.s3.amazonaws.com/boat.jpeg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAY644J3UR37MEM23E%2F20190608%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20190608T223310Z&X-Amz-Expires=900&X-Amz-Security-Token=AgoJb3JpZ2luX2VjED8aCXVzLWVhc3QtMSJGMEQCIHFMk2EkLQ2fD%2Bc%2BTq4XqiIKhsofOoTD8kQvEK5VqOhJAiBodvCOSRzeadXiOIkPlQY%2BQBIbRc0niax16NOxbZ%2BuYyqlAghoEAEaDDYxNjExODczODIxMSIM7%2BuctDBrGckqA2PFKoICI4%2BGr2cv%2F7v4AxUayIITnCV9OFKPV2VIVXpk04DBL5qb0R92zdXCPdtqAydbsJwkRraD7jOWwDcDuExWvhZ0LgHJgl32UCFVA9txk%2BdjsmyBDTJ3vJz166BjPEaaRh%2BNkBdSHtUbbEe30M3fR%2FUzlIhruch3MbZKsw0Cb5ZXtOh7AEAetEfY0AnMP9eUsdcuj1xvWn5Qkb9IArjlmnhhyC%2BFC4E%2FuWC%2FRgizLqaIkoDhXRv9sZy755vzD56eagShNWvJjXeufPXZqplaTJcO7QKwvlAQDkoc%2BMa0W23m6njVgYoJ9uR2qIv7e2rrWQAp6Da6UIc8VSzYMNbIsNpSTymrMMjt8OcFOrUB%2FwPsAwcokoLg11RnjFwu1HzQNWJ9TrleMdBi%2Fy51LjsXPtjLZyM3UisfDJR3lu1g0J3JyeK2ssDd5AjAxGn1A3%2BgQZPYaQ7gDdIk7%2FdVyvtTrBK9IFDfBPcVc3k2SlACiaTLDuz9uY81hBjOfoFLnqAvJcz3nuV2PTDlpWq8ZHexWjJSx8m7cUQTHKiwddEcha0LUhdcr10%2FKUDvL7I02Y%2BkJFdlWfSAtoAeAqstMKh3P%2FgZsA%3D%3D&X-Amz-Signature=87be666838147763d2a00f03d0bb041cbc21ffe75c35af6b98af693e9272434b&X-Amz-SignedHeaders=host%3Bx-amz-acl&x-amz-acl=public-read'


example 3:

initial request:

curl --data "name=sample_text.txt" --data "type=text/plain" https://ohwy7x30i8.execute-api.us-east-1.amazonaws.com/dev/requestUploadURL_content

then use the returned signed url in the following request:

curl --upload-file sample_text.txt 'https://teachosm-project-content.s3.amazonaws.com/sample_text.txt?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAY644J3URQPR3QE74%2F20190608%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20190608T223434Z&X-Amz-Expires=900&X-Amz-Security-Token=AgoJb3JpZ2luX2VjED8aCXVzLWVhc3QtMSJHMEUCIFs%2F1Cv%2F5ja6mx8TuV1x6xKinHQ1eSVodugml4xGSu5VAiEA1djwWN1ASZTVhjfMWKb7tQXcntXxTXzTx%2B2g1TnDZ2wqqAIIaBABGgw2MTYxMTg3MzgyMTEiDErh8B8idmWGk%2BMr5CqFAibOlwU0PSkLlXzj4K7JdODU1umcz%2BXSEYpqAh9r7MD4dqhYs%2FZw%2F6l9lNePwPhCkHCypzCl291tDdr4tq0y62yO0GzgRY2opfW%2BNapfZROytkXBlxnx40DKL4ZB9q8LSdSdO31yTGrMwToxevoWNnx%2Bmr%2BCGpdF9QEo27Q5s5P1lXhutVGLtcLhlUQb4%2BELVrcHTvATu0NuJWqDNcZQa1R0NVSDCztdATPMmZJaQFSD0TEeTVWNScOpQrDhIRTv50VgHHVEDsCzaN1jj%2BpUgAf7Fhlr0ejTGK7cc9GtWBNRGFtiZzKgkwxEfFoTZEM4lmMJ17MXj0JdjRtejZ83QWgRPU1iZzD57%2FDnBTq0AeGADMnmIiqTe95rDJpg2s1DzNkM6eftGUGyvVa4VCA5FC2pAa2i7ntZWLzQSg%2FZCFllaZKTZCtdeQl8qCTIEO2rpskcr1ZRxmhn67O5En6KfX9m8Fq6AckVffiZ0IaaLzjH53aNXHygHpRpTBsKCYwHwrVo7KpI4ky20pou3ZrfK%2FGfMUu3%2BUIMSL%2BQzEo1tyIm8c4oviGayBNDTm1S6hhV6Pl%2BrXoJtafH9ezh6rq%2BDF49dg%3D%3D&X-Amz-Signature=1466c83bea3474d62fa89c41790a1358899d84cd473e923f71fe1e54a47cdeb3&X-Amz-SignedHeaders=host%3Bx-amz-acl&x-amz-acl=public-read'

## Extra Tips
In your S3 CORS configuration editor, make sure you have the following to prevent CORS same-origin-policy errors:
```
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
<CORSRule>
    <AllowedOrigin>*</AllowedOrigin>
    <AllowedMethod>GET</AllowedMethod>
    <AllowedMethod>PUT</AllowedMethod>
    <AllowedMethod>POST</AllowedMethod>
    <AllowedMethod>HEAD</AllowedMethod>
    <AllowedHeader>*</AllowedHeader>
</CORSRule>
</CORSConfiguration>
```
