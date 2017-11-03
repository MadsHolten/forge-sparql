# Forge SPARQL

A demo of this project was presented at the buildingSMART International Summit in London 2017.

## Install

You need node.js installed on your machine. Get it here: `https://nodejs.org/en/`. Tested with version 6.9.1.

1) Run `npm install` to install all dependencies. Further requires Angular-CLI and Typescript installed globally on the machine.

2) Copy the two config-files and remove the _:
  src/app/services/_config.ts  contains host and URI of triplestore and Forge Backend
  server/config/_forge-api.ts  contains Forge ID and secret
  
## Future

A version with a simple triplestore running on the included server will be included ASAP.
