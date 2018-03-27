
var loginContainer = document.getElementById('js-login-container');
var mainContainer = document.getElementById('js-main-container');
var loginButton = document.getElementById('js-btn-login');
var logoutButton = document.getElementById('js-btn-logout');
var playerImage = document.getElementsByClassName('now-playing__img')[0];
var playerBackgroundImage = document.getElementsByClassName('background')[0];
var playerTitle = document.getElementsByClassName('now-playing__name')[0];
var playerArtist = document.getElementsByClassName('now-playing__artist')[0];
var playerStatus = document.getElementsByClassName('now-playing__status')[0];
var playerProgress = document.getElementsByClassName('progress__bar')[0];

// Create spotify player with backend as exchange host
var spotifyPlayer = new WebsocketSpotifyPlayer({
  exchangeHost: host
});


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
  // Update view
  updateTrack(player.item);
  progress = player.progress_ms;
  duration = player.item.duration_ms;
  updateProgress();
  isPlaying = player.is_playing
  updatePlayPause();

  // Show player
  logoutButton.className = logoutButton.className.replace(' disabled', '');
  loginContainer.style.display = 'none';
  mainContainer.style.display = 'block';
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


// Log into spotify on click
loginButton.addEventListener('click', () => {
  spotifyPlayer.login();
});

// Log out on click
logoutButton.addEventListener('click', () => {
  if (spotifyPlayer.isLoggedIn()) {
    spotifyPlayer.logout();
  }
});

// Request token and connect with websocket
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
    if (action == 'SELECT') isPlaying ? spotifyPlayer.pause() : spotifyPlayer.play();
  });
}


