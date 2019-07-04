import axios from 'axios';
import { get } from 'lodash';
import IArtist from '../interfaces/IArtist';
import ITrack from '../interfaces/ITrack';

export default class Artist {
   static getArtist = async (artistId: string, accessToken: string): Promise<IArtist> => {
      try {
         const result = await axios.get(`https://api.spotify.com/v1/artists/${artistId}?access_token=${accessToken}`);
         const artist: IArtist = get(result, 'data', {});
         return artist;
      } catch (e) {
         return e;
      }
   }

   static getArtistTopTracks = async (artistId: string, accessToken: string): Promise<Array<ITrack>> => {
      try {
         const result = await axios.get(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?country=US&access_token=${accessToken}`);
         const tracks: Array<ITrack> = get(result, 'data.tracks', []);
         return tracks;
      } catch (e) {
         return e;
      }
   }
}
