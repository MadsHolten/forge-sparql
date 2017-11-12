# Forge SPARQL

A demo of this project was presented at the buildingSMART International Summit in London 2017.

## Install

You need node.js installed on your machine. Get it here: `https://nodejs.org/en/`. Tested with version 6.9.1.

1) Duplicate config-files and remove the `_`:
  `./_config.json` contains desired port for the server
  `server/config/_forge-api.ts` contains Forge ID and secret (can also be defined as environment variables)
  `src/app/config/_backends.ts`

2) Run `npm install` to install all dependencies. Further requires Angular-CLI and Typescript installed globally on the machine.

## Start server
run `node server/server.js`

## Settings

Triple-file is stored in src/assets
Any Forge model can be used. Data about model in src/app/forge-viewer/viewer-container.component.ts
