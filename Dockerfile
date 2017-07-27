FROM ubuntu:16.04

SHELL ["/bin/bash", "-c"]

RUN apt-get update
RUN apt-get install build-essential libssl-dev -y
RUN apt-get install curl -y

RUN curl -sL https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh -o install_nvm.sh
RUN bash install_nvm.sh

WORKDIR /root/
ADD package.json /root/package.json

RUN bash -c "source /root/.nvm/nvm.sh && nvm install 8 && npm install"
