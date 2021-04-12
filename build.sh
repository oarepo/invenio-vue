#!/bin/bash

rm -rf dist

yarn bili
rm -rf dist/src

# set the version in package.json
./node_modules/.bin/jq --arg version $(jq -r ".version" package.json) '.version=$version' library/package.json >dist/package.json

cp README.md dist
