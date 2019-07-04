import axios from 'axios';
import get from 'lodash/get';
import ITrack from '../interfaces/ITrack';
import Artist from '../services/Artist';

export default async (fastify, opts) => {
   fastify.get('/artists/:artistId', async (req, res) => {
      const { access_token } = req.session;
      const { artistId } = req.params;

      const artist: Array<ITrack> = await Artist.getArtistTopTracks(artistId, access_token);

      res.send(artist);
   });
};
