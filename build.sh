#!/bin/bash

rm -rf dist

yarn bili
rm -rf dist/src

# set the version in package.json
cp library/package.json dist/package.json
(
  cd dist;
  npm version ${GITHUB_REF#refs/tags/}
)

cp README.md dist
