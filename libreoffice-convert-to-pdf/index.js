//const {writeFileSync, readFileSync, createReadStream, createWriteStream, readdir} = require('fs');
const {execSync} = require('child_process');
//const {parse} = require('path');
const {S3} = require('aws-sdk');
//const request = require('request');
const tar = require('tar');
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');
const https = require('https');

require('dotenv').config();

console.log('This code runs only once per Lambda cold start');

// This code runs only once per Lambda "cold start"
//request('https://s3.amazonaws.com/teachosm-geosurge-libreoffice-image-personal/lo.tar.gz').pipe(fs.createWriteStream('/tmp/lo.tar.gz'))








//execSync(`cd /tmp && tar -xf /tmp/lo.tar.gz`);

const s3_input = new S3({params: {Bucket: process.env.CONTENT_UPLOADS_BUCKET + '-' + process.env.STAGE}});
const s3_output = new S3({params: {Bucket: process.env.CONTENT_BUCKET + '-' + process.env.STAGE}});

//converting to pdf
const convertCommand = `/tmp/program/soffice --headless --invisible --nodefault --nofirststartwizard --nolockcheck --nologo --norestore --convert-to pdf --outdir /tmp`;
//const convertCommand = `/tmp/instdir/program/soffice --headless --invisible --nodefault --nofirststartwizard --nolockcheck --nologo --norestore --convert-to pdf --outdir /tmp`;
// const convertCommand = `/opt/instdir/program/soffice --headless --invisible --nodefault --nofirststartwizard --nolockcheck --nologo --norestore --convert-to pdf --outdir /tmp`;

//converting to docx
const convertCommand_docx = `/tmp/program/soffice --headless --invisible --nodefault --nofirststartwizard --nolockcheck --nologo --norestore --convert-to docx --outdir /tmp`;
// const convertCommand_docx = `/opt/instdir/program/soffice --headless --invisible --nodefault --nofirststartwizard --nolockcheck --nologo --norestore --convert-to docx --outdir /tmp`;

//exports.handler = async ({filename}) => {
exports.handler = async (event) => {



    var req = https.get('https://s3.amazonaws.com/teachosm-geosurge-libreoffice-image-personal/lo.tar.gz');
    req.on('response', function(res) {
        res
            .pipe(zlib.createGunzip())
            .pipe(tar.x({strip: 1,C: '/tmp'}))

        console.log('read dir');

        //console.log('execSync ls tmp');
        //execSync(`cd /tmp && ls`);

        fs.readdir('/tmp', (err, files) => {
          console.log('starting to read dir');
          files.forEach(file => {
            console.log(file);
          });
        });

    });




  console.log('print event');
  console.log(event['Records'][0]['s3']['object']['key']);
  var filename;
  filename = event['Records'][0]['s3']['object']['key'];
  
  const {Body: inputFileBuffer} = await s3_input.getObject({Key: filename}).promise();
  fs.writeFileSync(`/tmp/${filename}`, inputFileBuffer);

  console.log('print ext')
  console.log(path.parse(filename).ext)

  console.log('execSync ls tmp2');
  execSync(`cd /tmp && ls`);

  if (path.parse(filename).ext != '.pdf') {
    execSync(`cd /tmp && ${convertCommand} ${filename}`);
  }
  
  const outputFilename = `${path.parse(filename).name}.pdf`;
  const outputFileBuffer = fs.readFileSync(`/tmp/${outputFilename}`);

  await s3_output
    .upload({
      Key: outputFilename, Body: outputFileBuffer,
      ACL: 'public-read', ContentType: 'application/pdf'
    })
    .promise();

  //doing for docx
  execSync(`cd /tmp && ${convertCommand_docx} ${filename}`);

  const outputFilename2 = `${path.parse(filename).name}.docx`;
  const outputFileBuffer2 = fs.readFileSync(`/tmp/${outputFilename2}`);

  await s3_output
    .upload({
      Key: outputFilename2, Body: outputFileBuffer2,
      ACL: 'public-read', ContentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    })
    .promise();

  //return `https://s3.amazonaws.com/lambda-libreoffice-teachosm-demo/${outputFilename}`;
  return 'complete'
};
