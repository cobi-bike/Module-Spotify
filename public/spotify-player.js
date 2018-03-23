class SpotifyPlayer {
  constructor(options = {}) {
    this.options = options;
    this.listeners = {};
    this.accessToken = null;
    this.exchangeHost = options.exchangeHost;
    this.obtainingToken = false;
    this.loopInterval = null;
    this.isPlaying = false;
    this.cobiPlaylistName = 'COBI - best tunes while riding the bicycle';
    this.cobiPlaylist = null;
    this.currentSongId = null;
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
      this.dispatch('login', null);
      this.logout();
    } else {
      const loop = () => {
        if (!this.obtainingToken) {
          this.fetchPlayer()
            .then(data => {
              if (data !== null && data.item !== null) {
                this.isPlaying = data.is_playing;
                this.currentSongId = data.item.id;

                this.dispatch('update', data);
              }
            })
            .catch(e => {
              console.log('Logging user out due to error', e);
              this.logout();
            });
        }
      };
      this.fetchUser().then(user => {
        this.dispatch('login', user);
        this.id = user.id;

        this.loopInterval = setInterval(loop.bind(this), 3000);
        loop();

        this.fetchPlaylists().then(playlists => {
          this.dispatch('playlists', playlists);
        });
      });
    }
  }

  logout() {
    // clear loop interval
    if (this.loopInterval !== null) {
      clearInterval(this.loopInterval);
      this.loopInterval = null;
    }
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

  login2() {
    return new Promise((resolve, reject) => {
      const getLoginURL = scopes => {
        return `${this.exchangeHost}/login?scope=${encodeURIComponent(scopes.join(' '))}`;
      };

      const url = getLoginURL([
        'user-read-playback-state',
        'user-modify-playback-state',
        'playlist-read-private',
        'playlist-read-collaborative'
      ]);

      const width = 450,
        height = 730,
        left = screen.width / 2 - width / 2,
        top = screen.height / 2 - height / 2;

      window.addEventListener(
        'message',
        event => {
          const hash = JSON.parse(event.data);
          if (hash.type == 'access_token') {
            console.log(hash);
            this.accessToken = hash.access_token;
            this.expiresIn = hash.expires_in;
            this._onNewAccessToken();
            if (this.accessToken === '') {
              reject();
            } else {
              const refreshToken = hash.refresh_token;
              localStorage.setItem('refreshToken', refreshToken);
              resolve(hash.access_token);
            }
          }
        },
        false
      );

      const w = window.open(
        url,
        'Spotify',
        'menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=' +
          width +
          ', height=' +
          height +
          ', top=' +
          top +
          ', left=' +
          left
      );
    });
  }

  fetchGeneric(url) {
    return fetch(url, {
      headers: { Authorization: 'Bearer ' + this.accessToken }
    });
  }

  fetchPlayer() {
    return this.fetchGeneric('https://api.spotify.com/v1/me/player').then(response => {
      if (response.status === 401) {
        return this.fetchToken()
          .then(tokenResponse => {
            if (tokenResponse.status === 200) {
              return tokenResponse.json();
            } else {
              throw 'Could not refresh token';
            }
          })
          .then(json => {
            this.accessToken = json['access_token'];
            this.expiresIn = json['expires_in'];
            return this.fetchPlayer();
          });
      } else if (response.status >= 500) {
        // assume an error on Spotify's site
        console.error('Got error when fetching player', response);
        return null;
      } else {
        return response.json();
      }
    });
  }

  fetchPlaylists(list, next) {
    var url = 'https://api.spotify.com/v1/me/playlists';
    if (next) url = next;

    return this.fetchGeneric(url)
      .then(response => {
        if (response.status === 401) {
          return this.fetchToken()
            .then(tokenResponse => {
              if (tokenResponse.status === 200) {
                return tokenResponse.json();
              } else {
                throw 'Could not refresh token';
              }
            })
            .then(json => {
              this.accessToken = json['access_token'];
              this.expiresIn = json['expires_in'];
              return this.fetchPlaylists();
            });
        } else if (response.status >= 500) {
          // assume an error on Spotify's site
          console.error('Got error when fetching player', response);
          return null;
        } else {
          return response.json();
        }
      })
      .then(data => {
        let playlists = data;
        let newlist = playlists;

        if (list) {
          newlist.items = list.items.concat(playlists.items);
        }

        if (playlists.next) {
          return this.fetchPlaylists(newlist, playlists.next);
        } else {
          return newlist.items;
        }
      });
  }

  fetchUser() {
    return this.fetchGeneric('https://api.spotify.com/v1/me').then(data => data.json());
  }

  isLoggedIn() {
    return this.id != null;
  }

  togglePlay() {
    if (this.isPlaying) {
      return this.pause();
    } else {
      return this.play();
    }
  }

  play() {
    return fetch('https://api.spotify.com/v1/me/player/play', {
      method: 'PUT',
      headers: { Authorization: 'Bearer ' + this.accessToken }
    });
  }

  createPlaylist(name) {
    return fetch(`https://api.spotify.com/v1/users/${this.id}/playlists`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + this.accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: name
      })
    });
  }

  createCobiPlaylist() {
    return this.createPlaylist(this.cobiPlaylistName).then(response => {
      if (response.status == 201) {
        return this.fetchPlaylists().then(playlists => {
          this.dispatch('playlists', playlists);
        });
      } else {
        return response;
      }
    });
  }

  findOrCreateCobiPlaylist() {
    function getKeyByValue(object, value) {
      return Object.keys(object).find(key => object[key] === value);
    }

    let cobiPlaylist = getKeyByValue(playlists, this.cobiPlaylistName);

    if (cobiPlaylist) {
      this.cobiPlaylist = cobiPlaylist.split(':').pop();

      return Promise.resolve();
    } else {
      console.log('not found, creating');
      return this.createCobiPlaylist().then(() => {
        return this.findOrCreateCobiPlaylist();
      });
    }

    /*
    return this.createPlaylist(this.cobiPlaylistName)
    .then((response) => {
      if (response.status == 201) {
        return this.fetchPlaylists().then((playlists) => {
          this.dispatch('playlists', playlists);                           
        })
        
      } else {
        return response;
      }
    })*/
  }
  pause() {
    return fetch('https://api.spotify.com/v1/me/player/pause', {
      method: 'PUT',
      headers: { Authorization: 'Bearer ' + this.accessToken }
    });
  }
  next() {
    return fetch('https://api.spotify.com/v1/me/player/next', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + this.accessToken }
    });
  }
  previous() {
    return fetch('https://api.spotify.com/v1/me/player/previous', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + this.accessToken }
    });
  }

  addCurrentToCobiPlaylist() {
    return this.findOrCreateCobiPlaylist().then(() => {
      return fetch(`https://api.spotify.com/v1/users/${this.id}/playlists/${this.cobiPlaylist}/tracks`, {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + this.accessToken },
        body: JSON.stringify({
          uris: [`spotify:track:${this.currentSongId}`]
        })
      });
    });
  }
}
