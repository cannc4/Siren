#!/usr/bin/env sh
dir=$(dirname $0)
cd $dir
set -x
npm run sirenc
set +x
