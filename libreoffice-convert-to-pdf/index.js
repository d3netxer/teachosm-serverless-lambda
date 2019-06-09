const {writeFileSync, readFileSync} = require('fs');
const {execSync} = require('child_process');
const {parse} = require('path');
const {S3} = require('aws-sdk');

// This code runs only once per Lambda "cold start"
execSync(`curl https://s3.amazonaws.com/lambda-libreoffice-teachosm-demo/lo.tar.gz -o /tmp/lo.tar.gz && cd /tmp && tar -xf /tmp/lo.tar.gz`);

const s3_input = new S3({params: {Bucket: 'lambda-libreoffice-teachosm-demo'}});
const s3_output = new S3({params: {Bucket: 'teachosm-project-content'}});

const convertCommand = `/tmp/instdir/program/soffice --headless --invisible --nodefault --nofirststartwizard --nolockcheck --nologo --norestore --convert-to pdf --outdir /tmp`;

//exports.handler = async ({filename}) => {
exports.handler = async (event) => {
  console.log('print event');
  console.log(event['Records'][0]['s3']['object']['key']);
  filename = event['Records'][0]['s3']['object']['key'];
  
  const {Body: inputFileBuffer} = await s3_input.getObject({Key: filename}).promise();
  writeFileSync(`/tmp/${filename}`, inputFileBuffer);

  execSync(`cd /tmp && ${convertCommand} ${filename}`);

  const outputFilename = `${parse(filename).name}.pdf`;
  const outputFileBuffer = readFileSync(`/tmp/${outputFilename}`);

  await s3_output
    .upload({
      Key: outputFilename, Body: outputFileBuffer,
      ACL: 'public-read', ContentType: 'application/pdf'
    })
    .promise();

  return `https://s3.amazonaws.com/lambda-libreoffice-teachosm-demo/${outputFilename}`;
};