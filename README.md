# Spotify DevKit module for COBI.bike

The Spotify DevKit module allows the user to control the Spotify-Player remotely using the Spotify connect protocol.
Its part of a collection of Open Source [modules](https://cobi.bike/devkit) for the [COBI.bike](https://cobi.bike) system.

<img src="https://cdn.cobi.bike/static/devkit-assets/github/DevKit_module_Spotify.jpg" width="500px" alt="COBI.bike Spotify module">

## Quickstart: Interactive Demo

The quickest way to test the module:

[<img src="https://cdn.cobi.bike/static/devkit-assets/github/open_demo_button.png" width="170px" alt="Open demo button">](https://glitch.com/edit/#!/import/github/cobi-bike/Module-Spotify)

## Installation and Setup

You can easily deploy the module on your own:

### Step 1: Clone repository

Clone this repository and install Node.js dependencies with:

``` bash
npm install
```  

### Step 2: Install COBI.bike DevKit

Follow the [instructions](https://github.com/cobi-bike/DevKit#-test-your-module) to install the COBI.bike Google Chrome Simulator and get familiar with the basics of module development on the COBI plattform.

### Step 3: Create a Spotify app 

Create a [Spotify Developer account](https://beta.developer.spotify.com/dashboard/applications) and register a new application to retrieve your api credentials.

You also have to register one or more callback urls in the Spotify Developer backend, for example: `http://localhost:3000/callback`


### Step 4: Set environment variables

Set the environment variable `CLIENT_ID`, `CLIENT_SECRET` and `HOST` with your api credentials from spotify. `HOST` defines the url basename to the backend server, for example: `HOST='http://localhost:3000'`


### Step 5: Run Node.js server

The app is accessible under [localhost:8888](http://localhost:8888/) after starting the Node.js server with:
``` bash
PORT=8888 CLIENT_ID=... CLIENT_SECRET=... HOST=... node index.js
```  
The settings menu can be accessed with the [?state=edit](http://localhost:8888/?state=edit) suffix.


## Useful DevKit links

* [Debugging Tips & Tricks](https://github.com/cobi-bike/DevKit#debugging-tips--tricks)
* [Inspiration & Examples](https://github.com/cobi-bike/DevKit#inspiration--examples)
* [Interface Guidelines](https://github.com/cobi-bike/DevKit#interface-guidelines)
* [More DevKit Resources](https://github.com/cobi-bike/DevKit#inspiration--examples)
* [Other Tools & Resources](https://github.com/cobi-bike/DevKit#other-tools--resources)


## Contributing to this project

Anyone and everyone is welcome to contribute to this project, the [DevKit Simulator](https://github.com/cobi-bike/DevKit-Simulator) and the [COBI.bike DevKit UI Components](https://github.com/cobi-bike/DevKit-UI). Please take a moment to review the [guidelines for contributing](https://github.com/cobi-bike/DevKit/blob/master/CONTRIBUTING.md).

* [Bug reports](https://github.com/cobi-bike/DevKit/blob/master/CONTRIBUTING.md#bugs)
* [Feature requests](https://github.com/cobi-bike/DevKit/blob/master/CONTRIBUTING.md#features)
* [Pull requests](https://github.com/cobi-bike/DevKit/blob/master/CONTRIBUTING.md#pull-requests)

Copyright © 2018 COBI.bike GmbH
