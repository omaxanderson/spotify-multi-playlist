import axios from 'axios';
import fs from 'fs';

export const authenticate = async (req, res) => {
   const {
      error,
      code,
      state,
   } = req.query;

   const url = process.env.URL;

   // This flow is used when the spotify service comes back
   if (code) {
      const data = {
         grant_type: 'authorization_code',
         code,
         redirect_uri: `http://${url}/authenticate`,
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

         // can't for the life of me figure out why i can't make this a promise we don't have
         // to use await for...
         const me = await axios.get(`https://api.spotify.com/v1/me?access_token=${access_token}`)
         console.log('setting spotify user_id', me.data.id);
         req.session.spotify_user_id = me.data.id;

         console.log('access', access_token);
         console.log('refresh', refresh_token);

         // TODO figure out how to redirect to previously requested enpoint
         //    probably a session variable
         res.redirect('/');
         return;
      }
   } else if (req.session.refresh_token) {
      console.log('using refresh_token');
      const data = {
         grant_type: 'refresh_token',
         refresh_token: req.session.refresh_token,
         redirect_uri: `http://${url}/authenticate`,
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

      const { access_token, refresh_token } = result.data;
      // fuck yeah we've got our shit
      req.session.access_token = access_token;
      if (refresh_token) {
         req.session.refresh_token = refresh_token;
      }

      return {success: Boolean(access_token)};
   } else if (error) {
      // log in failed
   }
};

export const login = async (req, res) => {
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

   const redirect_uri = `http://${url}/authenticate`;
   res.redirect('https://accounts.spotify.com/authorize?'
      + 'response_type=code'
      + `&client_id=${process.env.SPOTIFY_CLIENT_ID || 'ughstupiddockersecrets'}`
      + `&scope=${encodeURIComponent(scopes)}`
      + `&redirect_uri=${encodeURIComponent(redirect_uri)}`);
};
