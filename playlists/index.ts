import User from '../users/User';
import axios from 'axios';
import { get } from 'lodash';
import IPlaylist from '../interfaces/IPlaylist';

export default async (fastify, opts) => {
   fastify.get('/playlists/:playlistId', async (req, res) => {
      const { access_token } = req.session;
      const { playlistId } = req.params;
      const tracks = await axios.get(
         `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100&access_token=${access_token}`
      );
      res.send({ tracks: tracks.data.items.map(({track}) => ({name: track.name, uri: track.uri}) )});
   });

   fastify.get('/playlists', async (req, res) => {
      const { access_token } = req.session;
      const { getAll } = req.query;

      console.log(access_token);
      // we're gonna need to update this if we add the ability to search other users' playlists
      const playlists: Array<IPlaylist> = await User.getUserPlaylists('', access_token, -1);

      // TODO add metadata to the response
      //    Also going to need to update the client logic to account for change from [] to {}
      res.send(playlists.map(({ id, name, uri }) => ({id, name, uri })));
   });
}
