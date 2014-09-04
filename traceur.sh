#!/bin/bash

# Require: npm install traceur -g

./node_modules/.bin/traceur \
	--experimental \
	--source-maps  \
	--out build/spearal.js \
	--script src/SpearalType.js \
	--script src/SpearalContext.js \
	--script src/SpearalEncoder.js \
	--script src/SpearalDecoder.js \
	--script src/SpearalFactory.js