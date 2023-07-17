FROM public.ecr.aws/shelf/lambda-libreoffice-base:7.4-node16-x86_64

WORKDIR ${LAMBDA_TASK_ROOT}

ENV HOME="/tmp"

ENV PATH="/opt:${PATH}"
ENV PATH="/opt/libreoffice7.4:${PATH}"

RUN ls -l /opt

RUN whereis libreoffice7.4

RUN whereis soffice

RUN find / -name libreoffice7.4

# Install yarn
# RUN npm install -g yarn

# If you have a package.json file, copy it into the Docker container
# Copy package.json and package-lock.json into the image
COPY package*.json ./

# Install the modules listed in the package.json file
RUN npm install

# # Install the @shelf/aws-lambda-libreoffice package
# RUN yarn add @shelf/aws-lambda-libreoffice

# Copy your application code into the Docker container
COPY index.js .

# Install java
RUN yum install java-1.8.0-openjdk-devel -y

# Set the CMD
CMD [ "index.handler" ]

# smoke start to speed up
# https://github.com/shelfio/libreoffice-lambda-base-image/issues/4
COPY demo.docx .
RUN libreoffice7.4 --headless --invisible --nodefault --view --nolockcheck --nologo --norestore --convert-to pdf --outdir /tmp demo.docx
RUN rm /tmp/demo.*

# for testing
# COPY demo.docx .
# RUN /opt/libreoffice7.4/program/soffice --headless --invisible --nodefault --view --nolockcheck --nologo --norestore --convert-to pdf --outdir /tmp demo.docx
# RUN rm /tmp/demo.*