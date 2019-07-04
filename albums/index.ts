import axios from 'axios';
import get from 'lodash/get';
import ITrack from '../interfaces/ITrack';
import Album from '../services/Album';

export default async (fastify, opts) => {
   fastify.get('/albums/:albumId', async (req, res) => {
      const { access_token } = req.session;
      const { albumId } = req.params;

      const album: Array<ITrack> = await Album.getAlbumTracks(albumId, access_token);

      res.send(album);
   });
};
