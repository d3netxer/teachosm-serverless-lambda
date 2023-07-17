const {execSync} = require('child_process');
const AWS = require('aws-sdk');
const tar = require('tar');
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');
const https = require('https');
//const sns = new aws.SNS({ region: 'us-east-1' })
const {convertTo, canBeConvertedToPDF} = require('@shelf/aws-lambda-libreoffice');

// Set region
AWS.config.update({region: 'us-east-1'});

require('dotenv').config();

console.log('This code runs only once per Lambda cold start');

const s3_input = new AWS.S3({params: {Bucket: process.env.CONTENT_UPLOADS_BUCKET + '-' + process.env.STAGE}});
//const s3_input = new AWS.S3({params: {Bucket: process.env.CONTENT_UPLOADS_BUCKET}});
const s3_output = new AWS.S3({params: {Bucket: process.env.CONTENT_BUCKET + '-' + process.env.STAGE}});
//const s3_output = new AWS.S3({params: {Bucket: 'teachosm-geosurge-content-personal'}});

//converting to pdf
//const convertCommand = `/tmp/program/soffice --headless --invisible --nodefault --nofirststartwizard --nolockcheck --nologo --norestore --convert-to pdf --outdir /tmp`;
//const convertCommand = `/tmp/instdir/program/soffice.bin --headless --invisible --nodefault --nofirststartwizard --nolockcheck --nologo --norestore --convert-to pdf --outdir /tmp`;
// const convertCommand = `/opt/instdir/program/soffice --headless --invisible --nodefault --nofirststartwizard --nolockcheck --nologo --norestore --convert-to pdf --outdir /tmp`;
//const convertCommand = `/tmp/program/soffice.bin --headless --invisible --nodefault --nofirststartwizard --nolockcheck --nologo --norestore --convert-to pdf --outdir /tmp`;
//const convertCommand = `/tmp/program/soffice.bin --version`;
const convertCommand = `cd /tmp
libreoffice7.4 --headless --invisible --nodefault --view --nolockcheck --nologo --norestore --convert-to pdf --outdir /tmp`;

//converting to docx does not work with libreoffice lambda
exports.handler = async (event) => {

  // Function to get current filenames
  // in directory
  // var filenames = fs.readdirSync('/opt');
    
  // console.log("\nCurrent directory filenames:");
  // filenames.forEach(file => {
  //   console.log(file);
  // });

  console.log('print event6');
  console.log(event['Records'][0]['s3']['object']['key']);
  var filename;
  filename = event['Records'][0]['s3']['object']['key'];

  console.log('print s3_input8xyz');
  console.log(s3_input);
  
  const {Body: inputFileBuffer} = await s3_input.getObject({Key: filename}).promise();
  fs.writeFileSync(`/tmp/${filename}`, inputFileBuffer);

  console.log('print ext')
  console.log(path.parse(filename).ext)

  console.log('execSync ls tmp7');
  execSync(`cd /tmp && ls`);

  
  //if input file a pdf
  if (path.parse(filename).ext == '.pdf') {
    // trigger sns with file pdf name
    // sns will trigger the python convert-pdf-to-doc lambda
    
    console.log('publish SNS message to trigger PDF to DOC lambda');
    // Create publish parameters
    var params = {
      Message: filename, /* required */
      TopicArn: `arn:aws:sns:${process.env.region}:${process.env.accountid}:${process.env.snstopic}`
    };

    console.log(`TopicArn is: ${params.TopicArn}`)

    console.log(`Message is: ${params.Message}`)

    // Create promise and SNS service object
    var publishTextPromise = new AWS.SNS().publish(params).promise();

    // Handle promise's fulfilled/rejected states
    publishTextPromise.then(
      function(data) {
        console.log(`Message ${params.Message} sent to the topic ${params.TopicArn}`);
        console.log("MessageID is " + data.MessageId);
      }).catch(
        function(err) {
        console.error(err, err.stack);
      });

  } 
  // if document is not a pdf, then convert to a pdf
  else {

    try {

      // Your existing code here
      //const result = await new Promise(async (resolve, reject) => {
      // ... the rest of your code ...
      // convert to pdf
      console.log('running convertCommand5y');
      console.log(`filename is: ${filename}`);


      try {
        let stats = fs.statSync(`/tmp/${filename}`);
        let fileSizeInKilobytes = stats.size / 1024;
        console.log(`File size before convert is ${fileSizeInKilobytes} kilobytes`);
      } catch (err) {
        console.error(err);
      }

      //convertTo(filename, 'pdf')
      //execSync(`cd /opt && ${convertCommand} ${filename} `);
      //console.log('running simple version command');
      //execSync(`cd /tmp && ${convertCommand} 2>&1`);
      console.log('before convert command6x');
      console.log(process.env.PATH);

      //convertTo(filename, 'pdf'); // returns /tmp/document.pdf
      execSync(`${convertCommand} /tmp/${filename}`);
      console.log('after convert command');

      console.log('is file a doc or docx');

      //if input file is a doc, then transfer copy from uploads to content bucket
      if (path.parse(filename).ext == '.docx' || path.parse(filename).ext == '.doc') {

        console.log('file is doc or docx2');

        try {
          let stats = fs.statSync(`/tmp/${filename}`);
          let fileSizeInKilobytes = stats.size / 1024;
          console.log(`File size after convert is ${fileSizeInKilobytes} kilobytes`);
        } catch (err) {
          console.error(err);
        }

        var myContentType;
        if (path.parse(filename).ext == '.docx') {
          myContentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        } else {
          myContentType = 'application/msword'
        }

        console.log(`myContentType is: ${myContentType}`);
        console.log(`filename is: ${filename}`);

        console.log('will transfer doc or docx to uploads bucket2');

        try {
          let fileStream = fs.createReadStream(`/tmp/${filename}`);

          await s3_output
          .upload({
            Key: filename, Body: fileStream,
            ACL: 'public-read', ContentType: myContentType
          })
          .promise();
        } catch (err) {
          console.log(err);
          reject(err);
        }
        console.log("Success1x!");
        // ... continue your code and make sure to call resolve() or reject() at some point ...
        //resolve("Success2!");
        }
      //});
  
      //console.log(result);

    } catch (err) {
      console.error('An error occurred:', err);
    }
    
    
  }

  console.log('last section');
  const outputFilename = `${path.parse(filename).name}.pdf`;
  console.log(`outputFilename is: ${outputFilename}`);
  

  console.log('upload pdf to S3x24');

  //const s3x = new AWS.S3();

  console.log('new try3');
  try {
    const outputFileBuffer = fs.readFileSync(`/tmp/${outputFilename}`);
    await s3_output
    .upload({
      Key: outputFilename,
      Body: outputFileBuffer,
      ACL: 'public-read',
      ContentType: 'application/pdf'
    })
    .promise();
  } catch (err) {
    console.log(err);
    reject(err);
  }
  // ... continue your code and make sure to call resolve() or reject() at some point ...
  //resolve("Success1!");
  console.log("Success2x!");


  return 'complete'
};
