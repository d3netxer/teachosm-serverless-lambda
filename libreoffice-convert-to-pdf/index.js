const {writeFileSync, readFileSync} = require('fs');
const {execSync} = require('child_process');
const {parse} = require('path');
const {S3} = require('aws-sdk');

require('dotenv').config();

//requiring path and fs modules
//const path = require('path');
//const fs = require('fs');

//const zlib = require('zlib');

//console.log("read dir");

//const readStream = fs.createReadStream('/opt/lo.tar.br');
//const writeStream = fs.createWriteStream('/tmp/lo.tar');

//console.log("Create brotli decompress object");
// Create brotli decompress object
//const brotli = zlib.createBrotliDecompress();

//console.log("Pipe the read and write operations with brotli decompression");
// Pipe the read and write operations with brotli decompression
//const stream = readStream.pipe(brotli).pipe(writeStream);

//stream.on('finish', () => {
//  console.log('Done decompressing 😎');
//});

//joining path of directory 
//const directoryPath = path.join(__dirname, 'opt');
//console.log("print dir path: " + directoryPath);
//passsing directoryPath and callback function
//fs.readdir("/opt", function (err, files) {
//    //handling error
//    if (err) {
//        return console.log('Unable to scan directory: ' + err);
//    } 
    //listing all files using forEach
//    files.forEach(function (file) {
        // Do whatever you want to do with the file
//        console.log(file); 
//    });
//});


// This code runs only once per Lambda "cold start"
execSync(`curl https://s3.amazonaws.com/teachosm-geosurge-libreoffice-image-personal/lo.tar.gz -o /tmp/lo.tar.gz && cd /tmp && tar -xf /tmp/lo.tar.gz`);
// execSync(`tar -xf /tmp/lo.tar`);

const s3_input = new S3({params: {Bucket: process.env.CONTENT_UPLOADS_BUCKET + '-' + process.env.STAGE}});
const s3_output = new S3({params: {Bucket: process.env.CONTENT_BUCKET + '-' + process.env.STAGE}});

//converting to pdf
const convertCommand = `/tmp/instdir/program/soffice --headless --invisible --nodefault --nofirststartwizard --nolockcheck --nologo --norestore --convert-to pdf --outdir /tmp`;
// const convertCommand = `/opt/instdir/program/soffice --headless --invisible --nodefault --nofirststartwizard --nolockcheck --nologo --norestore --convert-to pdf --outdir /tmp`;

//converting to docx
const convertCommand_docx = `/tmp/instdir/program/soffice --headless --invisible --nodefault --nofirststartwizard --nolockcheck --nologo --norestore --convert-to docx --outdir /tmp`;
// const convertCommand_docx = `/opt/instdir/program/soffice --headless --invisible --nodefault --nofirststartwizard --nolockcheck --nologo --norestore --convert-to docx --outdir /tmp`;

//exports.handler = async ({filename}) => {
exports.handler = async (event) => {
  console.log('print event');
  console.log(event['Records'][0]['s3']['object']['key']);
  var filename;
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

  //doing for docx
  execSync(`cd /tmp && ${convertCommand_docx} ${filename}`);

  const outputFilename2 = `${parse(filename).name}.docx`;
  const outputFileBuffer2 = readFileSync(`/tmp/${outputFilename2}`);

  await s3_output
    .upload({
      Key: outputFilename2, Body: outputFileBuffer2,
      ACL: 'public-read', ContentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    })
    .promise();

  //return `https://s3.amazonaws.com/lambda-libreoffice-teachosm-demo/${outputFilename}`;
  return 'complete'
};
