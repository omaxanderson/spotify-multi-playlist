import axios from 'axios';
import { get } from 'lodash';

class Playlist {
   const tracksEndpoint = 'https://api.spotify.com/playlist'
   static function getPlaylistTracks(playlistId, accessToken) {
      const result = axios.get(`${tracksEndpoint}/${playlistId}/tracks?access_token=${accessToken}`);
      return get(result, 'data.items', []);
   }
}
