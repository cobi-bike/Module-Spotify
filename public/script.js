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
var spotifyPlayer = new WebsocketSpotifyPlayer({
  exchangeHost: host
});

var playlists = {};

var playerImage = document.getElementsByClassName('now-playing__img')[0];
var playerBackgroundImage = document.getElementsByClassName('background')[0];
var playerTitle = document.getElementsByClassName('now-playing__name')[0];
var playerArtist = document.getElementsByClassName('now-playing__artist')[0];
var playerStatus = document.getElementsByClassName('now-playing__status')[0];
var playerProgress = document.getElementsByClassName('progress__bar')[0];

var isPlaying = false;
var progress = 0;
var duration = 0;

// Start automatic progress loop
function progressLoop() {
  // Increase progress if track is played
  if (isPlaying) {
    progress += 1000;
  }
  updateProgress()
  setTimeout(progressLoop, 1000);
}
progressLoop();

// Update progress bar
function updateProgress() {
  playerProgress.style.width = progress * 100 / duration + '%';  
}

// Update track information and metadata
function updateTrack(track) {
  playerTitle.innerHTML = track.name;
  playerArtist.innerHTML = track.artists[0].name;
  playerImage.src = track.album.images[0].url;
  playerBackgroundImage.style.backgroundImage = 'url(' + track.album.images[0].url + ')';
}

// Update play/pause button
function updatePlayPause() {
  playerStatus.innerHTML = isPlaying ? 'Playing' : 'Paused';
}

// Player successfullyinitialized
spotifyPlayer.on('initial_state', player => {
  updateTrack(player.item);
  progress = player.progress_ms;
  duration = player.item.duration_ms;
  updateProgress();
  isPlaying = player.is_playing
  updatePlayPause();
});

// Track changed
spotifyPlayer.on('track_change', track => {
  updateTrack(track);
  progress = 0;
  duration = track.duration_ms;
  updateProgress();
});

// Track has ended
spotifyPlayer.on('track_end', track => {
  progress = duration;
  updateProgress();
});

// Play button pressed
spotifyPlayer.on('playback_started', track => {
  isPlaying = true;
  updatePlayPause();
});

// Pause button pressed
spotifyPlayer.on('playback_paused', track => {
  isPlaying = false;
  updatePlayPause();
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


