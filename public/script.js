// Get refreshToken query parameter
function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    if (pair[0] == variable) {
      return pair[1];
    }
  }
}

// Store in local storage
if (getQueryVariable('refresh_token')) {
  localStorage.setItem('refreshToken', getQueryVariable('refresh_token'));
}

var mainContainer = document.getElementById('js-main-container'),
  sideContainer = document.getElementById('side'),
  playlistContainer = document.getElementById('js-playlist-container'),
  loginContainer = document.getElementById('js-login-container'),
  loginButton = document.getElementById('js-btn-login'),
  logoutButton = document.getElementById('js-btn-logout'),
  background = document.getElementById('js-background');

// Create spotify player with backend as exchange host
var spotifyPlayer = new SpotifyPlayer({
  exchangeHost: host
});

var playlists = {};

var template = function(data) {
  return `
    <div class="main-wrapper">
      <img class="now-playing__img" src="${data.item.album.images[0].url}">
      <div class="now-playing__side" id="side">
        ${
          data.context && data.context.type == 'playlist' && playlists[data.context.uri]
            ? `<div class="now-playing__playlist">${playlists[data.context.uri]}</div>`
            : ''
        }
        <div class="now-playing__name">${data.item.name}</div>
        <div class="now-playing__artist">${data.item.artists[0].name}</div>
        <div class="now-playing__status">${data.is_playing ? 'Playing' : 'Paused'}${
    data.is_playing && data.device ? ` on ${data.device.name}` : ''
  }</div>
        <div class="progress">
          <div class="progress__bar" style="width:${data.progress_ms * 100 / data.item.duration_ms}%"></div>
        </div>
      </div>
    </div>
    <div class="background" style="background-image:url(${data.item.album.images[0].url})"></div>
  `;
};

// Show and update player ui continiously
spotifyPlayer.on('update', response => {
  mainContainer.innerHTML = template(response);
});

// Store playlists of user in array
spotifyPlayer.on('playlists', response => {
  playlists.raw = response;
  response.forEach(playlist => {
    playlists[playlist.uri] = playlist.name;
  });
});

// Hide login panel and show player after succesful authorization
spotifyPlayer.on('login', user => {
  if (user === null) {
    loginContainer.style.display = 'block';
    mainContainer.style.display = 'none';
  } else {
    logoutButton.className = logoutButton.className.replace(' disabled', '');
    loginContainer.style.display = 'none';
    mainContainer.style.display = 'block';
  }
});

// Log into spotify on click
loginButton.addEventListener('click', () => {
  spotifyPlayer.login();
});

logoutButton.addEventListener('click', () => {
  if (spotifyPlayer.isLoggedIn()) {
    spotifyPlayer.logout();
  }
});

spotifyPlayer.init();

// COBI.js

COBI.init('token');
COBI.devkit.overrideThumbControllerMapping.write(true);

// Check if where in main menu oder settings menu
if (COBI.parameters.state() == COBI.state.edit) {
  document.getElementById('experience').style.display = 'none';
} else {
  document.getElementById('edit').style.display = 'none';

  // Hook hub presses with spotify player
  COBI.hub.externalInterfaceAction.subscribe(function(action) {
    if (action == 'LEFT') spotifyPlayer.previous();
    if (action == 'RIGHT') spotifyPlayer.next();
    if (action == 'SELECT') spotifyPlayer.togglePlay();
    if (action == 'DOWN') spotifyPlayer.addCurrentToCobiPlaylist();
  });
}

