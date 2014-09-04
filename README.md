Spearal JavaScript
==================

## What is Spearal?

Spearal is a compact binary format for exchanging arbitrary complex data between various endpoints such as Java EE, JavaScript / HTML, Android and iOS applications.

Spearal-JS is the JavaScript implementation of the Spearal serialization format.

## How to get and build the project?

You need to have [node.js](http://nodejs.org/) installed.

````sh
$ git clone https://github.com/spearal/spearal-js.git
$ cd spearal-js
$ npm install
````

You can build the spearal library by running:

````sh
$ ./traceur.sh
````

The spearal.js file can then be found in the `build` directory.

## How to run the tests?

````sh
$ ./node_modules/.bin/karma start &
$ ./node_modules/.bin/karma run
````
