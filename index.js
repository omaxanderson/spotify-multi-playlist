import fastify from 'fastify';
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

f.addHook('preHandler', (req, res, next) => {
   console.log('session', req.session);
   req.session.user = { name: 'max' };
   next();
});

f.get('/login', async (req, res) => {
   // console.log(req.session);
   // @TODO come back to this one to get sessions working correctly...
   if (req.session.access_token) {
      console.log('FUCK YEAH WE\'RE USING THE SESSION');
      // try to just get the playlists here...
      const playlists = await axios.get('https://api.spotify.com/v1/me/playlists?access_token=' + req.session.access_token);
      // console.log('user', req.session.user);
      // console.log('not attempting to authenticate');
      res.send({ playlists: playlists.data });
      return;
   }
   // need to authenticate
   // console.log('need to authenticate');
   const scopes = 'user-read-private playlist-read-private user-read-email';
   const redirect_uri = 'http://localhost:5001/good';
   res.redirect('https://accounts.spotify.com/authorize?'
      + 'response_type=code'
      + `&client_id=${process.env.SPOTIFY_CLIENT_ID}`
      + `&scope=${encodeURIComponent(scopes)}`
      + `&redirect_uri=${encodeURIComponent(redirect_uri)}`);
   res.send({ hello: 'world' });
});

f.get('/good', async (req, res) => {
   const {
      error,
      code,
      state,
   } = req.query;
   if (code) {
      // console.log('sending refresh token request...');
      // authenticated, request refresh token
      const data = {
         grant_type: 'authorization_code',
         code,
         redirect_uri: 'http://localhost:5001/good',
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
         console.log('expires_in', expires_in);

         // console.log('access_token', access_token);
         // console.log('refresh_token', refresh_token);
         // console.log('expires_in', expires_in);
         // console.log('scope', scope);

         const playlists = await axios.get('https://api.spotify.com/v1/me/playlists?access_token=' + access_token);
         // console.log('user', req.session.user);
         res.send({
            playlists: playlists.data.items.map(playlist => ({ id: playlist.id, name: playlist.name })),
         });
         return;
      }
   } else if (error) {
      // log in failed
      // console.log('log in failed:', error);
      // console.log('state', state);
   }
   res.send({ msg: 'authenticated' });
});

f.listen(5001, (err, addr) => {
   if (err) throw err;
   f.log.info(`server listening on ${addr}`);
});
