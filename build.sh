#!/bin/bash

rm -rf dist

yarn bili
rm -rf dist/src

cp library/package.json dist/package.json
cp README.md dist
