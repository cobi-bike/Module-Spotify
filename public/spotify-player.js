class SpotifyPlayer {
  constructor(options = {}) {
    this.options = options;
    this.listeners = {};
    this.accessToken = null;
    this.exchangeHost = options.exchangeHost;
    this.obtainingToken = false;
    this.loopInterval = null;
  }

  on(eventType, callback) {
    this.listeners[eventType] = this.listeners[eventType] || [];
    this.listeners[eventType].push(callback);
  }

  dispatch(topic, data) {
    const listeners = this.listeners[topic];
    if (listeners) {
      listeners.forEach(listener => {
        listener.call(null, data);
      });
    }
  }

  init() {
    this.fetchToken()
      .then(r => r.json())
      .then(json => {
        this.accessToken = json['access_token'];
        this.expiresIn = json['expires_in'];
        this._onNewAccessToken();
      });
  }

  fetchToken() {
    this.obtainingToken = true;
    return fetch(`${this.exchangeHost}/token`, {
      method: 'POST',
      body: JSON.stringify({
        refresh_token: localStorage.getItem('refreshToken')
      }),
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    })
      .then(response => {
        this.obtainingToken = false;
        return response;
      })
      .catch(e => {
        console.error(e);
      });
  }

  _onNewAccessToken() {
    if (this.accessToken === '') {
      console.log('Got empty access token, log out');
      this.logout();
    }
  }

  logout() {
    this.accessToken = null;
    this.dispatch('login', null);
    localStorage.removeItem('refreshToken');
  }

  login() {
    return new Promise((resolve, reject) => {
      const getLoginURL = scopes => {
        return `${this.exchangeHost}/login?scope=${encodeURIComponent(scopes.join(' '))}`;
      };

      const url = getLoginURL([
        'user-read-playback-state',
        'user-modify-playback-state',
        'playlist-modify-private',
        'playlist-modify-public',
        'playlist-read-private',
        'playlist-read-collaborative'
      ]);

      const width = 450,
        height = 730,
        left = screen.width / 2 - width / 2,
        top = screen.height / 2 - height / 2;

      window.location = url;
    });
  }

  fetchGeneric(url) {
    return fetch(url, {
      headers: { Authorization: 'Bearer ' + this.accessToken }
    });
  }

}
