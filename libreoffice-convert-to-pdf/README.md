### Serverless-LibreOffice

Serverless LibreOffice was installed from this repo: https://github.com/shelfio/aws-lambda-libreoffice

This lambda can be deployed from the Serverless Framework. Serverless will deploy the container as defined by the Dockerfile. 

It is also possible to deploy build the Docker container and push to AWS ECR.

It is also possible to build and test the container locally for testing. Here are some useful commands:

#### Build the container locally:
```
docker build --no-cache --platform linux/amd64 -t libreoffice-lambda --progress=plain .    
```

#### enter the container
```
docker run --platform linux/amd64 -it --entrypoint /bin/bash libreoffice-lambda
```

#### Test the container locally
1. run the container
`
docker run --rm -p 9000:8080 --platform linux/amd64 --name libreoffice-lambda libreoffice-lambda
`
2. In a seperate terminal do an invocation
`
curl -X POST http://localhost:9000/2015-03-31/functions/function/invocations -H 'Content-Type: application/json' -d '"{\"message\":\"Hello Lambda!\"}"' | python3 -m json.tool
`


### Create an .env file that looks similar to this:

```
STAGE = deploy
DEPLOYMENT_BUCKET = teachosm-geosurge-libreoffice
CONTENT_UPLOADS_BUCKET = teachosm-geosurge-content-uploads
CONTENT_BUCKET = teachosm-geosurge-content
```

### Tips

Good Post on running Docker containers locally: https://medium.com/dataengineerbr/how-to-run-aws-lambda-locally-on-your-computer-with-docker-containers-533a3add1b45 
