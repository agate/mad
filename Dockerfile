FROM ubuntu:16.04

RUN apt-get update
RUN apt-get install -y build-essential libssl-dev curl

RUN curl -sL https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | NVM_DIR=/usr/local/nvm bash

RUN curl -sL https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64 > /usr/local/bin/dumb-init 
RUN chmod +x /usr/local/bin/dumb-init

ENV MAD_DIR /root/mad
ADD . /root/mad
WORKDIR /root/mad

RUN bash -c "source /usr/local/nvm/nvm.sh; nvm install && npm install"

ENTRYPOINT ["/usr/local/bin/dumb-init", "--"]
CMD ["/root/mad/docker.launch.sh"]
