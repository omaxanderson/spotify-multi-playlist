import axios from 'axios';
import _ from 'lodash';
import { playSchema } from './schemas';
import Artist from '../artists/Artist';
import Album from '../albums/Album';
import Playlist from '../playlists/Playlist';
import IPlaylistTracks from '../interfaces/IPlaylistTracks';
import ITrack from '../interfaces/ITrack';

interface IPlayObject {
   id: string;
   name: string;
   uri: string;
   type: string;
}

export default async (fastify, opts) => {
   fastify.put('/play', { schema: playSchema }, async (req, res) => {
      const { access_token } = req.session;
      const { body } = req;

      const playlists: Array<IPlayObject> = body.filter(item => item.type === 'playlist');
      const albums: Array<IPlayObject> = body.filter(item => item.type === 'album');
      const tracks: Array<IPlayObject> = body.filter(item => item.type === 'track');
      const artists: Array<IPlayObject> = body.filter(item => item.type === 'artist');

      const playlistPromises: Array<Promise<Array<ITrack>>> = playlists.map(p => Playlist.getPlaylistTracks(p.id, access_token));
      const albumPromises: Array<Promise<Array<ITrack>>> = albums.map(a => Album.getAlbumTracks(a.id, access_token));
      const artistPromises: Array<Promise<Array<ITrack>>> = artists.map(a => Artist.getArtistTopTracks(a.id, access_token));

      const playlistObjects: Array<Array<ITrack>> = await Promise.all(playlistPromises);
      const albumObjects: Array<Array<ITrack>> = await Promise.all(albumPromises);
      const artistObjects: Array<Array<ITrack>> = await Promise.all(artistPromises);


      // for ease of use, maybe allow a parameter object to Playlist.getPlaylistTracks to specify columns we want
      const playlistUris: Array<Array<string>> = playlistObjects.map(arr => _.shuffle(arr).map(({ uri }) => uri));
      const albumUris: Array<Array<string>> = albumObjects.map(arr => _.shuffle(arr).map(({uri}) => uri));
      const artistUris: Array<Array<string>> = artistObjects.map(arr => _.shuffle(arr).map(({ uri }) => uri));
      const trackUris: Array<Array<string>> = [tracks.map(({uri}) => uri)];

      const max = [playlistUris, albumUris, artistUris, trackUris].reduce((maxLen, arr) => arr.length > maxLen ? arr.length : maxLen, 0);

      const test = [];
      for (let i = 0; i < max; i++) {
         if (playlistUris.length > i) {
            test.push(playlistUris[i]);
         }
         if (albumUris.length > i) {
            test.push(albumUris[i]);
         }
         if (artistUris.length > i) {
            test.push(artistUris[i]);
         }
         if (trackUris.length > i) {
            test.push(trackUris[i]);
         }
      }

      const flattened = _.compact(_.flatten(_.zip(...test)));
      try {
         // Change shuffle to off
         const toggleShuffle = await axios({
            method: 'PUT',
            url: 'https://api.spotify.com/v1/me/player/shuffle?state=false',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${access_token}`,
            },
         });
         const result = await axios({
            method: 'PUT',
            url: 'https://api.spotify.com/v1/me/player/play',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${access_token}`,
            },
            data: {
               uris: flattened,
            },
         });

         res.send(200);
      } catch (e) {
         const { response, request, message } = e;
         if (response) {
            res.status(response.status);
            res.send(response.data);
            return;
         }
         console.log(e);
         res.send();
      }
   });

   fastify.get('/play/:context_uri/:deviceId', async (req, res) => {
      const { access_token } = req.session;
      const { context_uri, deviceId } = req.params;
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

   fastify.get('/devices', async (req, res) => {
      const { access_token } = req.session;
      const devices = await axios.get(
         `https://api.spotify.com/v1/me/player/devices?access_token=${access_token}`
      );
      res.send({ devices: devices.data });
   });
};
