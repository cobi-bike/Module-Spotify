// get refreshToken from query
function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) {
      return pair[1];
    }
  } 
}

if (getQueryVariable('refresh_token')) {
  localStorage.refreshToken = getQueryVariable('refresh_token')
}

var mainContainer = document.getElementById('js-main-container'),
    sideContainer = document.getElementById('side'),
    playlistContainer = document.getElementById('js-playlist-container'),
    loginContainer = document.getElementById('js-login-container'),
    loginButton = document.getElementById('js-btn-login'),
    background = document.getElementById('js-background');

var spotifyPlayer = new SpotifyPlayer({
  exchangeHost: 'https://cobi-spotify.glitch.me'
});

var playlists = {};

var template = function (data) {
  return `
    <div class="main-wrapper">
      <img class="now-playing__img" src="${data.item.album.images[0].url}">
      <div class="now-playing__side" id="side">
        ${data.context && data.context.type == 'playlist' && playlists[data.context.uri] ? `<div class="now-playing__playlist">${playlists[data.context.uri]}</div>` : ''}
        <div class="now-playing__name">${data.item.name}</div>
        <div class="now-playing__artist">${data.item.artists[0].name}</div>
        <div class="now-playing__status">${data.is_playing ? 'Playing' : 'Paused'}${data.is_playing && data.device ? ` on ${data.device.name}` : ''}</div>
        <div class="progress">
          <div class="progress__bar" style="width:${data.progress_ms * 100 / data.item.duration_ms}%"></div>
        </div>
      </div>
    </div>
    <div class="background" style="background-image:url(${data.item.album.images[0].url})"></div>
  `;
};


spotifyPlayer.on('update', response => {

  mainContainer.innerHTML = template(response);
});

spotifyPlayer.on('playlists', response => {
  playlists.raw = response
  response.forEach((playlist) => {
    playlists[playlist.uri] = playlist.name
  })

});

spotifyPlayer.on('login', user => {
  if (user === null) {
    loginContainer.style.display = 'block';
    mainContainer.style.display = 'none';
  } else {
    loginContainer.style.display = 'none';
    mainContainer.style.display = 'block';
  }
});

loginButton.addEventListener('click', () => {
    spotifyPlayer.login();
});

spotifyPlayer.init();

// COBI.js

COBI.init('token');
COBI.devkit.overrideThumbControllerMapping.write(true);

COBI.hub.externalInterfaceAction.subscribe(function(action) {
    if (action == 'LEFT') spotifyPlayer.previous();
    if (action == 'RIGHT') spotifyPlayer.next();
    if (action == 'SELECT') spotifyPlayer.togglePlay();
    if (action == 'DOWN') spotifyPlayer.addCurrentToCobiPlaylist();
});
