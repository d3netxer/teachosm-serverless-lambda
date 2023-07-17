from dotenv import load_dotenv
import os

import json

from pdf2docx import Converter

print('Loading function')

import boto3
#import requests

# load environment variables
load_dotenv()


def pdf_to_doc_handler(event, context):
    #print("Received event: " + json.dumps(event, indent=2))
    message = event['Records'][0]['Sns']['Message']
    print("From SNS: " + json.dumps(message))

    print('print CONTENT_UPLOADS_BUCKET')
    print(os.getenv('CONTENT_UPLOADS_BUCKET'))

    # access environment variables
    S3_BUCKET = os.getenv('CONTENT_UPLOADS_BUCKET') + '-' + os.getenv('STAGE')

    print('print S3_BUCKET')
    print(S3_BUCKET)

    object_key = "OBJECT_KEY"

    s3 = boto3.resource('s3')
    #my_bucket = s3.Bucket('tgertin-content-uploads')
    my_bucket = s3.Bucket('teachosm-geosurge-content-personal')

    # for my_bucket_object in my_bucket.objects.all():
    #     print(my_bucket_object)

    #return message
    print('your python lambda doc conversion test')

    
    # File paths
    #pdf_path = "/Users/tomgertin/repos/teachosm-serverless-lambda/convert-pdf-to-doc/demo.pdf"
    pdf_path = f"/tmp/{message}"

    #my_bucket.download_file('demo.pdf', pdf_path)

    my_bucket.download_file(message, pdf_path)


    #doc_path = "/Users/tomgertin/repos/teachosm-serverless-lambda/convert-pdf-to-doc"

    try:
        #docx_path = '/tmp/demo.docx'
        
        # Create the .docx file with the same name
        file_name_index = pdf_path[::-1].find("/")
        docx_export_path = pdf_path[len(pdf_path) - file_name_index:-4] + ".docx"
        docx_path = f'/tmp/{docx_export_path}'

        print(f"pdf_path is {pdf_path}")

        # Convert pdf to docx
        cv = Converter(pdf_path)
        cv.convert(docx_path)      # all pages by default
        cv.close()

        print("\nYour docx was created successfully!")

        s3.meta.client.upload_file(docx_path, S3_BUCKET, docx_export_path, ExtraArgs={'ACL': 'public-read'})
        
    except RuntimeError as e:
        print("Caught an exception: ", str(e))
        #os.system ("cls")
        #print("Error: You closed the \"Choose file\" window before selecting a file!")
        # input("\nPress enter to exit.")

# if __name__ == "__main__":
#     pdf_to_doc_handler('', '')