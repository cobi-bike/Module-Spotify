
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
var isLoggedIn = false;
var progress = 0;
var duration = 0;
var update_interval = 1000; // ms

// Start automatic progress loop
function progressLoop() {
  // Increase progress if track is played
  if (isPlaying) {
    progress += update_interval;
  }
  updateProgress()
}
setInterval(progressLoop, update_interval);

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
  isLoggedIn = true;

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
spotifyPlayer.on('track_end', () => {
  progress = duration;
  updateProgress();
});

// Play button pressed
spotifyPlayer.on('playback_started', () => {
  isPlaying = true;
  updatePlayPause();
});

// Pause button pressed
spotifyPlayer.on('playback_paused', () => {
  isPlaying = false;
  updatePlayPause();
});

// Skipped to new timestamp
spotifyPlayer.on('seek', new_progress => {
  progress = new_progress;
  updateProgress();
});

// Catch errors
spotifyPlayer.on('connect_error', error => {
  if (error == 'No active device' && isLoggedIn) {
    // User logged out
    // Reload page to prompt user with login again
    location.reload();
  } else {
    console.debug(error);
  }
});

// Socket connection closed by server
spotifyPlayer.on('disconnect', () => {
  // Reload page to prompt user with login again
  location.reload();
});


// Log into spotify on click
loginButton.addEventListener('click', () => {
  spotifyPlayer.login();
});

// Log out on click
logoutButton.addEventListener('click', () => {
  spotifyPlayer.logout();
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


