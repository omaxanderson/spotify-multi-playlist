import fastify from 'fastify';
import _ from 'lodash';
import pov from 'point-of-view';
import pug from 'pug';
import { inspect } from 'util';
import axios from 'axios';
import fastifySession from 'fastify-session';
import fastifyCookie from 'fastify-cookie';

const f = fastify({
   logger: {
      prettyPrint: true,
   }
});

f.register(fastifyCookie);
f.register(fastifySession, {
   secret: 'e59a7b781745ac15455de026297f024742209f17',
   cookie: {
      secure: false,
      maxAge: 3600000,
   },
   resave: false,
   saveUninitialized: true,
});

f.register(pov, {
   engine: {
      pug
   },
   templates: 'views',
});

f.addHook('preHandler', (req, res, next) => {
   const { url } = req.raw;
   if ([
         '/playlists',
         '/pug',
         '/',
         '/play',
         '/devices',
      ].includes(url.split('?')[0])) {
      if (!req.session.access_token) {
         res.redirect('/login');
         return;
      }
   }
   next();
});

// check for session access token
const isAuthed = (req, res, next) => {
   if (!req.session.access_token) {
      res.redirect('/login');
   } else {
      next();
   }
}

f.get('/pug', (req, res) => {
   res.view('test.pug');
});

f.get('/', async (req, res) => {
   const { access_token } = req.session;
   if (!access_token) {
      // watch out for redirect loop??
      res.redirect('/login');
      return;
   }
   res.send('home page');
});

f.get('/devices', async (req, res) => {
   const { access_token } = req.session;
   const devices = await axios.get(
      `https://api.spotify.com/v1/me/player/devices?access_token=${access_token}`
   );
   res.send({ devices: devices.data });
});

f.put('/play', async (req, res) => {
   const { access_token } = req.session;
   const { body } = req;

   // get the tracks from the relevant playlists
   const promises = body.map(playlist => (axios.get(
      `https://api.spotify.com/v1/playlists/${playlist.id}/tracks?access_token=${access_token}`,
   )));
   const results = await Promise.all(promises);
   // const uris = _.shuffle(_.flatten(results.map(playlist => playlist.data.items.map(obj => (obj.track.uri)))));
   const uris = results.map(playlist => playlist.data.items.map(obj => (obj.track.uri)));
   const holyLodashMethods = _.compact(_.flatten(_.zip(...uris.map(u => _.shuffle(u)))));
   const result = await axios({
      method: 'PUT',
      url: 'https://api.spotify.com/v1/me/player/play',
      headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${access_token}`,
      },
      data: {
         uris: holyLodashMethods,
      },
   });
   res.send(200);
});

f.get('/play/:context_uri/:deviceId', async (req, res) => {
   const { access_token } = req.session;
   const { context_uri, deviceId } = req.params;
   console.log('context_uri', context_uri);
   console.log('deviceId', deviceId);
   const request = await axios({
      method: 'PUT',
      url: `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
      headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${access_token}`,
      },
      data: {
         context_uri
      },
   });

});

f.get('/playlists/:playlistId', async (req, res) => {
   const { access_token } = req.session;
   const { playlistId } = req.params;
   const tracks = await axios.get(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100&access_token=${access_token}`
   );
   res.send({ tracks: tracks.data.items.map(({track}) => ({name: track.name, uri: track.uri}) )});
});

f.get('/playlists', async (req, res) => {
   const { access_token } = req.session;
   const { getAll } = req.query;
   console.log(access_token);
   const playlists = [];
   let next = `https://api.spotify.com/v1/me/playlists?limit=50`;
   do {
      const result = await axios.get(`${next}&access_token=${access_token}`);
      playlists.push(...result.data.items);
      next = result.data.next;
   } while (next && getAll);
   res.send(playlists.map(({ id, name, uri }) => ({id, name, uri })));
});

f.get('/login', async (req, res) => {

   if (req.session.access_token) {
      res.redirect('/');
      return;
   }

   if (req.session.refresh_token) {
      // TODO work out the refresh token logic
   }

   // need to authenticate
   const scopes = [
      'user-modify-playback-state',
      'user-read-playback-state',
      'user-read-private',
      'playlist-read-private',
      'user-read-email'
   ].join(' ');
   const redirect_uri = 'http://localhost:5001/authenticate';
   res.redirect('https://accounts.spotify.com/authorize?'
      + 'response_type=code'
      + `&client_id=${process.env.SPOTIFY_CLIENT_ID}`
      + `&scope=${encodeURIComponent(scopes)}`
      + `&redirect_uri=${encodeURIComponent(redirect_uri)}`);
});

// The redirect route coming back from the spotify /authorize call
// Should never be called directly
// TODO see whether fastify can restrict who a call is coming from
f.get('/authenticate', async (req, res) => {
   const {
      error,
      code,
      state,
   } = req.query;
   if (code) {

      const data = {
         grant_type: 'authorization_code',
         code,
         redirect_uri: 'http://localhost:5001/authenticate',
         client_id: process.env.SPOTIFY_CLIENT_ID,
         client_secret: process.env.SPOTIFY_CLIENT_SECRET,
      };

      const result = await axios({
         method: 'POST',
         url: 'https://accounts.spotify.com/api/token',
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
         },
         data,
         transformRequest: [
            // just puts the object into a url-encoded format
            data => Object.keys(data).map(key => `${key}=${data[key]}`).join('&'),
         ],
      });

      if (result.status === 200) {
         const {
            access_token,
            refresh_token,
            expires_in,
            scope,
         } = result.data;

         // fuck yeah we've got our shit
         req.session.access_token = access_token;
         req.session.refresh_token = refresh_token;

         // TODO figure out how to redirect to previously requested enpoint
         //    probably a session variable
         res.redirect('/');
         return;
      }
   } else if (error) {
      // log in failed
   }
   res.send({ msg: 'authenticated' });
});

f.listen(5001, (err, addr) => {
   if (err) throw err;
   f.log.info(`server listening on ${addr}`);
});
