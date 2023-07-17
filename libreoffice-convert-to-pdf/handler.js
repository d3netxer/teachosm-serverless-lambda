const {convertTo, canBeConvertedToPDF} = require('@shelf/aws-lambda-libreoffice');
const {execSync} = require('child_process');
const {writeFileSync, existsSync} = require('fs');

module.exports.handler = async () => {
  // assuming there is a document.docx file inside /tmp dir
  // original file will be deleted afterwards

    let filePath = "/tmp/demo.docx";

    if (existsSync(filePath)) {
        console.log("File exists");
    } else {
        console.log("File does not exist");
    }

    console.log('before convert command');

    // it is optional to invoke this function, you can skip it if you're sure about file format
    if (!canBeConvertedToPDF('demo.docx')) {
        return false;
    }

    console.log('before convert command2');
    return convertTo('demo.docx', 'pdf'); // returns /tmp/document.pdf

    console.log('after convert command');
};



// module.exports.handler = () => {
//     writeFileSync('/tmp/hello.txt', Buffer.from('Hello World!'));

    

//     execSync(`
//     cd /tmp
//     libreoffice7.4 --headless --invisible --nodefault --view --nolockcheck --nologo --norestore --convert-to pdf --outdir /tmp ./demo.docx
//     `);

    

// };