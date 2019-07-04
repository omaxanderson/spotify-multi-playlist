import axios from 'axios';
import _ from 'lodash';

export default async (fastify, opts) => {
   fastify.put('/play', async (req, res) => {
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
      try {
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
      } catch (e) {
         console.log(e);
         res.send(400);
      }
   });
};
