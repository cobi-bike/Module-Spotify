# Spotify DevKit module for COBI.bike

The DevKit module "Spotify" allows the user to control the Spotify player remotely using the Spotify connect protocol.
It's part of a collection of Open Source [modules](https://cobi.bike/devkit) for the [COBI.bike](https://cobi.bike) system.

<img src="https://cdn.cobi.bike/static/devkit-assets/github/DevKit_module_Spotify.jpg" width="500px" alt="COBI.bike Spotify module">

## Quickstart: Interactive Demo

The quickest way to test the module via [Glitch.com](https://glitch.com):

[<img src="open_demo.png" width="250px" alt="Open demo button">](https://glitch.com/edit/#!/import/github/cobi-bike/Module-Spotify)

Glitch.com allows you to edit, host and fork Node.js applications for quick prototyping.
Follow the [installation steps 2 to 3](#installation-and-setup) and copy the environment variables to the: `.env` file on Glitch.com

## Overview
This module relies on the [Spotify API](https://developer.spotify.com/web-api/) to poll and control	the current playback.
To save bandwidth the polling is done on the backend and changes will be forwarded through Websockets.

## Installation and Setup

You can easily deploy the module on your own:

### Step 1: Clone repository

Clone this repository and install Node.js dependencies with:

``` bash
npm install
```  


### Step 2: Create a Spotify app 

Create a [Spotify Developer account](https://beta.developer.spotify.com/dashboard/applications) and register a new application to retrieve your api credentials.

You also have to register one or more callback urls in the Spotify Developer backend, for example: `http://localhost:3000/callback`


### Step 3: Set environment variables

Set the environment variable `CLIENT_ID`, `CLIENT_SECRET` and `HOST` with your api credentials from spotify. `HOST` defines the url basename to the backend server, for example: `HOST='http://localhost:3000'`


### Step 4: Run Node.js server

The module is accessible under [localhost:3000](http://localhost:3000/) after starting the Node.js server with:
``` bash
CLIENT_ID=... CLIENT_SECRET=... HOST=... node index.js
```  
The settings menu can be accessed with the [?state=edit](http://localhost:3000/?state=edit) suffix.


### _Optional_: Install COBI.bike DevKit Simulator

Follow the [instructions](https://github.com/cobi-bike/DevKit#-test-your-module) to install the COBI.bike Google Chrome Simulator and get familiar with the basics of module development on the COBI platform.

---

## Credits
This module uses Open Source components. You can find the source code of their open source projects along with license information below. We acknowledge and are grateful to these developers for their contributions to open source.

* [Spotify Player](https://github.com/JMPerez/spotify-player) by José M. Pérez (MIT)
* [Spotify-Conect-WS](https://github.com/lrholmes/spotify-connect-ws/) by Lawrence Holmes (MIT)


## Useful DevKit links

* [Debugging Tips & Tricks](https://github.com/cobi-bike/DevKit#debugging-tips--tricks)
* [Inspiration & Examples](https://github.com/cobi-bike/DevKit#inspiration--examples)
* [Interface Guidelines](https://github.com/cobi-bike/DevKit#interface-guidelines)
* [More DevKit Resources](https://github.com/cobi-bike/DevKit#inspiration--examples)
* [Other Tools & Resources](https://github.com/cobi-bike/DevKit#other-tools--resources)


## Contributing to this project

Anyone and everyone is welcome to contribute to this project, the [DevKit Simulator](https://github.com/cobi-bike/DevKit-Simulator) and the [DevKit UI Components](https://github.com/cobi-bike/DevKit-UI). Please take a moment to review the [guidelines for contributing](https://github.com/cobi-bike/DevKit/blob/master/CONTRIBUTING.md).

* [Bug reports](https://github.com/cobi-bike/DevKit/blob/master/CONTRIBUTING.md#bugs)
* [Feature requests](https://github.com/cobi-bike/DevKit/blob/master/CONTRIBUTING.md#features)
* [Pull requests](https://github.com/cobi-bike/DevKit/blob/master/CONTRIBUTING.md#pull-requests)

Copyright © 2018 COBI.bike GmbH
