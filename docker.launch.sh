#!/usr/bin/env bash

export NVM_DIR=/usr/local/nvm
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" # This loads nvm

cd $MAD_DIR

nvm use
npm run dev
