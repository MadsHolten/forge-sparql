# Forge SPARQL

A demo of this project was presented at the buildingSMART International Summit in London 2017.

## Demo
See a running demo [here](https://forge-sparql.herokuapp.com/)

## Install

You need node.js installed on your machine. Get it here: `https://nodejs.org/en/`. Tested with version 6.9.1.

1) Forge credentials are defined in `server/config/forge-api.ts` or preferably by environment variables `FORGE_ID` and `FORGE_SECRET`
2) Currently model data is hardcoded in `src/app/forge-viewer/viewer-container/viewer-container.component.ts` - should be stated in GUI
3) Run `npm install` to install all dependencies. Further requires Angular-CLI and Typescript installed globally on the machine.

## Start server
run `node server/server.js`

## Settings
Host and ports can be defined in `config.json` (default is localhost:3000)

Triple-file and model files are located in ´data´
Any Forge model can be used. Data about model in `src/app/forge-viewer/viewer-container.component.ts`
Any Triple file can be used. Triple file defined in `server/models/query-engine.js`

## see also
The application is a simplified version from what is described in this Workshop paper:
*Mads Holten Rasmussen, Christian Anker Hviid and Jan Karlshøj (2017) Web-based topology queries on a BIM model, 5th Linked Data in Architecture and Construction Workshop (LDAC2017), November 13-15, 2017, Dijon, France, [https://www.researchgate.net/publication/320757039_Web-based_topology_queries_on_a_BIM_model](https://www.researchgate.net/publication/320757039_Web-based_topology_queries_on_a_BIM_model)*
