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
import Playlist from './playlists/Playlist';
import User from './users/User';
import Album from './albums/Album';
import Artist from './artists/Artist';
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
import playerRoutes from './player';

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
f.register(playerRoutes);

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

f.get('/info', (req, res) => {
   res.view('info.pug');
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


// For simpler debugging
f.get('/d', async (req, res) => {
   req.session.access_token = 'invalid access token';
   res.send({success: 'true'});
});

f.get('/search', async (req, res) => {
   // console.log('PARMS', req.query);
   const { q, type } = req.query;
   const { access_token } = req.session;
   try {
      const result = await axios.get(`https://api.spotify.com/v1/search?q=${q}&type=${type || 'album,artist,playlist,track'}&access_token=${access_token}`);
      res.send(result.data);
   } catch (e) {
      const { response, request, message } = e;
      if (response) {
         res.status(response.status);
         res.send(response.data);
         return;
      } else if (request) {
         // do something else i guess
         res.send({ message: 'no response received' });
         return;
      } else {
         res.send({ message });
         return;
      }
   }
});

f.listen(5001, '0.0.0.0', (err, addr) => {
   if (err) throw err;
   f.log.info(`server listening on ${addr}`);
});
