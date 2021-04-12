#!/bin/bash

(
  cd dist;
  npm version ${GITHUB_REF#refs/tags/}
)

npm publish --access public dist/
