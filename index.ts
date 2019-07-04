import fastify from 'fastify';
import _ from 'lodash';
// import { authenticate, login } from './authenticate';
import pov from 'point-of-view';
import pug from 'pug';
import path from 'path';
import { inspect } from 'util';
import axios from 'axios';
import fastifySession from 'fastify-session';
import fastifyCookie from 'fastify-cookie';
import fastifyStatic from 'fastify-static';
import Playlist from './services/Playlist';
import User from './services/User';
import Album from './services/Album';
import Artist from './services/Artist';
import IPlaylist from './interfaces/IPlaylist';
import IPlaylistTracks from './interfaces/IPlaylistTracks';
import IUserPlaylists from './interfaces/IUserPlaylists';
import IUser from './interfaces/IUser';
import IAlbum from './interfaces/IAlbum';
import IArtist from './interfaces/IArtist';
import ITrack from './interfaces/ITrack';

import playlistRoutes from './playlists';
import userRoutes from './users';
import albumRoutes from './albums';
import artistRoutes from './artists';

const f = fastify({
   logger: {
      prettyPrint: true,
   }
});

f.register(fastifyStatic, {
   root: path.join(__dirname, 'public'),
});

f.register(fastifyCookie);
f.register(fastifySession, {
   secret: 'e59a7b781745ac15455de026297f024742209f17',
   cookie: {
      secure: false,
      maxAge: 3600000,
   },
   saveUninitialized: true,
});

f.register(pov, {
   engine: {
      pug
   },
   templates: 'views',
   options: {
      views: 'views',
      filename: 'views/test.pug',
   }
});

// Register the playlist routes
f.register(playlistRoutes);
f.register(userRoutes);
f.register(artistRoutes);
f.register(albumRoutes);

f.addHook('preHandler', (req, res, next) => {
   const { url } = req.raw;
   if (![
      '/login',
      '/authenticate',
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

/* ============= REMOVE THESE ROUTES ============== */
   /*
f.get('/refresh', async (req, res) => {
   const result = await authenticate(req, res);
   res.send(result);
});
*/

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
   res.view('test.pug');
});

f.get('/test', async (req, res) => {
   const { access_token } = req.session;
   const { body } = req;
   const playlists: Array<IPlaylist> = await User.getUserPlaylists('o_max_anderson', access_token, 72);
   res.send(playlists.length);
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

   const playlists = body.filter(item => item.type === 'playlist');
   const albums = body.filter(item => item.type === 'album');
   const tracks = body.filter(item => item.type === 'track');
   const artists = body.filter(item => item.type === 'artist');

   const playlistPromises = playlists.map(p => axios.get(
      `https://api.spotify.com/v1/playlists/${p.id}/tracks?access_token=${access_token}`
   ));
   const artistPromises = artists.map(a => axios.get(
      `https://api.spotify.com/v1/artists/${a.id}/top-tracks?access_token=${access_token}&country=US`
   ));
   const albumPromises = albums.map(a => axios.get(
      `https://api.spotify.com/v1/albums/${a.id}/tracks?access_token=${access_token}&limit=50`
   ));

   const playlistTracks = await Promise.all(playlistPromises);
   const artistTracks = await Promise.all(artistPromises);
   const albumTracks = await Promise.all(albumPromises);

   const albumUris = _.flatten(albumTracks.map(({data}) => data.items)).map(t => t.uri);
   const playlistUris = _.flatten(playlistTracks.map(({data}) => data.items)).map(({track}) => track.uri);
   const artistUris = _.flatten(artistTracks.map(({data}) => data.tracks)).map(t => t.uri);
   const trackUris = tracks.map(({uri}) => uri);

   // TODO figure out why this isn't working great
   const holyLodashMethods = _.shuffle([...albumUris, ...playlistUris, ...artistUris, ...trackUris]);

   // console.log('a', albumUris);
   // console.log('a2', artistUris);

   // console.log(dataObjects);
   // const objects = results.map(result => ({ items: result.data.items, type: result.data.type }));
   // console.log('objects', objects);

   /*
   const results = await Promise.all(
      playlistPromises,
      artistPromises,
      albumsPromises
   );
   /*
   console.log('playlistTracks', playlistTracks);
   console.log('artistTracks', artistTracks);
   console.log('albumsTracks', albumTracks);
   console.log('results', results);
   // const uris = _.shuffle(_.flatten(results.map(playlist => playlist.data.items.map(obj => (obj.track.uri)))));
   const uris = results.map(playlist => playlist.data.items.map(obj => (obj.track.uri)));
   console.log('uris', uris);

   const holyLodashMethods = _.compact(_.flatten(_.zip(...uris.map(u => _.shuffle(u)))));

*/
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
   // console.log('context_uri', context_uri);
   // console.log('deviceId', deviceId);
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

// For simpler debugging
f.get('/d', async (req, res) => {
   req.session.access_token = 'invalid access token';
   res.send({success: 'true'});
});

f.get('/search', async (req, res) => {
   // console.log('PARMS', req.query);
   const { q, type } = req.query;
   const { access_token } = req.session;
   const result = await axios.get(`https://api.spotify.com/v1/search?q=${q}&type=${type || 'album,artist,playlist,track'}&access_token=${access_token}`);
   res.send(result.data);
});

f.listen(5001, '0.0.0.0', (err, addr) => {
   if (err) throw err;
   f.log.info(`server listening on ${addr}`);
});
