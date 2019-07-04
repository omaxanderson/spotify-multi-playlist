import axios from 'axios';
import { get } from 'lodash';
import IPlaylist from '../interfaces/IPlaylist';
import IPlaylistTracks from '../interfaces/IPlaylistTracks';
import ITrack from '../interfaces/ITrack';
import IPlaylistTrack from '../interfaces/IPlaylistTrack';

export default class Playlist {

   static getPlaylistTracks = async (playlistId: string, accessToken: string): Promise<Array<ITrack>> => {
      try {
         const result = await axios.get(
            `https://api.spotify.com/v1/playlists/${playlistId}/tracks?access_token=${accessToken}`
         );
         console.log('RESULT', result);
         const tracks: Array<IPlaylistTrack> = get(result, 'data.items', []);
         return tracks.map(t => t.track);
      } catch (e) {
         console.log('FAILED', e);
         return e;
      }
   }

   static getPlaylist = async (playlistId: string, accessToken: string): Promise<IPlaylist> => {
      try {
         const result = await axios.get(
            `https://api.spotify.com/v1/playlists/${playlistId}?access_token=${accessToken}`
         );
         const playlist: IPlaylist = get(result, 'data', {});
         return playlist;
      } catch (e) {
         return e;
      }
   }
}
