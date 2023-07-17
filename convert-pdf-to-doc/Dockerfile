FROM public.ecr.aws/lambda/python:3.9-arm64

# Install build tools, lxml dependencies, and additional libraries
RUN yum install -y gcc python3-devel libxml2-devel libxslt-devel mesa-libGL

# Upgrade pip
RUN pip3 install --upgrade pip

# Then try to install your requirements
COPY requirements.txt ./
RUN pip3 install -r requirements.txt

# Copy the rest of the code
COPY handler.py /var/task/

CMD ["handler.pdf_to_doc_handler"]
