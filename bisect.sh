#!/bin/bash
set -e
rm -rf node_modules/
yarn install
yarn test:all
npx --max-old-space-size=4096 sls package
