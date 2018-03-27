
class WebsocketSpotifyPlayer extends SpotifyPlayer {

  constructor(options = {}) {
    super(options);
    this.socket = io('https://spotify-connect-ws.herokuapp.com/connect')
  }

  // Also allow to register websocket events
  on(eventType, callback) {
    super.on(eventType, callback);
    this.socket.on(eventType, callback);
  }

  // When new token is issued, forward to websocket
  _onNewAccessToken() {
    super._onNewAccessToken();
    if (this.accessToken !== '') {
      this.socket.emit('initiate', { accessToken: spotifyPlayer.accessToken })
    }
  }

  play() {
    this.socket.emit('play');
  }

  pause() {
    this.socket.emit('pause');
  }

  next() {
    this.socket.emit('next_track');
  }

  previous() {
    this.socket.emit('previous_track');
  }
}

