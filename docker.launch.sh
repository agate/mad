#!/usr/bin/env bash

set -xe

export NVM_DIR=/usr/local/nvm
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" # This loads nvm

MAD_DIR=${MAD_DIR:-/opt/mad}
REPO=https://github.com/agate/mad.git

if [ ! -d $MAD_DIR ]; then
  CLONE_CMD="git clone $REPO --depth 1"
  [ $BRANCH ] && CLONE_CMD="${CLONE_CMD} --branch ${BRANCH}"
  $CLONE_CMD $MAD_DIR
fi

cd $MAD_DIR

if [ ! -d node_modules ]; then
  cp -r $TMP_MAD_PATH/node_modules .
fi

nvm use
npm install

if [ $MAD_PROD ]; then
  npm run prod
else
  npm run dev
fi
