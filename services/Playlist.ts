import axios from 'axios';
import { get } from 'lodash';
import IPlaylist from '../interfaces/IPlaylist';
const tracksEndpoint = 'https://api.spotify.com/v1/playlists';

export default class Playlist {

   static getPlaylistTracks = async (playlistId: number, accessToken: number): Promise<IPlaylist> => {
      try {
         const result = await axios.get(
            `${tracksEndpoint}/${playlistId}/tracks?access_token=${accessToken}`
         );
         console.log('RESULT', result);
         return get(result, 'data.items', []);
      } catch (e) {
         console.log('FAILED', e);
         return e;
      }
   }

   static getPlaylist = async (playlistId: string, accessToken: string): Promise<IPlaylist> => {
      try {
         console.log(`${tracksEndpoint}/${playlistId}?access_token=${accessToken}`);
         const result = await axios.get(
            `${tracksEndpoint}/${playlistId}?access_token=${accessToken}`
         );
         const playlist: IPlaylist = get(result, 'data', {});
         return playlist;
      } catch (e) {
         return e;
      }
   }
}
